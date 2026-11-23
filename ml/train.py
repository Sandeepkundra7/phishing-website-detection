"""
Machine Learning Training and Model Evaluation Pipeline.
Trains 4 algorithms:
1. Random Forest Classifier
2. Decision Tree Classifier
3. Logistic Regression
4. Support Vector Machine (SVM)

Evaluates Accuracy, Precision, Recall, F1-Score, and Confusion Matrix on holdout test set.
Selects champion model, persists artifacts using Joblib, and updates the database metrics table.
"""

import sys
import os
import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Ensure root is in sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from ml.preprocess import preprocess_dataset, PROCESSED_DATASET_PATH, FEATURE_COLUMNS
from ml.collect_dataset import collect_dataset, RAW_DATASET_PATH

SAVED_MODELS_DIR = Path(__file__).resolve().parent / "saved_models"
SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)

CHAMPION_MODEL_PATH = SAVED_MODELS_DIR / "phishing_model.joblib"
SCALER_PATH = SAVED_MODELS_DIR / "scaler.joblib"
METRICS_JSON_PATH = SAVED_MODELS_DIR / "model_metrics.json"
FEATURE_IMPORTANCE_PATH = SAVED_MODELS_DIR / "feature_importance.json"

def train_and_evaluate_models(force_reprocess: bool = True) -> dict:
    # 1. Regenerate realistic dataset and features if requested or missing
    if force_reprocess or not PROCESSED_DATASET_PATH.exists():
        print("[*] Rebuilding realistic dataset with natural overlaps...")
        collect_dataset(2000)
        preprocess_dataset()

    print(f"[*] Loading feature dataset from: {PROCESSED_DATASET_PATH}")
    df = pd.read_csv(PROCESSED_DATASET_PATH)

    X = df[FEATURE_COLUMNS]
    y = df["label"]
    print(f"[*] Dataset size: {X.shape[0]} samples, {X.shape[1]} features.")

    # 2. Stratified 80/20 Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[*] Training samples: {len(X_train)} | Test samples: {len(X_test)}")

    # 3. Feature Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    joblib.dump(scaler, SCALER_PATH)
    print(f"[+] StandardScaler fitted and saved to: {SCALER_PATH}")

    # 4. Initialize the 4 ML Algorithms with academic regularizations
    models = {
        "Random Forest Classifier": RandomForestClassifier(
            n_estimators=100, max_depth=10, min_samples_leaf=2, random_state=42, n_jobs=-1
        ),
        "Support Vector Machine (SVM)": SVC(
            C=1.0, kernel='rbf', probability=True, random_state=42
        ),
        "Decision Tree Classifier": DecisionTreeClassifier(
            max_depth=8, min_samples_leaf=4, random_state=42
        ),
        "Logistic Regression": LogisticRegression(
            max_iter=1000, C=0.5, random_state=42
        )
    }

    results = {}
    best_f1 = -1.0
    champion_name = None
    champion_model = None

    print("\n" + "=" * 78)
    print(" TRAINING & EVALUATING 4 MACHINE LEARNING CLASSIFIERS")
    print("=" * 78)

    for name, model in models.items():
        print(f"\n[>] Training {name}...")
        
        # Fit on scaled training data
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)

        # Compute Metrics
        acc = float(accuracy_score(y_test, y_pred)) * 100.0
        prec = float(precision_score(y_test, y_pred, zero_division=0)) * 100.0
        rec = float(recall_score(y_test, y_pred, zero_division=0)) * 100.0
        f1 = float(f1_score(y_test, y_pred, zero_division=0)) * 100.0
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()

        results[name] = {
            "name": name,
            "accuracy": round(acc, 2),
            "precision": round(prec, 2),
            "recall": round(rec, 2),
            "f1_score": round(f1, 2),
            "confusion_matrix": {
                "TN": int(tn),
                "FP": int(fp),
                "FN": int(fn),
                "TP": int(tp)
            }
        }

        # Save individual model
        filename = name.lower().replace(" ", "_").replace("(", "").replace(")", "") + ".joblib"
        joblib.dump(model, SAVED_MODELS_DIR / filename)

        # Track Champion
        if f1 > best_f1:
            best_f1 = f1
            champion_name = name
            champion_model = model

        print(f"    - Accuracy:  {acc:.2f}%")
        print(f"    - Precision: {prec:.2f}%")
        print(f"    - Recall:    {rec:.2f}%")
        print(f"    - F1-Score:  {f1:.2f}%")
        print(f"    - Confusion: TN={tn}, FP={fp}, FN={fn}, TP={tp}")

    # Mark Champion Model
    for name in results:
        results[name]["is_champion"] = (name == champion_name)

    # Save Champion Model
    joblib.dump(champion_model, CHAMPION_MODEL_PATH)
    print(f"\n[+] Champion Model Selected: [{champion_name}] (F1: {best_f1:.2f}%)")
    print(f"[+] Saved Champion Model to: {CHAMPION_MODEL_PATH}")

    # Feature Importance for Random Forest
    rf_model = models.get("Random Forest Classifier")
    if hasattr(rf_model, "feature_importances_"):
        importances = rf_model.feature_importances_
        feature_importance_dict = dict(zip(FEATURE_COLUMNS, [round(float(x) * 100.0, 2) for x in importances]))
        sorted_importance = dict(sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True))
        with open(FEATURE_IMPORTANCE_PATH, "w") as f:
            json.dump(sorted_importance, f, indent=2)
        print(f"[+] Feature importances saved to: {FEATURE_IMPORTANCE_PATH}")

    # Save Metrics JSON
    metrics_list = list(results.values())
    with open(METRICS_JSON_PATH, "w") as f:
        json.dump(metrics_list, f, indent=2)
    print(f"[+] Benchmark metrics saved to: {METRICS_JSON_PATH}")

    # Sync PostgreSQL model_metrics table
    try:
        from backend.app.db.session import SessionLocal
        from backend.app.models.model_metrics import ModelMetrics
        
        db = SessionLocal()
        for m in metrics_list:
            existing = db.query(ModelMetrics).filter(ModelMetrics.model_name == m["name"]).first()
            if existing:
                existing.accuracy = m["accuracy"]
                existing.precision = m["precision"]
                existing.recall = m["recall"]
                existing.f1_score = m["f1_score"]
                existing.confusion_matrix_json = json.dumps(m["confusion_matrix"])
            else:
                new_metric = ModelMetrics(
                    model_name=m["name"],
                    accuracy=m["accuracy"],
                    precision=m["precision"],
                    recall=m["recall"],
                    f1_score=m["f1_score"],
                    confusion_matrix_json=json.dumps(m["confusion_matrix"])
                )
                db.add(new_metric)
        db.commit()
        db.close()
        print("[+] PostgreSQL 'model_metrics' table updated with evaluated metrics!")
    except Exception as e:
        print(f"[-] Note: Database sync deferred ({e}).")

    # Print Final Comparison Table
    print("\n" + "=" * 78)
    print(f"{'Model Algorithm':<30} {'Accuracy':<12} {'Precision':<12} {'Recall':<12} {'F1-Score':<10}")
    print("=" * 78)
    for m in metrics_list:
        champ_flag = " ⭐ (Champion)" if m.get("is_champion") else ""
        print(f"{m['name'] + champ_flag:<30} {m['accuracy']:<12.2f} {m['precision']:<12.2f} {m['recall']:<12.2f} {m['f1_score']:<10.2f}")
    print("=" * 78)

    return results

if __name__ == "__main__":
    train_and_evaluate_models()
