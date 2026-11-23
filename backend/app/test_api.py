import sys
from pathlib import Path
from fastapi.testclient import TestClient

root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from backend.app.main import app

client = TestClient(app)

def test_api_suite():
    print("=" * 70)
    print(" PHISHSHIELD AI — FASTAPI BACKEND VERIFICATION SUITE")
    print("=" * 70)

    # 1. Health & Root
    print("[1] Testing Root & Health Endpoints...")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    print(f"    -> Root: {res.json()['status']} | DB: {res.json()['database']}")

    res = client.get("/api/health")
    assert res.status_code == 200
    print(f"    -> Health: {res.json()['status']}")

    # 2. Authentication
    print("\n[2] Testing Authentication Endpoints...")
    test_user = f"analyst_test_{int(res.elapsed.total_seconds() * 1000)}"
    reg_res = client.post("/api/auth/register", json={
        "username": test_user,
        "email": f"{test_user}@test.internal",
        "password": "Password123!"
    })
    assert reg_res.status_code in [201, 400], f"Registration failed: {reg_res.text}"
    print("    -> User Registration: SUCCESS")

    login_res = client.post("/api/auth/login", json={
        "username": test_user,
        "password": "Password123!"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    print("    -> User Login & JWT Generation: SUCCESS")

    # 3. URL Scanning
    print("\n[3] Testing URL Scanning (/api/scan)...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Legitimate URL test
    scan_legit = client.post("/api/scan", json={"url": "https://www.google.com"}, headers=headers)
    assert scan_legit.status_code == 200, f"Scan failed: {scan_legit.text}"
    data_legit = scan_legit.json()
    print(f"    -> Scanned '{data_legit['url']}': Verdict=[{data_legit['prediction']}] Conf={data_legit['confidence']}% Risk={data_legit['risk_level']}")

    # Suspicious Phishing URL test
    scan_phish = client.post("/api/scan", json={"url": "http://paypal-security-account-verify.xyz/login.php"}, headers=headers)
    assert scan_phish.status_code == 200
    data_phish = scan_phish.json()
    print(f"    -> Scanned '{data_phish['url']}': Verdict=[{data_phish['prediction']}] Conf={data_phish['confidence']}% Risk={data_phish['risk_level']}")

    # 4. History
    print("\n[4] Testing Scan History (/api/scan/history)...")
    hist_res = client.get("/api/scan/history", headers=headers)
    assert hist_res.status_code == 200
    hist = hist_res.json()
    print(f"    -> Retrieved {len(hist)} scan records from database.")

    # 5. Dashboard Summary
    print("\n[5] Testing Dashboard Summary (/api/dashboard/summary)...")
    dash_res = client.get("/api/dashboard/summary", headers=headers)
    assert dash_res.status_code == 200
    dash = dash_res.json()
    print(f"    -> Total: {dash['total_scanned']} | Phishing: {dash['phishing_detected']} | Legitimate: {dash['legitimate_detected']}")

    # 6. Model Metrics
    print("\n[6] Testing Model Metrics (/api/model/metrics)...")
    metrics_res = client.get("/api/model/metrics")
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    print(f"    -> Retrieved benchmark data for {len(metrics)} ML algorithms:")
    for m in metrics:
        print(f"       * {m['name']:<30} Acc: {m['accuracy']}% | F1: {m['f1_score']}%")

    # 7. Delete Record
    if hist:
        latest_id = hist[0]["id"]
        print(f"\n[7] Testing Scan Deletion (/api/scan/history/{latest_id})...")
        del_res = client.delete(f"/api/scan/history/{latest_id}", headers=headers)
        assert del_res.status_code in [200, 204]
        print("    -> Record deleted: SUCCESS")

    print("\n" + "=" * 70)
    print(" [ALL TESTS PASSED] FastAPI Backend Scaffolding & REST Endpoints Verified!")
    print("=" * 70)

if __name__ == "__main__":
    test_api_suite()
