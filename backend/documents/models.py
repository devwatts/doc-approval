import os
import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q


def upload_path(document: "Document", filename: str) -> str:
    # A random folder per upload so files with the same name never collide.
    return f"documents/{uuid.uuid4().hex}/{filename}"


class Document(models.Model):
    """Something submitted for review: text, a file, or both.

    Status only changes through documents.services, never directly.
    """

    class Status(models.TextChoices):
        PENDING = "pending"
        APPROVED = "approved"
        REJECTED = "rejected"

    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    file = models.FileField(upload_to=upload_path, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="documents"
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    review_comment = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        constraints = [
            models.CheckConstraint(
                condition=~Q(content="") | ~Q(file=""), name="has_content_or_file"
            ),
        ]

    def __str__(self) -> str:
        return self.title

    @property
    def file_name(self) -> str | None:
        return os.path.basename(self.file.name) if self.file else None
