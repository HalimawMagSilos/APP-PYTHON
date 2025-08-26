import io

import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_enroll_patient():
    # Fake image file (pretend it's a face)
    file = io.BytesIO(b"fake-image-data")
    response = client.post(
        "/enroll/",
        files={"image": ("test.jpg", file, "image/jpeg")},
        data={"patient_id": "P001"},
        headers={"Authorization": "Bearer dev-api-key"}  # matches config
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "enrolled"
    assert body["patient_id"] == "P001"
