import os
import joblib
import numpy as np
import pandas as pd
import shap
from geopy.distance import geodesic
from sklearn.neighbors import NearestNeighbors

# Reference coordinates for spatial calculations
ECONOMIC_HUBS = {
    "dist_sf": (37.7749, -122.4194),
    "dist_la": (34.0522, -118.2437),
    "dist_sj": (37.3382, -121.8863),
    "dist_sd": (32.7157, -117.1611)
}

COASTLINE_POINTS = [
    (32.7157, -117.1611), (33.7420, -118.2700), (34.4208, -119.6982),
    (36.6002, -121.8947), (37.7749, -122.4194), (38.3317, -123.0481)
]

CLUSTER_FEATURES = [
    "Latitude", "Longitude", "MedInc", "HouseAge", 
    "RoomsPerHousehold", "BedroomsPerRoom", 
    "dist_sf", "dist_la", "dist_sj", "dist_sd", "dist_coastline"
]

MODEL_FEATURES = [
    "MedInc", "HouseAge", "RoomsPerHousehold", "BedroomsPerRoom", 
    "Population", "AveOccup", "Latitude", "Longitude", 
    "dist_sf", "dist_la", "dist_sj", "dist_sd", "dist_coastline"
]

_scaler = None
_kmeans = None
_clustered_df = None
_cluster_models = {}
_cluster_lower_models = {}
_cluster_upper_models = {}

def load_artifacts():
    """Lazy loads scaler, kmeans, and LightGBM model artifacts into memory."""
    global _scaler, _kmeans, _clustered_df, _cluster_models, _cluster_lower_models, _cluster_upper_models

    if _scaler is None:
        _scaler = joblib.load("models/scaler.joblib")
    if _kmeans is None:
        _kmeans = joblib.load("models/kmeans.joblib")
    if _clustered_df is None:
        _clustered_df = pd.read_csv("data/clustered_housing.csv")

    clusters = _clustered_df["Cluster"].unique()
    for c_id in clusters:
        if c_id not in _cluster_models:
            _cluster_models[c_id] = joblib.load(f"models/lgbm_cluster_{c_id}.joblib")
            _cluster_lower_models[c_id] = joblib.load(f"models/lgbm_lower_cluster_{c_id}.joblib")
            _cluster_upper_models[c_id] = joblib.load(f"models/lgbm_upper_cluster_{c_id}.joblib")

def preprocess_input(input_dict: dict) -> pd.DataFrame:
    """Preprocesses a single property input dictionary into a feature DataFrame."""
    lat = float(input_dict["Latitude"])
    lon = float(input_dict["Longitude"])
    med_inc = float(input_dict["MedInc"])
    house_age = float(input_dict["HouseAge"])

    total_rooms = float(input_dict.get("TotalRooms", input_dict.get("AveRooms", 5.0)))
    total_bedrooms = float(input_dict.get("TotalBedrooms", input_dict.get("AveBedrms", 1.0)))
    households = float(input_dict.get("Households", input_dict.get("AveOccup", 3.0)))
    population = float(input_dict.get("Population", households * 2.5))

    rooms_per_household = total_rooms / households if households > 0 else total_rooms
    bedrooms_per_room = total_bedrooms / total_rooms if total_rooms > 0 else 0.2
    ave_occup = population / households if households > 0 else 2.5

    # Compute distances to economic hubs
    point = (lat, lon)
    hub_dists = {city: geodesic(point, coord).kilometers for city, coord in ECONOMIC_HUBS.items()}

    # Compute distance to coast
    dist_coastline = min(geodesic(point, coast).kilometers for coast in COASTLINE_POINTS)

    feature_dict = {
        "Latitude": lat,
        "Longitude": lon,
        "MedInc": med_inc,
        "HouseAge": house_age,
        "RoomsPerHousehold": rooms_per_household,
        "BedroomsPerRoom": bedrooms_per_room,
        "Population": population,
        "AveOccup": ave_occup,
        "dist_sf": hub_dists["dist_sf"],
        "dist_la": hub_dists["dist_la"],
        "dist_sj": hub_dists["dist_sj"],
        "dist_sd": hub_dists["dist_sd"],
        "dist_coastline": dist_coastline
    }

    return pd.DataFrame([feature_dict])

def predict_property_price(input_dict: dict) -> dict:
    """Assigns cluster and returns point prediction + 90% confidence bounds."""
    load_artifacts()
    df_feat = preprocess_input(input_dict)

    # Scale cluster features & predict cluster
    X_cluster_scaled = _scaler.transform(df_feat[CLUSTER_FEATURES])
    cluster_id = int(_kmeans.predict(X_cluster_scaled)[0])

    # Predict using cluster-specific models
    X_model = df_feat[MODEL_FEATURES]
    pred_val = float(_cluster_models[cluster_id].predict(X_model)[0])
    lower_val = float(_cluster_lower_models[cluster_id].predict(X_model)[0])
    upper_val = float(_cluster_upper_models[cluster_id].predict(X_model)[0])

    # Ensure bounds order
    lower_bound = min(lower_val, pred_val)
    upper_bound = max(upper_val, pred_val)

    return {
        "cluster_id": cluster_id,
        "predicted_price_raw": pred_val,
        "predicted_price_usd": pred_val * 100000.0,
        "lower_bound_usd": lower_bound * 100000.0,
        "upper_bound_usd": upper_bound * 100000.0,
        "features": df_feat.iloc[0].to_dict()
    }

