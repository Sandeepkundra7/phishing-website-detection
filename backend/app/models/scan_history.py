from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.db.base import Base

class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    url = Column(Text, nullable=False)
    prediction = Column(String(50), nullable=False)   # 'Phishing' or 'Legitimate'
    risk_level = Column(String(20), nullable=False)   # 'Low', 'Medium', 'High'
    confidence = Column(Float, nullable=False)        # 0.0 - 100.0 %
    features_json = Column(Text, nullable=True)       # Serialized JSON of 16 extracted indicators
    scanned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="scan_history")

    def __repr__(self):
        return f"<ScanHistory(id={self.id}, url='{self.url[:30]}...', prediction='{self.prediction}', risk='{self.risk_level}')>"
