from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        SUBMITTER = "submitter"
        REVIEWER = "reviewer"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SUBMITTER)

    @property
    def is_reviewer(self) -> bool:
        return self.role == self.Role.REVIEWER
