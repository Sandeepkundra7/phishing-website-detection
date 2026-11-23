# PhishShield AI: AI-Based Phishing Website Detection Using Machine Learning

An end-to-end, academic-grade full-stack cybersecurity web application that identifies whether a given website URL is potentially a phishing website or a legitimate website using Machine Learning and non-intrusive lexical/structural feature extraction.

---

## 🛡️ Project Overview & Architecture

Modern phishing campaigns frequently evade static IP/domain blacklists by deploying ephemeral domains, reverse proxies, and automated domain generation algorithms. **PhishShield AI** utilizes an algorithmic machine learning approach that inspects the immutable syntactic and structural anatomy of web addresses without triggering live client-side execution or opening hazardous network sockets.

### System Architecture Flow

```
[ User Input / Client URL ]
            │
            ▼
[ React + Tailwind Frontend ] (Port 3000)
            │  REST API (Axios / Fetch + JWT)
            ▼
[ FastAPI Backend Engine ] (Port 8000)
            │
            ├─► [ 16-Point Lexical & Structural Extractor ]
            │         │
            │         ▼
            ├─► [ StandardScaler Transformer (Joblib) ]
            │         │
            │         ▼
            ├─► [ Random Forest Champion Classifier (Joblib) ]
            │         │
            │         ▼
            ├─► [ Probability Confidence & Risk Scorer (Low / Med / High) ]
            │
            ▼
[ Neon Cloud PostgreSQL Database ]
      ├── users
      ├── scan_history
      └── model_metrics
```

---

## 💻 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Lucide React, Vite |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic, Python-Jose (JWT), Passlib (Bcrypt) |
| **Database** | PostgreSQL (Neon Tech Cloud), SQLAlchemy ORM (with zero-config SQLite auto-fallback) |
| **Machine Learning** | Scikit-learn, Pandas, NumPy, Joblib |
| **ML Algorithms** | Random Forest, Support Vector Machine (SVM), Decision Tree, Logistic Regression |

---

## 🧠 Machine Learning Engine & Feature Directory

The system extracts **16 numerical and structural indicators** from any input URL:

1. `url_length`: Total character length of the web address.
2. `having_ip_address`: Direct IPv4 address used in host instead of a registered domain.
3. `shortening_service`: Known URL shortener services (`bit.ly`, `tinyurl.com`, etc.).
4. `having_at_symbol`: `@` symbol present (used in browser credential redirection tricks).
5. `double_slash_redirecting`: `//` occurrences in the path parameters.
6. `prefix_suffix_hyphen`: Hyphen `-` inside domain name (typosquatting brand spoofing).
7. `sub_domain_count`: Number of nested dot-separated subdomains.
8. `is_https`: Protocol encryption state (HTTPS vs HTTP).
9. `https_in_domain`: Deceptively placing "https" inside the domain name body.
10. `has_port`: Non-standard TCP port specified in URL.
11. `has_suspicious_tld`: Disposable or burst TLDs (`.xyz`, `.top`, `.tk`, `.club`, `.work`, etc.).
12. `url_entropy`: Shannon Entropy measuring character randomness and algorithmic generation.
13. `num_digits`: Digit count across URL string.
14. `num_special_chars`: Special symbols (`?`, `=`, `&`, `%`, `_`, `-`).
15. `suspicious_keywords_found`: Count of matched authentication/security keywords.
16. `domain_hyphens`: Frequency of hyphen delimiters in hostname.

### Model Benchmarking Comparison (Stratified 80/20 Test Set)

| Classifier Algorithm | Accuracy | Precision | Recall | F1-Score | Role |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Random Forest Classifier** | **~96.8%** | **~97.1%** | **~96.4%** | **~96.7%** | ⭐ **Production Champion Model** |
| **Support Vector Machine (SVM)** | **~94.5%** | **~95.0%** | **~93.8%** | **~94.4%** | High-dimensional margin separator |
| **Decision Tree Classifier** | **~92.3%** | **~91.8%** | **~93.1%** | **~92.4%** | Hierarchical rule-based baseline |
| **Logistic Regression** | **~90.7%** | **~91.2%** | **~89.9%** | **~90.5%** | Linear probabilistic baseline |

---

## 🗄️ Database Design (PostgreSQL / Neon Tech)

The application maintains 3 relational tables in PostgreSQL:

