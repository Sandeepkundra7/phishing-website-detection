-- PhishShield AI: PostgreSQL Schema Initialization Script
-- Use this script to manually create the PostgreSQL database and tables in pgAdmin or psql.

-- 1. Create Database (Run if database does not exist)
-- CREATE DATABASE phishing_db;
-- \c phishing_db;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Create Scan_History Table
CREATE TABLE IF NOT EXISTS scan_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    prediction VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    confidence REAL NOT NULL,
    features_json TEXT,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_scanned_at ON scan_history(scanned_at);

-- 4. Create Model_Metrics Table
CREATE TABLE IF NOT EXISTS model_metrics (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    accuracy REAL NOT NULL,
    precision REAL NOT NULL,
    recall REAL NOT NULL,
    f1_score REAL NOT NULL,
    confusion_matrix_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Seed Initial Model Benchmark Data
INSERT INTO model_metrics (model_name, accuracy, precision, recall, f1_score, confusion_matrix_json)
VALUES 
('Random Forest Classifier', 96.8, 97.1, 96.4, 96.7, '{"TN": 974, "FP": 29, "FN": 36, "TP": 961}'),
('Support Vector Machine (SVM)', 94.5, 95.0, 93.8, 94.4, '{"TN": 951, "FP": 52, "FN": 58, "TP": 939}'),
('Decision Tree Classifier', 92.3, 91.8, 93.1, 92.4, '{"TN": 920, "FP": 83, "FN": 71, "TP": 926}'),
('Logistic Regression', 90.7, 91.2, 89.9, 90.5, '{"TN": 915, "FP": 88, "FN": 98, "TP": 899}')
ON CONFLICT DO NOTHING;
