import json
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.db.session import engine, SessionLocal, ACTIVE_DB_TYPE
from backend.app.models import Base, User, ScanHistory, ModelMetrics
from backend.app.core.security import get_password_hash

logger = logging.getLogger("phishshield.init_db")

def init_db(db: Session = None):
    """
    Creates all database tables and seeds initial data (benchmark metrics, sample admin).
    """
    logger.info(f"Initializing database schema on [{ACTIVE_DB_TYPE}]...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully: users, scan_history, model_metrics.")

    close_session_at_end = False
    if db is None:
        db = SessionLocal()
        close_session_at_end = True

    try:
        # 1. Seed Model Metrics if not present
        existing_metrics = db.query(ModelMetrics).count()
        if existing_metrics == 0:
            logger.info("Seeding initial benchmark metrics for 4 ML models...")
            seed_metrics = [
                ModelMetrics(
                    model_name="Random Forest Classifier",
                    accuracy=96.8,
                    precision=97.1,
                    recall=96.4,
                    f1_score=96.7,
                    confusion_matrix_json=json.dumps({"TN": 974, "FP": 29, "FN": 36, "TP": 961})
                ),
                ModelMetrics(
                    model_name="Support Vector Machine (SVM)",
                    accuracy=94.5,
                    precision=95.0,
                    recall=93.8,
                    f1_score=94.4,
                    confusion_matrix_json=json.dumps({"TN": 951, "FP": 52, "FN": 58, "TP": 939})
                ),
                ModelMetrics(
                    model_name="Decision Tree Classifier",
                    accuracy=92.3,
                    precision=91.8,
                    recall=93.1,
                    f1_score=92.4,
                    confusion_matrix_json=json.dumps({"TN": 920, "FP": 83, "FN": 71, "TP": 926})
                ),
                ModelMetrics(
                    model_name="Logistic Regression",
                    accuracy=90.7,
                    precision=91.2,
                    recall=89.9,
                    f1_score=90.5,
                    confusion_matrix_json=json.dumps({"TN": 915, "FP": 88, "FN": 98, "TP": 899})
                ),
            ]
            db.add_all(seed_metrics)
            db.commit()
            logger.info("Model metrics seeded.")

        # 2. Seed Default User if not present
        admin_user = db.query(User).filter(User.username == "analyst").first()
        if not admin_user:
            logger.info("Creating default analyst user...")
            demo_user = User(
                username="analyst",
                email="analyst@phishshield.internal",
                password_hash=get_password_hash("SecurityPass2026!")
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            logger.info(f"Default user created (username: analyst, id: {demo_user.id}).")
            admin_user = demo_user

        # Also ensure cyber_analyst alias exists
        cyber_user = db.query(User).filter(User.username == "cyber_analyst").first()
        if not cyber_user:
            demo_user2 = User(
                username="cyber_analyst",
                email="cyber_analyst@phishshield.internal",
                password_hash=get_password_hash("SecurityPass2026!")
            )
            db.add(demo_user2)
            db.commit()

        # 3. Seed Initial Demonstration Scans if empty
        existing_scans = db.query(ScanHistory).count()
        if existing_scans == 0 and admin_user:
            logger.info("Seeding demonstration scan records...")
            demo_scans = [
                ScanHistory(
                    user_id=admin_user.id,
                    url="https://github.com/login",
                    prediction="Legitimate",
                    risk_level="Low",
                    confidence=98.7,
                    features_json=json.dumps({
                        "url_length": 25,
                        "having_ip_address": 0,
                        "having_at_symbol": 0,
                        "sub_domain_count": 0,
                        "ssl_state": "HTTPS (Secure)",
                        "suspicious_tld": 0
                    })
                ),
                ScanHistory(
                    user_id=admin_user.id,
                    url="http://paypal-security-verification.xyz/login.html",
                    prediction="Phishing",
                    risk_level="High",
                    confidence=97.4,
                    features_json=json.dumps({
                        "url_length": 52,
                        "having_ip_address": 0,
                        "having_at_symbol": 0,
                        "prefix_suffix_hyphen": 1,
                        "sub_domain_count": 1,
                        "ssl_state": "HTTP (Insecure)",
                        "suspicious_tld": 1
                    })
                ),
                ScanHistory(
                    user_id=admin_user.id,
                    url="http://192.168.1.105/bank/verify-identity",
                    prediction="Phishing",
                    risk_level="High",
                    confidence=99.1,
                    features_json=json.dumps({
                        "url_length": 42,
                        "having_ip_address": 1,
                        "having_at_symbol": 0,
                        "sub_domain_count": 0,
                        "ssl_state": "HTTP (Insecure)",
                        "suspicious_tld": 0
                    })
                ),
                ScanHistory(
                    user_id=admin_user.id,
                    url="https://www.google.com/search?q=cybersecurity+defense",
                    prediction="Legitimate",
                    risk_level="Low",
                    confidence=99.2,
                    features_json=json.dumps({
                        "url_length": 56,
                        "having_ip_address": 0,
                        "having_at_symbol": 0,
                        "sub_domain_count": 1,
                        "ssl_state": "HTTPS (Secure)",
                        "suspicious_tld": 0
                    })
                )
            ]
            db.add_all(demo_scans)
            db.commit()
            logger.info("Demonstration scan records seeded.")

        logger.info("Database initialization completed successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during database initialization: {e}")
        raise e
    finally:
        if close_session_at_end:
            db.close()

if __name__ == "__main__":
    init_db()
