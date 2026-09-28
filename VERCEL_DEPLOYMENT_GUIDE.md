# 🚀 Deploying GeneGuard 2.0 to Vercel

GeneGuard is fully configured for deployment on **Vercel** with full Single-Page Application (SPA) routing, video background streaming headers, dynamic API configuration, and self-contained machine learning model artifacts.

---

## ⚡ Deployment Options

### Option 1: Full-Stack Vercel Monorepo (Zero-Config, Recommended)
The repository contains `vercel.json` configured with Python Serverless Function support (`api/index.py`), automatic model bundling from `backend/models/**`, and frontend Vite static generation:

1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your repository: **`Akshat-vishwakarm/gene_guard_2.0`** (or `GeneGuard-2.0`).
3. Leave **Root Directory** as `./` (do not change to `frontend`).
4. **Environment Variables** (Optional, for Gemini AI Clinical Evaluation and Live RAG):
   * `GEMINI_API_KEY`: Your Google Gemini API Key
5. Click **Deploy**.

> **Verification**: Once deployed, visit `https://your-deployment.vercel.app/api/health` to confirm that all 5 ML models (`cardiovascular`, `metabolic`, `blood_pressure`, `thyroid`, `cancer`) report `true`.

---

### Option 2: Split Architecture (Vercel Frontend + Render/Railway Backend)
If you prefer running the Python Flask API as a dedicated, persistent 24/7 web service:

#### Step 1: Deploy Backend to Render (Free)
1. Go to [render.com](https://render.com) and click **New Web Service**.
2. Select your repository: **`Akshat-vishwakarm/gene_guard_2.0`**.
3. Configure settings:
   * **Root Directory**: `backend`
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `python app.py` (or `gunicorn -w 2 -b 0.0.0.0:$PORT app:app`)
   * **Environment Variables**: `GEMINI_API_KEY` (optional)
4. Copy the assigned URL (e.g. `https://geneguard-backend.onrender.com`).

#### Step 2: Configure Vercel Frontend
1. In your Vercel Project Dashboard:
2. Navigate to **Settings** &rarr; **Environment Variables**.
3. Add:
   * **Key**: `VITE_API_URL` (or `VITE_API_BASE_URL`)
   * **Value**: `https://geneguard-backend.onrender.com`
4. Redeploy the project.

---

## 🩺 Machine Learning Model Artifacts Included

The production deployment includes self-contained, pre-trained model pipelines located in `backend/models/`:
- **Cardiovascular**: `cardiovascular_model.pkl`, `cardiovascular_threshold.pkl`, `cardiovascular_features.pkl`
- **Metabolic**: `metabolic_model.pkl`, `scaler.pkl`
- **Blood Pressure**: `blood_pressure_model.pkl`, `blood_pressure_metadata.pkl`
- **Thyroid**: `gene_guard_thyroid_pipeline.pkl`
- **Cancer**: `cancer_model.joblib`
- **RAG Encyclopedia Index**: `medical_index.joblib` (6,043 chunks from The Gale Encyclopedia of Medicine)

---

## 🔍 API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | Verification endpoint returning status of all 5 loaded models |
| `/api/models/schema` | GET | Dynamic input schemas and feature order for disease modules |
| `/api/predict` | POST | Executes single or multi-organ disease risk inference |
| `/api/final-analysis` | POST | Combined multi-disease, family pedigree risk engine & report |
| `/api/chat` | POST | Gale Encyclopedia of Medicine RAG knowledge query |
| `/api/extract-report` | POST | Laboratory report OCR & PDF test value extraction |
