"""The review workflow rules. Every status change goes through here.

    pending ──approve──▶ approved
       └─────reject────▶ rejected   (comment required)

Approved and rejected are final. ALLOWED_TRANSITIONS describes the workflow;
new transitions also need corresponding validation, API and UI behavior.
"""

from django.utils import timezone

from accounts.models import User

from .models import Document

Status = Document.Status

ALLOWED_TRANSITIONS = {
    Status.PENDING: {Status.APPROVED, Status.REJECTED},
    Status.APPROVED: set(),
    Status.REJECTED: set(),
}


class InvalidTransition(Exception):
    pass


class CommentRequired(Exception):
    pass


def review_document(document: Document, reviewer: User, decision: str, comment: str = "") -> Document:
    comment = comment.strip()
    if decision == Status.REJECTED and not comment:
        raise CommentRequired("Add a comment explaining why the document is rejected.")

    allowed_sources = [state for state, targets in ALLOWED_TRANSITIONS.items() if decision in targets]
    # Check the current status and record the entire decision in one SQL update.
    # SQLite has no row locks: select_for_update() would not protect this race.
    updated = Document.objects.filter(pk=document.pk, status__in=allowed_sources).update(
        status=decision,
        reviewed_by=reviewer,
        review_comment=comment,
        reviewed_at=timezone.now(),
    )
    document = Document.objects.get(pk=document.pk)
    if not updated:
        raise InvalidTransition(
            f"Cannot change a {document.status} document to {decision}. "
            "Only pending documents can be approved or rejected."
        )

    return document