def explain_prediction_shap(input_dict: dict) -> pd.DataFrame:
    """Returns SHAP feature contribution values for the given property input."""
    load_artifacts()
    res = predict_property_price(input_dict)
    cluster_id = res["cluster_id"]
    df_feat = preprocess_input(input_dict)[MODEL_FEATURES]

    model = _cluster_models[cluster_id]
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(df_feat)

    if isinstance(shap_values, list):
        shap_vals = shap_values[0][0]
    elif len(shap_values.shape) == 2:
        shap_vals = shap_values[0]
    else:
        shap_vals = shap_values

    df_shap = pd.DataFrame({
        "Feature": MODEL_FEATURES,
        "SHAP_Value": shap_vals,
        "Feature_Value": df_feat.iloc[0].values
    }).sort_values(by="SHAP_Value", key=abs, ascending=False)

    return df_shap

def find_comparable_properties(input_dict: dict, top_n: int = 5) -> pd.DataFrame:
    """Finds top N nearest comparable sales within the same micro-market cluster."""
    load_artifacts()
    res = predict_property_price(input_dict)
    cluster_id = res["cluster_id"]
    df_feat = preprocess_input(input_dict)

    cluster_data = _clustered_df[_clustered_df["Cluster"] == cluster_id].copy()
    if len(cluster_data) == 0:
        cluster_data = _clustered_df.copy()

    # Nearest neighbors on normalized spatial & economic features
    nn_cols = ["Latitude", "Longitude", "MedInc", "HouseAge", "dist_coastline"]
    X_cluster_nn = _scaler.transform(cluster_data[CLUSTER_FEATURES])
    X_input_nn = _scaler.transform(df_feat[CLUSTER_FEATURES])

    nn = NearestNeighbors(n_neighbors=min(top_n, len(cluster_data)))
    nn.fit(X_cluster_nn)
    distances, indices = nn.kneighbors(X_input_nn)

    comps = cluster_data.iloc[indices[0]].copy()
    comps["Similarity_Distance"] = distances[0]
    comps["Price_USD"] = comps["TargetPrice"] * 100000.0

    output_cols = ["Latitude", "Longitude", "MedInc", "HouseAge", "RoomsPerHousehold", "Price_USD", "Similarity_Distance"]
    available_cols = [c for c in output_cols if c in comps.columns]
    return comps[available_cols].head(top_n)

def detect_mispricing(actual_price_usd: float, predicted_price_usd: float) -> dict:
    """Detects whether a property is Undervalued, Fair Market Value, or Overpriced."""
    if actual_price_usd is None or actual_price_usd <= 0:
        return {"status": "Unknown", "badge": "GRAY", "diff_pct": 0.0}

    diff_pct = ((actual_price_usd - predicted_price_usd) / predicted_price_usd) * 100.0

    if diff_pct < -8.0:
        return {"status": "Undervalued (Bargain)", "badge": "GREEN", "diff_pct": diff_pct}
    elif diff_pct > 8.0:
        return {"status": "Overpriced", "badge": "RED", "diff_pct": diff_pct}
    else:
        return {"status": "Fair Market Value", "badge": "BLUE", "diff_pct": diff_pct}

if __name__ == "__main__":
    print("Testing Analytics Engine...")
    sample_input = {
        "Latitude": 37.7749,
        "Longitude": -122.4194,
        "MedInc": 8.5,
        "HouseAge": 25.0,
        "TotalRooms": 6.0,
        "TotalBedrooms": 1.0,
        "Population": 3.0,
        "Households": 2.5
    }

    pred = predict_property_price(sample_input)
    print("\n--- Prediction Output ---")
    print(f"Cluster ID     : {pred['cluster_id']}")
    print(f"Predicted Price: ${pred['predicted_price_usd']:,.2f}")
    print(f"90% CI Lower   : ${pred['lower_bound_usd']:,.2f}")
    print(f"90% CI Upper   : ${pred['upper_bound_usd']:,.2f}")

    print("\n--- SHAP Feature Impact (Top 5) ---")
    shap_df = explain_prediction_shap(sample_input)
    print(shap_df.head(5))

    print("\n--- Top 3 Comparable Properties ---")
    comps_df = find_comparable_properties(sample_input, top_n=3)
    print(comps_df)

    print("\n--- Mispricing Detection Test ---")
    misprice = detect_mispricing(450000.0, pred['predicted_price_usd'])
    print(f"Actual: $450,000 | Status: {misprice['status']} ({misprice['diff_pct']:.1f}%)")
