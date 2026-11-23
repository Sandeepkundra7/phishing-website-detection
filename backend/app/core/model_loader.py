"""
Model Loader and Inference Engine.
Loads trained Joblib artifacts (Random Forest champion & StandardScaler)
into memory on FastAPI startup and performs low-latency URL risk inference.
"""

import os
import json
import logging
import joblib
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

from backend.app.core.feature_extractor import extract_url_features, KNOWN_LEGITIMATE_DOMAINS

logger = logging.getLogger("phishshield.model_loader")

# Path references
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
SAVED_MODELS_DIR = PROJECT_ROOT / "ml" / "saved_models"

MODEL_PATH = SAVED_MODELS_DIR / "phishing_model.joblib"
SCALER_PATH = SAVED_MODELS_DIR / "scaler.joblib"
METRICS_PATH = SAVED_MODELS_DIR / "model_metrics.json"

class MLInferenceEngine:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_name = "Random Forest Classifier (Ensemble)"
        self.is_loaded = False
        self.metrics = []

    def load_artifacts(self) -> bool:
        """
        Loads the trained champion model, scaler, and benchmark metrics from disk.
        """
        try:
            if MODEL_PATH.exists() and SCALER_PATH.exists():
                logger.info(f"Loading champion model from: {MODEL_PATH}")
                self.model = joblib.load(MODEL_PATH)
                logger.info(f"Loading feature scaler from: {SCALER_PATH}")
                self.scaler = joblib.load(SCALER_PATH)
                self.is_loaded = True

                # Determine model class name
                if hasattr(self.model, "__class__"):
                    self.model_name = self.model.__class__.__name__
                    if self.model_name == "RandomForestClassifier":
                        self.model_name = "Random Forest Classifier (Champion Ensemble)"
                    elif self.model_name == "SVC":
                        self.model_name = "Support Vector Machine (SVM)"
                    elif self.model_name == "DecisionTreeClassifier":
                        self.model_name = "Decision Tree Classifier"
                    elif self.model_name == "LogisticRegression":
                        self.model_name = "Logistic Regression"

                # Load metrics if available
                if METRICS_PATH.exists():
                    with open(METRICS_PATH, "r") as f:
                        self.metrics = json.load(f)

                logger.info(f"ML Inference Engine online with [{self.model_name}].")
                return True
            else:
                logger.warning(
                    f"Trained model artifacts not found at {SAVED_MODELS_DIR}. "
                    "Inference engine will operate in expert heuristic mode until 'python ml/train.py' is run."
                )
                self.is_loaded = False
                return False
        except Exception as e:
            logger.error(f"Failed to load ML model: {e}")
            self.is_loaded = False
            return False

    def predict_url(self, raw_url: str) -> Dict[str, Any]:
        """
        Extracts features and predicts phishing risk using the loaded ML model.
        """
        features, vector = extract_url_features(raw_url)
        hostname = features.get("hostname", "")

        # Check known legitimate domain override for zero false positives on top authentic services
        is_known_safe = any(hostname == d or hostname.endswith("." + d) for d in KNOWN_LEGITIMATE_DOMAINS)

        if self.is_loaded and self.model is not None and self.scaler is not None:
            try:
                scaled_vector = self.scaler.transform([vector])
                pred_label = int(self.model.predict(scaled_vector)[0])
                
                # Get class probabilities [P(Legitimate), P(Phishing)]
                if hasattr(self.model, "predict_proba"):
                    probs = self.model.predict_proba(scaled_vector)[0]
                    phish_prob = float(probs[1])
                else:
                    phish_prob = 1.0 if pred_label == 1 else 0.0

                # Override for known authoritative domains (e.g. google.com, github.com)
                if is_known_safe and phish_prob > 0.15:
                    phish_prob = 0.05
                    pred_label = 0

                is_phishing = (pred_label == 1) or (phish_prob >= 0.50)
                risk_score = phish_prob * 100.0
                confidence = float(phish_prob if is_phishing else (1.0 - phish_prob)) * 100.0
                confidence = round(min(max(confidence, 65.0), 99.4), 1)

                risk_level = "High" if risk_score >= 65.0 else ("Medium" if risk_score >= 35.0 else "Low")
                prediction = "Phishing" if is_phishing else "Legitimate"

                recommendations = self._build_recommendations(is_phishing, risk_level)

                return {
                    "url": raw_url,
                    "prediction": prediction,
                    "risk_level": risk_level,
                    "confidence": confidence,
                    "features": features,
                    "recommendations": recommendations,
                    "model_used": self.model_name,
                    "engine_mode": "Machine Learning (Joblib)"
                }
            except Exception as e:
                logger.warning(f"Error during ML inference, falling back to heuristic engine: {e}")

        # Fallback Heuristic Rule Classifier if ML model not yet loaded
        return self._heuristic_predict(raw_url, features, is_known_safe)

    def _heuristic_predict(self, raw_url: str, features: dict, is_known_safe: bool) -> Dict[str, Any]:
        risk_score = 0
        if features.get("having_ip_address"): risk_score += 35
        if features.get("having_at_symbol"): risk_score += 25
        if features.get("prefix_suffix_hyphen"): risk_score += 15
        if features.get("double_slash_redirecting"): risk_score += 20
        if features.get("sub_domain_count", 0) > 2: risk_score += 20
        if features.get("ssl_state") == "HTTP (Insecure)": risk_score += 15
        if features.get("https_in_domain"): risk_score += 25
        if features.get("suspicious_tld"): risk_score += 30
        if features.get("shortening_service"): risk_score += 20
        if features.get("suspicious_keywords_found", 0) > 0:
            risk_score += (features["suspicious_keywords_found"] * 15)
        if features.get("url_length", 0) > 75: risk_score += 20

        if is_known_safe:
            risk_score = min(risk_score, 8)

        is_phishing = (risk_score >= 40) and not is_known_safe
        risk_level = "High" if risk_score >= 60 else ("Medium" if risk_score >= 30 else "Low")
        confidence = round(min(max(58.0 + (risk_score * 0.4), 60.0), 99.2), 1) if is_phishing else round(min(max(96.0 - (risk_score * 0.7), 65.0), 99.6), 1)

        recommendations = self._build_recommendations(is_phishing, risk_level)

        return {
            "url": raw_url,
            "prediction": "Phishing" if is_phishing else "Legitimate",
            "risk_level": risk_level,
            "confidence": confidence,
            "features": features,
            "recommendations": recommendations,
            "model_used": "Heuristic Security Evaluator",
            "engine_mode": "Heuristic Baseline"
        }

    def _build_recommendations(self, is_phishing: bool, risk_level: str) -> list:
        if is_phishing:
            return [
                "CRITICAL: High probability of phishing or credential harvesting detected.",
                "Do not enter passwords, MFA tokens, credit card details, or sensitive info.",
                "Verify domain spelling in your browser address bar (homograph / typosquatting alert).",
                "Avoid downloading attachments or executables hosted on this domain."
            ]
        elif risk_level == "Medium":
            return [
                "Caution: URL displays atypical structural patterns (uncommon TLD, nesting, or hyphens).",
                "Verify that your browser establishes an authentic, verified TLS certificate.",
                "Never bypass corporate browser security warnings to proceed to this link."
            ]
        else:
            return [
                "URL structure conforms to authentic, standard web conventions.",
                "Standard security hygiene applies: ensure the site displays a valid padlock icon.",
                "Never disclose multi-factor OTP tokens on unverified pages."
            ]

# Global Singleton Instance
ml_engine = MLInferenceEngine()
