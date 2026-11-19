import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from documents.models import Document

pytestmark = pytest.mark.django_db
DOCS = "/api/documents/"


def review(client, doc_id, **payload):
    return client.post(f"{DOCS}{doc_id}/review/", payload, format="json")


def test_submit_document_with_file(api, alice):
    upload = SimpleUploadedFile("report.pdf", b"%PDF-1.4")
    response = api(alice).post(DOCS, {"title": "Q3", "content": "Notes", "file": upload})

    assert response.status_code == 201
    assert response.data["status"] == "pending"
    assert response.data["submitted_by"]["username"] == "alice"
    assert response.data["file_name"] == "report.pdf"


@pytest.mark.parametrize(
    "payload, error_field",
    [
        ({"content": "no title"}, "title"),
        ({"title": "no content or file"}, "non_field_errors"),
        ({"title": "bad file", "file": SimpleUploadedFile("run.exe", b"MZ")}, "file"),
    ],
)
def test_invalid_submissions_return_400(api, alice, payload, error_field):
    response = api(alice).post(DOCS, payload)

    assert response.status_code == 400
    assert error_field in response.data


def test_submitter_cannot_approve_own_document(api, alice):
    api(alice).post(DOCS, {"title": "Sneaky", "content": "x", "status": "approved"})

    assert Document.objects.get().status == Document.Status.PENDING


def test_submitters_only_see_their_own_documents(api, alice, carol, make_doc):
    mine = make_doc()
    theirs = make_doc(submitted_by=carol)

    assert [d["id"] for d in api(alice).get(DOCS).data] == [mine.id]
    assert api(alice).get(f"{DOCS}{theirs.id}/").status_code == 404


def test_reviewer_sees_everything_and_can_filter(api, bob, carol, make_doc):
    pending = make_doc()
    make_doc(submitted_by=carol, status=Document.Status.APPROVED)

    assert len(api(bob).get(DOCS).data) == 2
    assert [d["id"] for d in api(bob).get(DOCS, {"status": "pending"}).data] == [pending.id]
    assert api(bob).get(f"{DOCS}counts/").data == {"pending": 1, "approved": 1, "rejected": 0}


def test_rejection_reason_reaches_the_submitter(api, alice, bob, make_doc):
    doc = make_doc()
    assert review(api(bob), doc.id, decision="rejected", comment="Needs sources").status_code == 200

    response = api(alice).get(f"{DOCS}{doc.id}/")
    assert response.data["status"] == "rejected"
    assert response.data["review_comment"] == "Needs sources"


def test_reject_without_comment_returns_400(api, bob, make_doc):
    response = review(api(bob), make_doc().id, decision="rejected")

    assert response.status_code == 400
    assert "comment" in response.data


def test_reviewing_twice_returns_409(api, bob, make_doc):
    doc = make_doc()
    review(api(bob), doc.id, decision="approved")

    assert review(api(bob), doc.id, decision="rejected", comment="oops").status_code == 409


def test_roles_are_enforced(api, alice, bob, make_doc):
    assert review(api(alice), make_doc().id, decision="approved").status_code == 403
    assert api(bob).post(DOCS, {"title": "x", "content": "y"}).status_code == 403
    assert api().get(DOCS).status_code == 401


def test_only_owner_and_reviewers_can_download(api, alice, bob, carol):
    upload = SimpleUploadedFile("report.pdf", b"%PDF-1.4")
    doc_id = api(alice).post(DOCS, {"title": "C", "file": upload}).data["id"]
    url = f"{DOCS}{doc_id}/download/"

    assert api(alice).get(url).status_code == 200
    assert api(bob).get(url).status_code == 200
    assert api(carol).get(url).status_code == 404
