"""
Feature Extraction and Preprocessing Pipeline for Phishing URL Dataset.
Iterates over raw URLs, runs lexical & structural feature extraction,
cleans data, handles duplicates/nulls, and outputs the numerical matrix:
ml/data/features_dataset.csv
"""

import sys
import os
import pandas as pd
from pathlib import Path

# Ensure root is in sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from backend.app.core.feature_extractor import extract_url_features
from ml.collect_dataset import collect_dataset, RAW_DATASET_PATH

DATA_DIR = Path(__file__).resolve().parent / "data"
PROCESSED_DATASET_PATH = DATA_DIR / "features_dataset.csv"

FEATURE_COLUMNS = [
    "url_length",
    "having_ip_address",
    "shortening_service",
    "having_at_symbol",
    "double_slash_redirecting",
    "prefix_suffix_hyphen",
    "sub_domain_count",
    "is_https",
    "https_in_domain",
    "has_port",
    "has_suspicious_tld",
    "url_entropy",
    "num_digits",
    "num_special_chars",
    "suspicious_keywords_found",
    "domain_hyphens"
]

def preprocess_dataset(raw_path: Path = RAW_DATASET_PATH, output_path: Path = PROCESSED_DATASET_PATH) -> pd.DataFrame:
    """
    Cleans raw URLs, applies feature extraction, and saves processed numerical feature dataframe.
    """
    if not raw_path.exists():
        print(f"[*] Raw dataset not found at {raw_path}. Collecting dataset first...")
        collect_dataset(2000)

    print(f"[*] Loading raw dataset from: {raw_path}")
    raw_df = pd.read_csv(raw_path)
    print(f"    Raw records: {len(raw_df)}")

    # Data Cleaning: drop duplicates and nulls
    raw_df = raw_df.dropna(subset=["url", "label"]).drop_duplicates(subset=["url"]).reset_index(drop=True)
    print(f"    After deduplication: {len(raw_df)} valid URLs")

    print("[*] Extracting 16 lexical and structural URL features...")
    records = []
    total = len(raw_df)

    for idx, row in raw_df.iterrows():
        url = str(row["url"])
        label = int(row["label"])
        try:
            _, vector = extract_url_features(url)
            record = dict(zip(FEATURE_COLUMNS, vector))
            record["label"] = label
            record["url"] = url
            records.append(record)
        except Exception as e:
            print(f"    Warning: Error parsing URL '{url}': {e}")

        if (idx + 1) % 1000 == 0 or (idx + 1) == total:
            print(f"    Extracted features for {idx + 1}/{total} URLs...")

    features_df = pd.DataFrame(records)

    # Reorder columns: features first, then label, then url
    ordered_cols = FEATURE_COLUMNS + ["label", "url"]
    features_df = features_df[ordered_cols]

    # Save processed CSV
    features_df.to_csv(output_path, index=False)
    print(f"[+] Feature matrix saved to: {output_path}")
    print(f"[+] Shape: {features_df.shape} (Features: {len(FEATURE_COLUMNS)}, Rows: {len(features_df)})")
    
    # Class balance check
    class_counts = features_df["label"].value_counts().to_dict()
    print(f"[+] Class Balance: Legitimate (0) = {class_counts.get(0, 0)}, Phishing (1) = {class_counts.get(1, 0)}")

    return features_df

if __name__ == "__main__":
    preprocess_dataset()
