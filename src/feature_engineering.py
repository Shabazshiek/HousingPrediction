import os
import numpy as np
import pandas as pd
from geopy.distance import geodesic
from sklearn.datasets import fetch_california_housing

# Key economic hubs coordinates (Latitude, Longitude)
ECONOMIC_HUBS = {
    "dist_sf": (37.7749, -122.4194),       # San Francisco
    "dist_la": (34.0522, -118.2437),       # Los Angeles
    "dist_sj": (37.3382, -121.8863),       # San Jose
    "dist_sd": (32.7157, -117.1611)        # San Diego
}

# Approximate coastal reference points along California shoreline
COASTLINE_POINTS = [
    (32.7157, -117.1611), (33.7420, -118.2700), (34.4208, -119.6982),
    (36.6002, -121.8947), (37.7749, -122.4194), (38.3317, -123.0481)
]

def min_coastal_distance(lat, lon):
    """Calculates shortest geodesic distance in km to the coastline."""
    point = (lat, lon)
    return min(geodesic(point, coast).kilometers for coast in COASTLINE_POINTS)

def build_feature_pipeline():
    """Loads raw dataset, engineers spatial and structural ratios, and exports CSV."""
    print("Loading California Housing Dataset...")
    housing = fetch_california_housing(as_frame=True)
    df = housing.frame.copy()

    # Rename median house value target for clarity
    df.rename(columns={"MedHouseVal": "TargetPrice"}, inplace=True)

    print("Engineering structural ratios...")
    # sklearn's California Housing dataset columns:
    # ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population', 'AveOccup', 'Latitude', 'Longitude', 'MedHouseVal']
    # Note: 'AveRooms' is already Rooms/Household, 'AveBedrms' is Bedrooms/Household, 'AveOccup' is Population/Household
    df["BedroomsPerRoom"] = df["AveBedrms"] / df["AveRooms"]

    print("Computing geodesic distances to economic hubs & coast...")
    for city, coord in ECONOMIC_HUBS.items():
        df[city] = df.apply(lambda row: geodesic((row["Latitude"], row["Longitude"]), coord).kilometers, axis=1)

    df["dist_coastline"] = df.apply(lambda row: min_coastal_distance(row["Latitude"], row["Longitude"]), axis=1)

    # Ensure output directory exists before saving
    os.makedirs("data", exist_ok=True)
    output_path = "data/processed_housing.csv"
    df.to_csv(output_path, index=False)
    print(f"Feature pipeline complete! Processed dataset saved to '{output_path}' ({df.shape[0]} rows, {df.shape[1]} columns).")

if __name__ == "__main__":
    build_feature_pipeline()
