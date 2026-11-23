from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from backend.app.schemas.scan import ScanHistoryItem

class DashboardSummary(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    total_scanned: int
    phishing_detected: int
    legitimate_detected: int
    high_risk_detected: int
    average_confidence: float
    risk_distribution: Optional[Dict[str, int]] = None
    recent_activity: List[ScanHistoryItem]

class ModelMetricItem(BaseModel):
    id: Optional[int] = None
    name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    is_champion: bool = False
    description: Optional[str] = None
    confusion_matrix: Optional[Dict[str, int]] = None
