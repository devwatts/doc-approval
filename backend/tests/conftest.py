import pytest
from rest_framework.test import APIClient

from accounts.models import User
from documents.models import Document


@pytest.fixture(scope="session")
def django_db_modify_db_settings(django_db_modify_db_settings_parallel_suffix, tmp_path_factory):
    # Exercise concurrent connections against a real SQLite file, like local dev.
    from django.conf import settings

    settings.DATABASES["default"]["TEST"]["NAME"] = str(
        tmp_path_factory.mktemp("database") / "test.sqlite3"
    )


@pytest.fixture(autouse=True)
def test_settings(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path  # keep test uploads out of the real media folder
    settings.PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]  # fast


@pytest.fixture
def alice(db):
    return User.objects.create_user("alice", password="pw-alice", role=User.Role.SUBMITTER)


@pytest.fixture
def carol(db):
    return User.objects.create_user("carol", password="pw-carol", role=User.Role.SUBMITTER)


@pytest.fixture
def bob(db):
    return User.objects.create_user("bob", password="pw-bob", role=User.Role.REVIEWER)


@pytest.fixture
def api():
    """api(user) gives a client logged in as that user; api() is anonymous."""

    def make(user=None):
        client = APIClient()
        if user:
            client.force_authenticate(user)
        return client

    return make


@pytest.fixture
def make_doc(alice):
    def make(**fields):
        fields = {"title": "Report", "content": "Body", "submitted_by": alice, **fields}
        return Document.objects.create(**fields)

    return make
