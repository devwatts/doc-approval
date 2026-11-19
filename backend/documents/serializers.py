from pathlib import Path

from django.conf import settings
from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    submitted_by = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    # Upload only. Downloads go through the permission-checked /download/ endpoint.
    file = serializers.FileField(write_only=True, required=False)
    file_name = serializers.CharField(read_only=True, allow_null=True)

    class Meta:
        model = Document
        fields = [
            "id", "title", "content", "file", "file_name", "status", "submitted_by",
            "reviewed_by", "review_comment", "reviewed_at", "created_at",
        ]
        # Clients can't set these. Sending {"status": "approved"} is ignored.
        read_only_fields = ["status", "review_comment", "reviewed_at", "created_at"]
        extra_kwargs = {"content": {"max_length": 20_000}}

    def validate_file(self, file):
        extension = Path(file.name).suffix.lower().lstrip(".")
        if extension not in settings.ALLOWED_UPLOAD_EXTENSIONS:
            allowed = ", ".join(sorted(settings.ALLOWED_UPLOAD_EXTENSIONS))
            raise serializers.ValidationError(f"Unsupported file type. Allowed: {allowed}.")
        if file.size > settings.MAX_UPLOAD_BYTES:
            raise serializers.ValidationError("File is too large. The limit is 5 MB.")
        return file

    def validate(self, attrs):
        if not attrs.get("content") and not attrs.get("file"):
            raise serializers.ValidationError("Provide text content, a file, or both.")
        return attrs


class ReviewSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=[Document.Status.APPROVED, Document.Status.REJECTED])
    comment = serializers.CharField(required=False, allow_blank=True, max_length=2_000, default="")
