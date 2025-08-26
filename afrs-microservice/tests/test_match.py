import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_match_patient():
    # Fake image file again (pretend it's the same patient)
    file = io.BytesIO(b"fake-image-data")
    response = client.post(
        "/match/",
        files={"image": ("test.jpg", file, "image/jpeg")},
        headers={"Authorization": "Bearer dev-api-key"}
    )
    assert response.status_code == 200
    body = response.json()
    assert "match" in body
    assert "score" in body
