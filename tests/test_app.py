import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_root_redirect():
    response = client.get("/")
    assert response.status_code == 200 or response.status_code == 307
    # Should redirect to /static/index.html
    assert "/static/index.html" in str(response.url)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_and_unregister():
    # Use a test activity and email
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Signup
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    # Check participant added
    response = client.get("/activities")
    assert email in response.json()[activity]["participants"]
    # Unregister
    response = client.post(f"/activities/{activity}/unregister", json={"activity_name": activity, "email": email})
    assert response.status_code == 200
    # Check participant removed
    response = client.get("/activities")
    assert email not in response.json()[activity]["participants"]
