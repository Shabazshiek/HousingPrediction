# 🏡 California Real Estate AI Valuation & Micro-Market Analytics

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![LightGBM](https://img.shields.io/badge/LightGBM-4.5-green.svg)](https://lightgbm.readthedocs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An end-to-end, full-stack **California Real Estate AI Valuation System** built with **FastAPI**, **React + Glassmorphism CSS**, **Quantile LightGBM Regressors**, **K-Means Micro-Market Clustering**, **TreeSHAP Explainability**, and **k-NN Spatial Comps**.

---

## 🌟 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│            React Single Page Application (Frontend)      │
│  - Built with Vite, React 18, and Custom Glassmorphism  │
│  - Google Font 'Plus Jakarta Sans' & Dark/Light Toggle  │
│  - Interactive City Advisor & Home Specs Controls       │
│  - Leaflet Map, Recharts SHAP Chart & What-If Simulator │
└────────────────────────────┬────────────────────────────┘
                             │  REST JSON API
                             ▼
┌─────────────────────────────────────────────────────────┐
│             FastAPI Microservice Engine (Backend)       │
│  - GET  /api/cities        (California Cities Lookup)   │
│  - POST /api/predict       (Fair Price & 90% Bounds)    │
│  - POST /api/shap          (SHAP Dollar Attributions)   │
│  - POST /api/comps         (Nearest Neighbor Comps)     │
│  - GET  /api/benchmark     (Cluster Performance Stats)  │
│  - POST /api/report        (Valuation Report TXT)       │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

- 🌆 **City Property Advisor**: Select major California regions (*San Francisco*, *Los Angeles*, *San Jose / Silicon Valley*, *San Diego*, *Sacramento*, etc.) with intuitive home specifications.
- 💎 **Glassmorphism Hero KPI Cards**: Real-time display of **AI Estimated Fair Value**, **90% Confidence Bounds**, and **Listing Mispricing Verdict** (*Bargain*, *Fair Value*, or *Overpriced*).
- 🧠 **Geographic Micro-Market Clustering**: Segments California into 6 micro-markets using `K-Means`, achieving a **24.5% error reduction (MAE)** over single global models.
- 📈 **Quantile LightGBM Confidence Bounds**: Uses 10th and 90th percentile quantile loss regressors to model real estate uncertainty bounds.
- 📊 **TreeSHAP Explainable AI**: Quantifies exact positive (+Green) and negative (-Red) dollar ($) attributions pushing property prices up or down.
- 🏘️ **Nearest Neighbor Comps**: Finds top 5 historical sales nearest in geodesic distance and structural attributes within the cluster using `NearestNeighbors` (k-NN).
- 🎛️ **What-If Renovation Simulator**: Live sliders allowing users to simulate room additions or property age upgrades to observe real-time value shifts.
- 💡 **Dark & Light Mode Switch**: Seamless theme toggling with dynamic CartoDB map tiles and CSS variables.
- 📄 **Valuation Report Export**: Download comprehensive text valuation reports with one click.

---

## 🧠 Machine Learning Pipeline

```
 [Stage 1: Geodesic Feature Engineering] (src/feature_engineering.py)
 ├── Geodesic Distances (km): dist_sf, dist_la, dist_sj, dist_sd, dist_coastline
 └── Structural Metrics: RoomsPerHousehold, BedroomsPerRoom

 [Stage 2: Micro-Market Clustering] (src/clustering.py)
 └── StandardScaler + KMeans(n_clusters=6) -> models/kmeans.joblib

 [Stage 3: Quantile LightGBM Training] (src/train_models.py)
 └── 18 Specialized Models: Point Estimate + 10th & 90th Quantiles per cluster

 [Stage 4: Real-Time Analytics & SHAP] (src/analytics.py)
 └── TreeSHAP Attributions + k-NN Nearest Neighbor Comps Engine

 [Stage 5: Production Serving & UI] (api/main.py & frontend/)
 └── FastAPI REST API + React Glassmorphism Dashboard
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup (FastAPI)
```bash
# Clone repository
git clone https://github.com/Shabazshiek/HousingPrediction.git
cd HousingPrediction

# Create & activate virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt fastapi uvicorn

# Launch FastAPI backend server
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000
```
*(Backend runs at `http://127.0.0.1:8000`)*

### 2. Frontend Setup (React + Vite)
Open a **new terminal tab**:
```bash
cd frontend

# Install Node.js dependencies
npm install

# Launch React frontend dev server
npm run dev
```
*(Frontend runs at `http://localhost:5173`)*

---

## 📖 API Documentation

FastAPI automatically generates interactive OpenAPI documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide React, Leaflet, Recharts, Custom Glassmorphism CSS.
- **Backend API**: FastAPI, Uvicorn, Pydantic, CORS Middleware.
- **Machine Learning**: LightGBM, Scikit-Learn, KMeans, TreeSHAP, Geopy, Joblib, Pandas, NumPy.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
