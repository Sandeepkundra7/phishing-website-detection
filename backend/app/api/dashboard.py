import json
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.app.db.session import get_db
from backend.app.models.scan_history import ScanHistory
from backend.app.models.user import User
from backend.app.schemas.dashboard import DashboardSummary
from backend.app.schemas.scan import ScanHistoryItem
from backend.app.core.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard Telemetry"])

@router.get("/summary", response_model=DashboardSummary)
def get_user_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes real-time telemetry metrics strictly for the authenticated user from PostgreSQL.
    Every stat (total, phishing, legitimate, high risk, recent scans) is personal to this user.
    """
    user_filter = (ScanHistory.user_id == current_user.id)

    total = db.query(func.count(ScanHistory.id)).filter(user_filter).scalar() or 0
    phishing = db.query(func.count(ScanHistory.id)).filter(user_filter, ScanHistory.prediction == "Phishing").scalar() or 0
    legit = db.query(func.count(ScanHistory.id)).filter(user_filter, ScanHistory.prediction == "Legitimate").scalar() or 0
    high_risk = db.query(func.count(ScanHistory.id)).filter(user_filter, ScanHistory.risk_level == "High").scalar() or 0
    med_risk = db.query(func.count(ScanHistory.id)).filter(user_filter, ScanHistory.risk_level == "Medium").scalar() or 0
    low_risk = db.query(func.count(ScanHistory.id)).filter(user_filter, ScanHistory.risk_level == "Low").scalar() or 0

    avg_conf = db.query(func.avg(ScanHistory.confidence)).filter(user_filter).scalar()
    avg_conf_rounded = round(float(avg_conf), 1) if avg_conf else 0.0

    recent_records = (
        db.query(ScanHistory)
        .filter(user_filter)
        .order_by(desc(ScanHistory.scanned_at))
        .limit(8)
        .all()
    )

    recent_items = []
    for s in recent_records:
        feat = json.loads(s.features_json) if s.features_json else None
        recent_items.append(ScanHistoryItem(
            id=s.id,
            user_id=s.user_id,
            url=s.url,
            prediction=s.prediction,
            risk_level=s.risk_level,
            confidence=s.confidence,
            features=feat,
            scanned_at=s.scanned_at
        ))

    return DashboardSummary(
        username=current_user.username,
        email=current_user.email,
        total_scanned=total,
        phishing_detected=phishing,
        legitimate_detected=legit,
        high_risk_detected=high_risk,
        average_confidence=avg_conf_rounded,
        risk_distribution={
            "low": low_risk,
            "medium": med_risk,
            "high": high_risk
        },
        recent_activity=recent_items
    )
