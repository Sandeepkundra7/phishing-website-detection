"""
Independent Model Evaluation & Interactive Predictor CLI.
Loads the trained Joblib model and scaler to evaluate any arbitrary URL.
"""

import sys
import os
import joblib
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from backend.app.core.feature_extractor import extract_url_features
from ml.train import CHAMPION_MODEL_PATH, SCALER_PATH, train_and_evaluate_models

def evaluate_url(target_url: str):
    # Ensure model exists
    if not CHAMPION_MODEL_PATH.exists() or not SCALER_PATH.exists():
        print("[*] Trained model artifacts not found. Initiating model training first...")
        train_and_evaluate_models()

    model = joblib.load(CHAMPION_MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    features, vector = extract_url_features(target_url)
    scaled_vector = scaler.transform([vector])

    prediction_code = model.predict(scaled_vector)[0]
    probs = model.predict_proba(scaled_vector)[0] if hasattr(model, "predict_proba") else [0.5, 0.5]
    
    is_phishing = (prediction_code == 1)
    confidence = float(probs[1] if is_phishing else probs[0]) * 100.0
    phish_risk = probs[1] * 100.0
    risk_level = "High" if phish_risk >= 65 else ("Medium" if phish_risk >= 35 else "Low")

    print("\n" + "=" * 70)
    print(f" URL EVALUATION RESULT: {target_url}")
    print("=" * 70)
    print(f" Verdict:        [{'PHISHING' if is_phishing else 'LEGITIMATE'}]")
    print(f" Risk Level:     {risk_level} ({phish_risk:.1f}% risk score)")
    print(f" Confidence:     {confidence:.1f}%")
    print(f" Model Used:     {model.__class__.__name__}")
    print("-" * 70)
    print(" Key Extracted Features:")
    for k, v in features.items():
        if k != "hostname" and k != "matched_keywords":
            print(f"   * {k:<28}: {v}")
    if features.get("matched_keywords"):
        print(f"   * Matched Suspicious Keywords : {', '.join(features['matched_keywords'])}")
    print("=" * 70)

def run_sample_evaluations():
    test_urls = [
        "https://www.google.com/search?q=machine+learning+security",
        "https://github.com/login",
        "http://192.168.1.55/paypal/signin.php?session_id=892341",
        "http://paypal-security-verification.xyz/login.html",
        "http://secure.account.verify.appleid.com.banking-auth.tk/login.aspx"
    ]
    print("=" * 70)
    print(" RUNNING SAMPLE PREDICTIONS WITH TRAINED CHAMPION MODEL")
    print("=" * 70)
    for url in test_urls:
        evaluate_url(url)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        evaluate_url(sys.argv[1])
    else:
        run_sample_evaluations()
