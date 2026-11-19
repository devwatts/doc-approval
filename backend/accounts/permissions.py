from rest_framework.permissions import BasePermission

from .models import User


def role_required(role: str) -> type[BasePermission]:
    class HasRole(BasePermission):
        message = f"Only {role}s can do this."

        def has_permission(self, request, view):
            return request.user.is_authenticated and request.user.role == role

    return HasRole


IsSubmitter = role_required(User.Role.SUBMITTER)
IsReviewer = role_required(User.Role.REVIEWER)