1. **`users`**:
   - `id`: Integer primary key
   - `username`: String(50), unique, indexed
   - `email`: String(100), unique, indexed
   - `password_hash`: String(255), bcrypt hashed
   - `created_at`: DateTime with timezone

2. **`scan_history`**:
   - `id`: Integer primary key
   - `user_id`: ForeignKey (`users.id`), nullable (supports both guest & analyst scans)
   - `url`: Text
   - `prediction`: String ('Phishing' or 'Legitimate')
   - `risk_level`: String ('Low', 'Medium', 'High')
   - `confidence`: Float (0.0% – 100.0%)
   - `features_json`: Text (serialized 16-point feature extraction vector)
   - `scanned_at`: DateTime with timezone

3. **`model_metrics`**:
   - `id`: Integer primary key
   - `model_name`: String(100)
   - `accuracy`: Float
   - `precision`: Float
   - `recall`: Float
   - `f1_score`: Float
   - `confusion_matrix_json`: Text (serialized 2x2 matrix: TN, FP, FN, TP)
   - `created_at`: DateTime with timezone

---

## 🚀 Step-by-Step Local Execution Instructions

### Prerequisites
- Python 3.10+ installed
- Node.js (v18+) and npm installed
- Active Internet connection (for Neon PostgreSQL Cloud connection)

---

### Step 1: Install Python Dependencies & Train ML Models

Open a terminal in the project root:

```powershell
cd "c:\Users\Sandeep Reddy\Documents\Aidl Project"

# 1. Create local configuration and set a unique SECRET_KEY
Copy-Item backend\.env.example backend\.env
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Put the generated value in backend\.env as SECRET_KEY

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Train the 4 ML models & export Joblib artifacts
python ml/train.py
```

*This trains the 4 algorithms, generates `ml/saved_models/phishing_model.joblib`, and synchronizes evaluation metrics with your Neon PostgreSQL database.*

---

### Step 2: Start the FastAPI Backend Server

In your terminal:

```powershell
cd "c:\Users\Sandeep Reddy\Documents\Aidl Project"
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`

---

### Step 3: Start the React Frontend

Open a **second terminal** window:

```powershell
cd "c:\Users\Sandeep Reddy\Documents\Aidl Project\frontend"

# 1. Install frontend packages (if not already installed)
npm install

# 2. Launch Vite development server
npm run dev
```

- Frontend Web Interface: 👉 **`http://localhost:3000`**

---

## 🧪 Testing the Application

1. **Live URL Scanner (`/`)**:
   - Test legitimate sites: `https://www.google.com`, `https://github.com/login`
   - Test phishing samples: `http://paypal-security-verification.xyz/login`, `http://192.168.1.55/bank/verify`
   - Observe the live confidence gauge, risk tier (*Low*, *Medium*, *High*), and 16-point feature breakdown.
2. **Analytics Dashboard (`/dashboard`)**:
   - Real-time threat distribution donut chart.
   - Dynamic algorithm performance benchmark bars (Random Forest, SVM, Decision Tree, Logistic Regression).
   - Recent scan logs pulled live from Neon PostgreSQL.
3. **Scan History (`/history`)**:
   - Search by domain or keyword.
   - Filter by risk level (*All, Phishing, Legitimate, High Risk*).
   - Click **Inspect** to re-examine the feature matrix of any past scan.
   - Click the trash icon to delete records directly from Neon PostgreSQL.
4. **Analyst Sign In (`/auth`)**:
   - Click **Analyst Sign In** in the top navigation.
   - Click *"⚡ Auto-Fill Demo Credentials"* to log in as the default analyst (`analyst` / `SecurityPass2026!`).

---

## 🔒 Security Best Practices Implemented

- **Zero Outbound Execution (SSRF Protection)**: Target URLs are never visited over network sockets or executed in headless browsers. Feature extraction is purely lexical and syntactic.
- **SQL Injection Prevention**: Built entirely with SQLAlchemy ORM parameterized queries.
- **Password Security**: Analyst credentials hashed with bcrypt.
- **Cloud Database Configuration**: Connection credentials stored safely in `backend/.env`.

---

## 🎓 Academic Capstone Metadata

- **Project Title**: AI-Based Phishing Website Detection Using Machine Learning
- **Specialization**: Artificial Intelligence & Deep Learning (AIDL)
- **Primary Model**: Random Forest Ensemble Classifier (Joblib)
- **Database**: PostgreSQL (Neon Tech Cloud)
- **Architecture**: Decoupled Full-Stack Web Application (React + FastAPI REST)
