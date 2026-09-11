import os
import json
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas import TriageContext, EmergencySymptoms
from app.geo_priors import calculate_geographic_priors

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "BiteID FastAPI Backend"


def test_emergency_redirect_short_circuit():
    context = TriageContext(
        usState="US-VA",
        emergencyScreening=EmergencySymptoms(difficultyBreathing=True)
    )

    response = client.post(
        "/api/analyze",
        data={"context": context.model_dump_json()}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["isEmergencyRedirect"] is True
    assert "CRITICAL" in data["emergencyMessage"]
    assert len(data["rankedCandidates"]) == 0


def test_lovable_payload_format():
    # Tests direct Lovable FormData fields (environment, duration, emergency_flags)
    response = client.post(
        "/triage",
        data={
            "environment": "woods",
            "duration": "under-24h",
            "emergency_flags": json.dumps(["breathing"])
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["isEmergencyRedirect"] is True
    assert "CRITICAL" in data["emergencyMessage"]


def test_malformed_context_payload():
    response = client.post(
        "/api/analyze",
        data={"context": "INVALID_NOT_JSON"}
    )
    assert response.status_code == 400
    assert "Malformed context payload" in response.json()["detail"]


def test_missing_api_key_error(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    context = TriageContext(
        usState="US-VA",
        emergencyScreening=EmergencySymptoms()
    )

    response = client.post(
        "/api/analyze",
        data={"context": context.model_dump_json()}
    )
    assert response.status_code == 500
    assert "GEMINI_API_KEY environment variable is missing" in response.json()["detail"]


def test_payload_too_large():
    # 11 MB dummy buffer (exceeding 10MB limit)
    large_buffer = b"0" * (11 * 1024 * 1024)
    context = TriageContext(
        usState="US-VA",
        emergencyScreening=EmergencySymptoms()
    )

    response = client.post(
        "/api/analyze",
        data={"context": context.model_dump_json()},
        files={"skin_lesion_image": ("large.jpg", large_buffer, "image/jpeg")}
    )
    assert response.status_code == 400
    assert "exceeds the 10MB limit" in response.json()["detail"]


def test_geo_priors_mid_atlantic_annular_target():
    context = TriageContext(
        usState="US-VA",
        lesionMorphology="annular_target",
        emergencyScreening=EmergencySymptoms()
    )

    candidates = calculate_geographic_priors(context=context, detected_morphology="annular_target")

    top_candidate = candidates[0]
    assert top_candidate.scientificName == "Ixodes scapularis"
    assert top_candidate.probabilityScore >= 0.90
    assert top_candidate.confidence == "high"

    # Verify mosquito is capped <= 0.05
    mosquito = next(c for c in candidates if c.scientificName == "Culex / Aedes spp.")
    assert mosquito.probabilityScore <= 0.05
