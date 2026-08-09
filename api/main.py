import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from src.analytics import (
    predict_property_price,
    explain_prediction_shap,
    find_comparable_properties,
    detect_mispricing,
    get_cluster_benchmark_summary,
    generate_valuation_report,
    ECONOMIC_HUBS,
    CALIFORNIA_CITIES
)

app = FastAPI(
    title="California Real Estate AI Valuation API",
    description="REST API serving LightGBM Micro-Market Regressors, KMeans Clustering, and SHAP Explainability",
    version="2.0.0"
)

# Enable CORS for React frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PropertyInput(BaseModel):
    Latitude: float
    Longitude: float
    MedInc: float
    HouseAge: float
    TotalRooms: float
    TotalBedrooms: float
    Population: Optional[float] = 3.0
    Households: Optional[float] = 2.5
    AskingPrice: Optional[float] = 650000.0
    CityName: Optional[str] = "San Francisco"

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "California Real Estate AI Valuation Engine",
        "version": "2.0.0"
    }

@app.get("/api/cities")
def get_cities():
    """Returns supported California cities with coordinates and metadata."""
    return {
        "cities": CALIFORNIA_CITIES,
        "economic_hubs": ECONOMIC_HUBS
    }

@app.post("/api/predict")
def predict_valuation(req: PropertyInput):
    """Calculates AI Fair Value, 90% Confidence Bounds, and Listing Mispricing Status."""
    input_dict = {
        "Latitude": req.Latitude,
        "Longitude": req.Longitude,
        "MedInc": req.MedInc,
        "HouseAge": req.HouseAge,
        "TotalRooms": req.TotalRooms,
        "TotalBedrooms": req.TotalBedrooms,
        "Population": req.Population or 3.0,
        "Households": req.Households or 2.5
    }

    try:
        prediction_res = predict_property_price(input_dict)
        misprice_res = detect_mispricing(req.AskingPrice or 650000.0, prediction_res["predicted_price_usd"])

        return {
            "prediction": prediction_res,
            "mispricing": misprice_res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/shap")
def get_shap_impact(req: PropertyInput):
    """Returns SHAP feature attributions and dollar impact breakdown."""
    input_dict = {
        "Latitude": req.Latitude,
        "Longitude": req.Longitude,
        "MedInc": req.MedInc,
        "HouseAge": req.HouseAge,
        "TotalRooms": req.TotalRooms,
        "TotalBedrooms": req.TotalBedrooms,
        "Population": req.Population or 3.0,
        "Households": req.Households or 2.5
    }

    try:
        shap_df = explain_prediction_shap(input_dict)
        shap_df["Dollar_Impact"] = shap_df["SHAP_Value"] * 100000.0
        return shap_df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/comps")
def get_comparable_properties(req: PropertyInput, top_n: int = 5):
    """Returns nearest neighbor historical property comps."""
    input_dict = {
        "Latitude": req.Latitude,
        "Longitude": req.Longitude,
        "MedInc": req.MedInc,
        "HouseAge": req.HouseAge,
        "TotalRooms": req.TotalRooms,
        "TotalBedrooms": req.TotalBedrooms,
        "Population": req.Population or 3.0,
        "Households": req.Households or 2.5
    }

    try:
        comps_df = find_comparable_properties(input_dict, top_n=top_n)
        return comps_df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/benchmark")
def get_benchmark_stats():
    """Returns cluster benchmark statistics and global vs cluster accuracy metrics."""
    try:
        summary = get_cluster_benchmark_summary()
        return {
            "cluster_stats": summary["cluster_stats"].to_dict(orient="records"),
            "benchmark_data": summary["benchmark_data"].to_dict(orient="records"),
            "overall_global_mae": summary["overall_global_mae"],
            "overall_cluster_mae": summary["overall_cluster_mae"],
            "improvement_pct": summary["improvement_pct"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/report")
def generate_report(req: PropertyInput):
    """Generates downloadable text summary report."""
    input_dict = {
        "Latitude": req.Latitude,
        "Longitude": req.Longitude,
        "MedInc": req.MedInc,
        "HouseAge": req.HouseAge,
        "TotalRooms": req.TotalRooms,
        "TotalBedrooms": req.TotalBedrooms,
        "Population": req.Population or 3.0,
        "Households": req.Households or 2.5
    }

    try:
        prediction_res = predict_property_price(input_dict)
        misprice_res = detect_mispricing(req.AskingPrice or 650000.0, prediction_res["predicted_price_usd"])
        comps_df = find_comparable_properties(input_dict, top_n=5)

        report_txt = generate_valuation_report(
            req.CityName or "San Francisco",
            input_dict,
            prediction_res,
            misprice_res,
            comps_df
        )

        return {"report": report_txt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
