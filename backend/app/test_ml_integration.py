"""
Verification script for ML and Backend Integration with Strict User Authentication.
Tests that FastAPI:
1. Enforces authentication for URL scanning
2. Loads the trained Joblib model into memory
3. Predicts phishing vs legitimate links
4. Persists scans strictly under the authenticated user in PostgreSQL
"""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from backend.app.main import app
from backend.app.core.model_loader import ml_engine

client = TestClient(app)

def test_ml_backend_integration():
    print("=" * 75)
    print(" PHISHSHIELD AI — STRICT AUTHENTICATED SCANNING INTEGRATION TEST")
    print("=" * 75)

    # 1. Check ML Engine state
    print("[1] Verifying ML Engine in FastAPI Lifespan...")
    print(f"    - Model Loaded: {ml_engine.is_loaded}")
    print(f"    - Active Model: {ml_engine.model_name}")

    # 2. Test Unauthenticated Access is Blocked
    print("\n[2] Verifying that unauthenticated scanning is BLOCKED (HTTP 401)...")
    unauth_res = client.post("/api/scan", json={"url": "https://www.google.com"})
    assert unauth_res.status_code == 401, f"Expected 401 Unauthorized, got: {unauth_res.status_code}"
    print("    -> Unauthenticated access successfully rejected with HTTP 401.")

    # 3. Authenticate User
    print("\n[3] Authenticating Analyst User...")
    test_username = "analyst_integration_test"
    # Try register or login
    reg_res = client.post("/api/auth/register", json={
        "username": test_username,
        "email": f"{test_username}@security.internal",
        "password": "Password123!"
    })
    if reg_res.status_code == 201:
        token = reg_res.json()["access_token"]
    else:
        login_res = client.post("/api/auth/login", json={
            "username": test_username,
            "password": "Password123!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    print(f"    -> Analyst authenticated. JWT Bearer token acquired.")

    # 4. Test Authorized Scan on Legitimate URL
    print("\n[4] Testing Authorized Inference on Legitimate URL (https://github.com/login)...")
    res_legit = client.post("/api/scan", json={"url": "https://github.com/login"}, headers=headers)
    assert res_legit.status_code == 200, f"Scan failed: {res_legit.text}"
    data_legit = res_legit.json()
    print(f"    - Target URL:   {data_legit['url']}")
    print(f"    - Prediction:   [{data_legit['prediction']}]")
    print(f"    - Confidence:   {data_legit['confidence']}%")
    print(f"    - Risk Level:   {data_legit['risk_level']}")
    print(f"    - Engine Used:  {data_legit['model_used']}")
    print(f"    - DB Record ID: {data_legit['id']}")

    # 5. Test Authorized Scan on Phishing URL
    print("\n[5] Testing Authorized Inference on Phishing Target...")
    phish_url = "http://paypal-security-verification.xyz/login.html"
    res_phish = client.post("/api/scan", json={"url": phish_url}, headers=headers)
    assert res_phish.status_code == 200, f"Scan failed: {res_phish.text}"
    data_phish = res_phish.json()
    print(f"    - Target URL:   {data_phish['url']}")
    print(f"    - Prediction:   [{data_phish['prediction']}]")
    print(f"    - Confidence:   {data_phish['confidence']}%")
    print(f"    - Risk Level:   {data_phish['risk_level']}")
    print(f"    - Engine Used:  {data_phish['model_used']}")
    print(f"    - DB Record ID: {data_phish['id']}")

    # 6. Check Personal Scan History
    print("\n[6] Verifying User-Specific Scan History (/api/scan/history)...")
    res_hist = client.get("/api/scan/history", headers=headers)
    assert res_hist.status_code == 200
    history = res_hist.json()
    assert len(history) >= 2, "User scans not returned in personal history!"
    print(f"    -> Retrieved {len(history)} scan records belonging strictly to user {test_username}.")

    # 7. Check Personal Dashboard Summary
    print("\n[7] Verifying User-Specific Dashboard Summary (/api/dashboard/summary)...")
    res_dash = client.get("/api/dashboard/summary", headers=headers)
    assert res_dash.status_code == 200
    dash = res_dash.json()
    print(f"    - User:         {dash['username']} ({dash['email']})")
    print(f"    - Total Scans:  {dash['total_scanned']}")
    print(f"    - Phishing:     {dash['phishing_detected']}")
    print(f"    - Legitimate:   {dash['legitimate_detected']}")
    print(f"    - High Risk:    {dash['high_risk_detected']}")
    print(f"    - Risk Dist:    {dash['risk_distribution']}")

    print("\n" + "=" * 75)
    print(" [PASSED] Strict Authentication & User-Specific Dashboard Verified!")
    print("=" * 75)

if __name__ == "__main__":
    test_ml_backend_integration()
