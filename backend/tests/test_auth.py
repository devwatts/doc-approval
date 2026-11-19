import pytest

pytestmark = pytest.mark.django_db


def test_login_returns_a_working_token(api, alice):
    client = api()
    response = client.post("/api/auth/login/", {"username": "alice", "password": "pw-alice"})
    assert response.status_code == 200

    client.credentials(HTTP_AUTHORIZATION=f"Token {response.data['token']}")
    assert client.get("/api/auth/me/").data["role"] == "submitter"


def test_login_with_wrong_password_fails(api, alice):
    response = api().post("/api/auth/login/", {"username": "alice", "password": "wrong"})

    assert response.status_code == 400
    assert "token" not in response.data
