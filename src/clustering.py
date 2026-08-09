import os
import joblib
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

FEATURE_COLS = [
    "Latitude", "Longitude", "MedInc", "HouseAge", 
    "RoomsPerHousehold", "BedroomsPerRoom", 
    "dist_sf", "dist_la", "dist_sj", "dist_sd", "dist_coastline"
]

def run_clustering():
    """Loads processed housing data, scales features, fits KMeans clustering, and saves models & dataset."""
    input_path = "data/processed_housing.csv"
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file '{input_path}' not found. Please run feature_engineering.py first.")

    print(f"Loading '{input_path}'...")
    df = pd.read_csv(input_path)

    # Ensure RoomsPerHousehold column exists
    if "RoomsPerHousehold" not in df.columns and "AveRooms" in df.columns:
        df["RoomsPerHousehold"] = df["AveRooms"]

    print("Scaling features using StandardScaler...")
    X = df[FEATURE_COLS].copy()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print("Training KMeans clustering model (n_clusters=6)...")
    kmeans = KMeans(n_clusters=6, random_state=42, n_init=10)
    df["Cluster"] = kmeans.fit_predict(X_scaled)

    # Compute Silhouette Score (subsample 5000 rows for fast computation)
    sample_idx = pd.Series(range(len(df))).sample(n=min(5000, len(df)), random_state=42)
    sil_score = silhouette_score(X_scaled[sample_idx], df["Cluster"].iloc[sample_idx])
    print(f"Clustering Complete! Silhouette Score (sample=5000): {sil_score:.4f}")

    # Ensure models directory exists
    os.makedirs("models", exist_ok=True)
    os.makedirs("data", exist_ok=True)

    scaler_path = "models/scaler.joblib"
    kmeans_path = "models/kmeans.joblib"
    output_path = "data/clustered_housing.csv"

    joblib.dump(scaler, scaler_path)
    joblib.dump(kmeans, kmeans_path)
    df.to_csv(output_path, index=False)

    print(f"Saved scaler to '{scaler_path}'")
    print(f"Saved KMeans model to '{kmeans_path}'")
    print(f"Saved clustered dataset to '{output_path}' ({df.shape[0]} rows, {df.shape[1]} columns)")

if __name__ == "__main__":
    run_clustering()
