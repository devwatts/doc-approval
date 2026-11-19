"""The review rules, tested directly without HTTP."""

from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

import pytest
from django.db import connections

from accounts.models import User

from documents.models import Document
from documents.services import CommentRequired, InvalidTransition, review_document

pytestmark = pytest.mark.django_db
Status = Document.Status


def test_approve_records_who_and_when(make_doc, bob):
    doc = review_document(make_doc(), bob, Status.APPROVED)

    assert doc.status == Status.APPROVED
    assert doc.reviewed_by == bob
    assert doc.reviewed_at is not None


def test_reject_requires_a_comment(make_doc, bob):
    doc = make_doc()

    with pytest.raises(CommentRequired):
        review_document(doc, bob, Status.REJECTED, "   ")

    doc.refresh_from_db()
    assert doc.status == Status.PENDING


@pytest.mark.parametrize("final_status", [Status.APPROVED, Status.REJECTED])
def test_reviewed_documents_cannot_change(make_doc, bob, final_status):
    with pytest.raises(InvalidTransition):
        review_document(make_doc(status=final_status), bob, Status.REJECTED, "changed my mind")


def test_checks_the_latest_status_not_a_stale_copy(make_doc, bob):
    # Two reviewers open the same document, and the other one approves it first.
    stale = make_doc()
    Document.objects.filter(pk=stale.pk).update(status=Status.APPROVED)

    with pytest.raises(InvalidTransition):
        review_document(stale, bob, Status.REJECTED, "too late")


@pytest.mark.django_db(transaction=True)
def test_simultaneous_reviews_keep_exactly_one_decision(make_doc, bob):
    doc = make_doc()
    second_reviewer = User.objects.create_user("dave", role=User.Role.REVIEWER)
    ready = Barrier(2)

    def review(reviewer, decision, comment):
        try:
            ready.wait(timeout=5)
            review_document(doc, reviewer, decision, comment)
            return "accepted", reviewer.pk, decision, comment
        except InvalidTransition:
            return "conflict", reviewer.pk, decision, comment
        finally:
            connections.close_all()

    with ThreadPoolExecutor(max_workers=2) as pool:
        first = pool.submit(review, bob, Status.APPROVED, "Looks good")
        second = pool.submit(review, second_reviewer, Status.REJECTED, "Needs sources")
        results = [first.result(timeout=10), second.result(timeout=10)]

    assert sorted(result[0] for result in results) == ["accepted", "conflict"]
    winner = next(result for result in results if result[0] == "accepted")
    doc.refresh_from_db()
    assert (doc.reviewed_by_id, doc.status, doc.review_comment) == winner[1:]
    assert doc.reviewed_at is not None
