import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database.db import init_db

client = TestClient(app)

def setup_module():
    init_db()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_status" in data

def test_model_info():
    response = client.get("/api/model/info")
    assert response.status_code == 200
    data = response.json()
    assert "model_identifier" in data
    assert "labels" in data
    assert len(data["labels"]) > 0

def test_single_text_analysis():
    payload = {
        "text": "I am so thrilled and grateful for this incredible service!",
        "save_to_history": True
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["text"] == payload["text"]
    assert "dominant_emotion" in data
    assert "confidence" in data
    assert isinstance(data["predictions"], list)
    assert len(data["predictions"]) > 0
    # Top prediction should be joy
    assert data["dominant_emotion"] in ["joy", "surprise"]

def test_analytics_summary():
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_analyzed" in data
    assert "dominant_emotion" in data
    assert "emotion_distribution" in data
    assert data["total_analyzed"] >= 1

def test_history_list():
    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1
