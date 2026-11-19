"""Creates the test accounts listed on the login page.

Fine for a demo; a real deployment would create users through an invite flow instead.
"""

from django.contrib.auth.hashers import make_password
from django.db import migrations

PASSWORD = "demo-pass-123"
USERS = [("alice", "submitter"), ("carol", "submitter"), ("bob", "reviewer")]


def create_users(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    for username, role in USERS:
        User.objects.get_or_create(
            username=username, defaults={"role": role, "password": make_password(PASSWORD)}
        )


def delete_users(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.filter(username__in=[username for username, _ in USERS]).delete()


class Migration(migrations.Migration):
    dependencies = [("accounts", "0001_initial")]

    operations = [migrations.RunPython(create_users, delete_users)]
