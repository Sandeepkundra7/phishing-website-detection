import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.db.session import get_db
from backend.app.models.scan_history import ScanHistory
from backend.app.models.user import User
from backend.app.schemas.scan import ScanRequest, ScanResponse, ScanHistoryItem
from backend.app.core.deps import get_current_user
from backend.app.core.model_loader import ml_engine

router = APIRouter(prefix="/scan", tags=["Phishing Detection Scanner"])

@router.post("", response_model=ScanResponse)
def scan_website_url(
    payload: ScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates a website URL using the trained Scikit-learn Machine Learning model.
    STRICT SECURITY: Requires authenticated user session.
    Automatically binds and persists the scan result into the user's scan_history in Neon PostgreSQL.
    """
    url_target = payload.url.strip()
    if len(url_target) < 4 or "." not in url_target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL format. Please provide a valid domain name or web address."
        )

    # 1. Run Machine Learning inference engine
    prediction_result = ml_engine.predict_url(url_target)

    # 2. Store audit record in PostgreSQL tied to this specific authenticated user
    scan_record = ScanHistory(
        user_id=current_user.id,
        url=url_target,
        prediction=prediction_result["prediction"],
        risk_level=prediction_result["risk_level"],
        confidence=prediction_result["confidence"],
        features_json=json.dumps(prediction_result["features"]),
        scanned_at=datetime.now(timezone.utc)
    )
    db.add(scan_record)
    db.commit()
    db.refresh(scan_record)

    return ScanResponse(
        id=scan_record.id,
        url=url_target,
        prediction=prediction_result["prediction"],
        risk_level=prediction_result["risk_level"],
        confidence=prediction_result["confidence"],
        features=prediction_result["features"],
        recommendations=prediction_result["recommendations"],
        scanned_at=scan_record.scanned_at,
        model_used=prediction_result["model_used"]
    )

@router.get("/history", response_model=List[ScanHistoryItem])
def get_user_scan_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100
):
    """
    Returns scan history records belonging STRICTLY to the authenticated user from PostgreSQL.
    """
    user_scans = (
        db.query(ScanHistory)
        .filter(ScanHistory.user_id == current_user.id)
        .order_by(desc(ScanHistory.scanned_at))
        .limit(limit)
        .all()
    )

    items = []
    for s in user_scans:
        feat = json.loads(s.features_json) if s.features_json else None
        items.append(ScanHistoryItem(
            id=s.id,
            user_id=s.user_id,
            url=s.url,
            prediction=s.prediction,
            risk_level=s.risk_level,
            confidence=s.confidence,
            features=feat,
            scanned_at=s.scanned_at
        ))
    return items

@router.delete("/history/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_scan_record(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes a specific scan record from PostgreSQL.
    Enforces authorization: users can only delete their own scan records.
    """
    record = (
        db.query(ScanHistory)
        .filter(ScanHistory.id == scan_id, ScanHistory.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or you are not authorized to delete it."
        )

    db.delete(record)
    db.commit()
    return None

@router.delete("/history/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clears all scan history records belonging exclusively to the authenticated user from PostgreSQL.
    """
    db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id).delete()
    db.commit()
    return None
