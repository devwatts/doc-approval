from django.db.models import Count
from django.http import FileResponse
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsReviewer, IsSubmitter

from . import services
from .models import Document
from .serializers import DocumentSerializer, ReviewSerializer


class Conflict(APIException):
    status_code = status.HTTP_409_CONFLICT


class DocumentViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    serializer_class = DocumentSerializer

    def get_permissions(self):
        extra = {"create": [IsSubmitter], "review": [IsReviewer]}.get(self.action, [])
        return [IsAuthenticated(), *(permission() for permission in extra)]

    def get_queryset(self):
        documents = Document.objects.select_related("submitted_by", "reviewed_by")
        if getattr(self, "swagger_fake_view", False):  # schema generation, no real user
            return documents.none()
        # Submitters only see their own documents. Anyone else's returns 404,
        # so the API doesn't even reveal that it exists.
        if not self.request.user.is_reviewer:
            documents = documents.filter(submitted_by=self.request.user)
        return documents

    @extend_schema(parameters=[OpenApiParameter("status", enum=Document.Status.values)])
    def list(self, request):
        documents = self.get_queryset()
        status_filter = request.query_params.get("status")
        if status_filter:
            if status_filter not in Document.Status.values:
                raise ValidationError({"status": [f"Must be one of: {', '.join(Document.Status.values)}."]})
            documents = documents.filter(status=status_filter)
        return Response(self.get_serializer(documents, many=True).data)

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    @extend_schema(request=ReviewSerializer, responses=DocumentSerializer)
    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        document = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            document = services.review_document(document, request.user, **serializer.validated_data)
        except services.CommentRequired as error:
            raise ValidationError({"comment": [str(error)]})
        except services.InvalidTransition as error:
            raise Conflict(str(error))
        return Response(self.get_serializer(document).data)

    @extend_schema(responses={200: bytes})
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        document = self.get_object()
        if not document.file:
            raise NotFound("This document has no attached file.")
        return FileResponse(document.file.open("rb"), as_attachment=True, filename=document.file_name)

    @extend_schema(responses={200: dict})
    @action(detail=False, methods=["get"])
    def counts(self, request):
        """How many documents the caller can see in each status (for the filter tabs)."""
        rows = self.get_queryset().order_by().values("status").annotate(total=Count("id"))
        counts = {value: 0 for value in Document.Status.values}
        counts.update({row["status"]: row["total"] for row in rows})
        return Response(counts)
