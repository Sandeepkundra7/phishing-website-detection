"""
Dataset Exploration and Statistical Analysis Utility.
Computes class balance, feature correlations with phishing target label,
and statistical distribution comparisons (Legitimate vs Phishing).
Outputs: ml/data/dataset_summary.json
"""

import sys
import json
import pandas as pd
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from ml.preprocess import preprocess_dataset, PROCESSED_DATASET_PATH, FEATURE_COLUMNS

SUMMARY_JSON_PATH = Path(__file__).resolve().parent / "data" / "dataset_summary.json"

def generate_dataset_summary() -> dict:
    if not PROCESSED_DATASET_PATH.exists():
        print(f"[*] Preprocessed features dataset not found. Running preprocessing...")
        preprocess_dataset()

    print(f"[*] Analyzing feature matrix from: {PROCESSED_DATASET_PATH}")
    df = pd.read_csv(PROCESSED_DATASET_PATH)

    total_samples = len(df)
    legit_df = df[df["label"] == 0]
    phish_df = df[df["label"] == 1]

    # Feature correlations with label
    correlations = {}
    feature_stats = {}

    for col in FEATURE_COLUMNS:
        corr = float(df[col].corr(df["label"]))
        correlations[col] = round(corr, 4)

        feature_stats[col] = {
            "overall_mean": round(float(df[col].mean()), 4),
            "legitimate_mean": round(float(legit_df[col].mean()), 4),
            "phishing_mean": round(float(phish_df[col].mean()), 4),
            "correlation_with_phishing": round(corr, 4)
        }

    # Sort correlations by magnitude
    sorted_corrs = dict(sorted(correlations.items(), key=lambda item: abs(item[1]), reverse=True))

    summary = {
        "dataset_name": "PhishShield URL Feature Matrix",
        "total_samples": total_samples,
        "feature_count": len(FEATURE_COLUMNS),
        "class_distribution": {
            "legitimate_count": len(legit_df),
            "legitimate_percentage": round((len(legit_df) / total_samples) * 100, 2),
            "phishing_count": len(phish_df),
            "phishing_percentage": round((len(phish_df) / total_samples) * 100, 2)
        },
        "top_predictive_features": sorted_corrs,
        "feature_statistics": feature_stats
    }

    # Save summary JSON
    with open(SUMMARY_JSON_PATH, "w") as f:
        json.dump(summary, f, indent=2)

    # Print Report
    print("=" * 75)
    print(" PHISHSHIELD AI — DATASET & FEATURE EXPLORATION REPORT")
    print("=" * 75)
    print(f"[*] Total Valid URLs:      {total_samples}")
    print(f"[*] Legitimate (0):        {len(legit_df)} ({summary['class_distribution']['legitimate_percentage']}%)")
    print(f"[*] Phishing (1):          {len(phish_df)} ({summary['class_distribution']['phishing_percentage']}%)")
    print(f"[*] Extracted Features:    {len(FEATURE_COLUMNS)}")
    print("-" * 75)
    print(f"{'Feature Name':<28} {'Legit Mean':<12} {'Phish Mean':<12} {'Correlation':<12}")
    print("-" * 75)
    for feat, corr in list(sorted_corrs.items()):
        l_mean = feature_stats[feat]["legitimate_mean"]
        p_mean = feature_stats[feat]["phishing_mean"]
        print(f"{feat:<28} {l_mean:<12} {p_mean:<12} {corr:+0.4f}")
    print("=" * 75)
    print(f"[+] Summary report saved to: {SUMMARY_JSON_PATH}")
    return summary

if __name__ == "__main__":
    generate_dataset_summary()
