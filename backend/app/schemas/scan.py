from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, HttpUrl

class ScanRequest(BaseModel):
    url: str = Field(..., min_length=4, max_length=2048, description="Target website URL to evaluate")

class FeatureDetails(BaseModel):
    url_length: int
    having_ip_address: int
    having_at_symbol: int
    prefix_suffix_hyphen: int
    sub_domain_count: int
    ssl_state: str
    https_in_domain: int
    suspicious_tld: int
    shortening_service: int
    suspicious_keywords_found: int
    matched_keywords: Optional[List[str]] = []

class ScanResponse(BaseModel):
    id: Optional[int] = None
    url: str
    prediction: str              # "Phishing" or "Legitimate"
    risk_level: str              # "Low", "Medium", "High"
    confidence: float            # 0.0 - 100.0%
    features: Dict[str, Any]
    recommendations: List[str]
    scanned_at: datetime
    model_used: str = "Random Forest Classifier (Ensemble)"

class ScanHistoryItem(BaseModel):
    id: int
    user_id: Optional[int] = None
    url: str
    prediction: str
    risk_level: str
    confidence: float
    features: Optional[Dict[str, Any]] = None
    scanned_at: datetime

    class Config:
        from_attributes = True
