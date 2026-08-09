import os
import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

MODEL_FEATURES = [
    "MedInc", "HouseAge", "RoomsPerHousehold", "BedroomsPerRoom", 
    "Population", "AveOccup", "Latitude", "Longitude", 
    "dist_sf", "dist_la", "dist_sj", "dist_sd", "dist_coastline"
]

def train_cluster_models():
    """Trains specialized target and quantile LightGBM models for each micro-market cluster."""
    input_path = "data/clustered_housing.csv"
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file '{input_path}' not found. Please run clustering.py first.")

    print(f"Loading '{input_path}'...")
    df = pd.read_csv(input_path)

    # Ensure required feature names exist
    if "RoomsPerHousehold" not in df.columns and "AveRooms" in df.columns:
        df["RoomsPerHousehold"] = df["AveRooms"]
    if "AveOccup" not in df.columns and "PopulationPerHousehold" in df.columns:
        df["AveOccup"] = df["PopulationPerHousehold"]

    os.makedirs("models", exist_ok=True)

    all_y_true = []
    all_y_pred = []

    clusters = sorted(df["Cluster"].unique())
    print(f"Training LightGBM models for clusters: {clusters}...")

    for cluster_id in clusters:
        cluster_df = df[df["Cluster"] == cluster_id]
        X_cluster = cluster_df[MODEL_FEATURES]
        y_cluster = cluster_df["TargetPrice"]

        # 1. Main point prediction model
        model_main = LGBMRegressor(objective="regression", random_state=42, n_estimators=100, verbose=-1)
        model_main.fit(X_cluster, y_cluster)
        joblib.dump(model_main, f"models/lgbm_cluster_{cluster_id}.joblib")

        # 2. Lower bound quantile model (alpha=0.10)
        model_lower = LGBMRegressor(objective="quantile", alpha=0.10, random_state=42, n_estimators=100, verbose=-1)
        model_lower.fit(X_cluster, y_cluster)
        joblib.dump(model_lower, f"models/lgbm_lower_cluster_{cluster_id}.joblib")

        # 3. Upper bound quantile model (alpha=0.90)
        model_upper = LGBMRegressor(objective="quantile", alpha=0.90, random_state=42, n_estimators=100, verbose=-1)
        model_upper.fit(X_cluster, y_cluster)
        joblib.dump(model_upper, f"models/lgbm_upper_cluster_{cluster_id}.joblib")

        # Track predictions for overall evaluation
        preds = model_main.predict(X_cluster)
        all_y_true.extend(y_cluster)
        all_y_pred.extend(preds)

        cluster_mae = mean_absolute_error(y_cluster, preds)
        print(f"Cluster {cluster_id} ({len(cluster_df)} samples) - MAE: ${cluster_mae * 100000:,.2f}")

    overall_mae = mean_absolute_error(all_y_true, all_y_pred)
    overall_rmse = root_mean_squared_error(all_y_true, all_y_pred)

    print("\n--- Overall Model Evaluation Metrics ---")
    print(f"Overall MAE : {overall_mae:.4f} (approx ${overall_mae * 100000:,.2f})")
    print(f"Overall RMSE: {overall_rmse:.4f} (approx ${overall_rmse * 100000:,.2f})")
    print("All cluster models successfully trained and saved to 'models/'.")

if __name__ == "__main__":
    train_cluster_models()
