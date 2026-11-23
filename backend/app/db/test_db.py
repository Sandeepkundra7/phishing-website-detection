import sys
import os
import json
from pathlib import Path

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from backend.app.db.session import engine, SessionLocal, ACTIVE_DB_TYPE
from backend.app.models import Base, User, ScanHistory, ModelMetrics
from backend.app.db.init_db import init_db

def run_db_verification():
    print("=" * 70)
    print(" PHISHSHIELD AI — DATABASE VERIFICATION SUITE")
    print("=" * 70)
    print(f"[*] Active Database Engine: {ACTIVE_DB_TYPE}")
    print(f"[*] Target Engine URL:     {engine.url}")
    print("-" * 70)

    # 1. Initialize schema and seed data
    print("[1] Executing init_db() to build tables and seed base metrics...")
    init_db()
    print("    -> Schema created and verified.")

    db = SessionLocal()
    try:
        # 2. Verify Users Table
        user_count = db.query(User).count()
        print(f"\n[2] Checking 'users' table (Total: {user_count} records):")
        users = db.query(User).all()
        for u in users:
            print(f"    - ID: {u.id} | Username: {u.username:<15} | Email: {u.email:<30} | Created: {u.created_at}")

        # 3. Verify Model_Metrics Table
        metric_count = db.query(ModelMetrics).count()
        print(f"\n[3] Checking 'model_metrics' table (Total: {metric_count} records):")
        metrics = db.query(ModelMetrics).all()
        for m in metrics:
            print(f"    - ID: {m.id} | Model: {m.model_name:<30} | Acc: {m.accuracy}% | F1: {m.f1_score}%")

        # 4. Verify Scan_History Table
        scan_count = db.query(ScanHistory).count()
        print(f"\n[4] Checking 'scan_history' table (Total: {scan_count} records):")
        scans = db.query(ScanHistory).limit(5).all()
        for s in scans:
            user_label = s.user.username if s.user else "Anonymous"
            print(f"    - ID: {s.id} | User: {user_label:<10} | [{s.prediction.upper():^10}] | Risk: {s.risk_level:<6} | Conf: {s.confidence}% | URL: {s.url[:35]}...")

        # 5. Test Live Insertion & Query
        print("\n[5] Testing transactional CRUD operations...")
        test_url = "http://test-phishing-verification-check.xyz/login"
        first_user = db.query(User).first()
        new_scan = ScanHistory(
            user_id=first_user.id if first_user else None,
            url=test_url,
            prediction="Phishing",
            risk_level="High",
            confidence=95.5,
            features_json=json.dumps({"test_feature": 1})
        )
        db.add(new_scan)
        db.commit()
        db.refresh(new_scan)
        print(f"    -> Inserted test scan record with ID: {new_scan.id}")

        # Verify query
        retrieved = db.query(ScanHistory).filter(ScanHistory.id == new_scan.id).first()
        assert retrieved is not None, "Failed to retrieve newly inserted scan!"
        assert retrieved.url == test_url, "URL mismatch!"
        print(f"    -> Query verification PASSED (URL matches: {retrieved.url})")

        # Clean up test scan
        db.delete(retrieved)
        db.commit()
        print("    -> Cleaned up test record.")

        print("\n" + "=" * 70)
        print(" [SUCCESS] PostgreSQL/SQLAlchemy Database Setup Verified!")
        print("=" * 70)
        return True

    except Exception as e:
        print(f"\n[ERROR] Database verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = run_db_verification()
    sys.exit(0 if success else 1)
