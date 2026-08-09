import sys
import os
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import folium
from streamlit_folium import st_folium

# Add project root to sys.path for src imports
sys.path.append(os.path.abspath("."))

from src.analytics import (
    predict_property_price,
    explain_prediction_shap,
    find_comparable_properties,
    detect_mispricing,
    get_cluster_benchmark_summary,
    ECONOMIC_HUBS
)

st.set_page_config(
    page_title="California AI Real Estate Valuator",
    page_icon="🏠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for high-end UI styling
st.markdown("""
    <style>
    .main { background-color: #0E1117; }
    .stMetric { background-color: #1E222D; padding: 15px; border-radius: 10px; border: 1px solid #2E3440; }
    .kpi-card {
        background: linear-gradient(135deg, #1E222D 0%, #171A21 100%);
        border: 1px solid #2E384B;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .kpi-title { color: #8F9BAE; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .kpi-value { color: #FFFFFF; font-size: 28px; font-weight: 700; margin-top: 5px; }
    .kpi-sub { color: #5E6AD2; font-size: 14px; margin-top: 5px; font-weight: 500; }
    .badge-green { color: #00E676; font-weight: bold; background: rgba(0,230,118,0.15); padding: 5px 12px; border-radius: 20px; border: 1px solid #00E676; }
    .badge-red { color: #FF5252; font-weight: bold; background: rgba(255,82,82,0.15); padding: 5px 12px; border-radius: 20px; border: 1px solid #FF5252; }
    .badge-blue { color: #448AFF; font-weight: bold; background: rgba(68,138,255,0.15); padding: 5px 12px; border-radius: 20px; border: 1px solid #448AFF; }
    </style>
""", unsafe_allow_html=True)

st.title("🏠 California Housing AI Valuation & Intelligence Engine")
st.caption("Micro-Market Clustering • Quantile LightGBM Models • SHAP Explainability • Spatial Comps Analytics")

# Sidebar Property Input Form
st.sidebar.header("📍 Property Location & Specifications")

lat = st.sidebar.slider("Latitude", 32.5, 42.0, 37.7749, step=0.01)
lon = st.sidebar.slider("Longitude", -124.5, -114.0, -122.4194, step=0.01)
med_inc = st.sidebar.slider("Median Household Income ($10k)", 0.5, 15.0, 8.5, step=0.1)
house_age = st.sidebar.slider("House Age (Years)", 1.0, 52.0, 25.0, step=1.0)

st.sidebar.markdown("---")
st.sidebar.subheader("📐 Property Dimensions")
total_rooms = st.sidebar.number_input("Total Rooms", min_value=1.0, max_value=20.0, value=6.0, step=1.0)
total_bedrooms = st.sidebar.number_input("Total Bedrooms", min_value=1.0, max_value=10.0, value=1.0, step=1.0)
population = st.sidebar.number_input("Neighborhood Population", min_value=1.0, max_value=100.0, value=3.0, step=1.0)
households = st.sidebar.number_input("Households", min_value=1.0, max_value=20.0, value=2.5, step=0.5)

st.sidebar.markdown("---")
st.sidebar.subheader("💰 Listing Verification")
actual_price = st.sidebar.number_input("Actual Listed Price ($)", min_value=0.0, max_value=3000000.0, value=450000.0, step=10000.0)

# Construct Input Dict
input_dict = {
    "Latitude": lat,
    "Longitude": lon,
    "MedInc": med_inc,
    "HouseAge": house_age,
    "TotalRooms": total_rooms,
    "TotalBedrooms": total_bedrooms,
    "Population": population,
    "Households": households
}

# Run Analytics Engine
prediction_res = predict_property_price(input_dict)
pred_usd = prediction_res["predicted_price_usd"]
lower_usd = prediction_res["lower_bound_usd"]
upper_usd = prediction_res["upper_bound_usd"]
cluster_id = prediction_res["cluster_id"]

misprice_res = detect_mispricing(actual_price, pred_usd)

# KPI Metrics Header Cards
col1, col2, col3 = st.columns(3)

with col1:
    st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">AI Estimated Fair Value</div>
            <div class="kpi-value">${pred_usd:,.0f}</div>
            <div class="kpi-sub">Micro-Market Cluster #{cluster_id}</div>
        </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">90% Confidence Interval</div>
            <div class="kpi-value" style="font-size:22px;">${lower_usd:,.0f} - ${upper_usd:,.0f}</div>
            <div class="kpi-sub">Quantile LightGBM Bounds</div>
        </div>
    """, unsafe_allow_html=True)

with col3:
    badge_class = "badge-blue"
    if misprice_res["badge"] == "GREEN":
        badge_class = "badge-green"
    elif misprice_res["badge"] == "RED":
        badge_class = "badge-red"

    st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Market Price Evaluation</div>
            <div class="kpi-value" style="margin-top:10px;"><span class="{badge_class}">{misprice_res['status']}</span></div>
            <div class="kpi-sub">{misprice_res['diff_pct']:+.1f}% vs AI Baseline</div>
        </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# Main Dashboard Tabs
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "🗺️ Geospatial & Cluster Map", 
    "📊 SHAP Price Drivers", 
    "🎛️ What-If Price Simulator", 
    "🏘️ Comparable Properties (Comps)",
    "🏛️ Micro-Market Benchmark"
])

# TAB 1: GEOSPATIAL MAP
with tab1:
    st.subheader("Geospatial Positioning & California Economic Hub Distances")
    
    m = folium.Map(location=[lat, lon], zoom_start=9, tiles="CartoDB dark_matter")

    # Add Target Property Marker
    folium.Marker(
        [lat, lon],
        popup=f"Target Property (${pred_usd:,.0f})",
        tooltip="Target Property",
        icon=folium.Icon(color="red", icon="home")
    ).add_to(m)

    # Add Hub Markers & Lines
    for hub_name, hub_coords in ECONOMIC_HUBS.items():
        hub_title = hub_name.replace("dist_", "").upper()
        folium.Marker(
            hub_coords,
            popup=f"Hub: {hub_title}",
            icon=folium.Icon(color="blue", icon="info-sign")
        ).add_to(m)

        folium.PolyLine(
            locations=[[lat, lon], hub_coords],
            color="#448AFF",
            weight=1.5,
            opacity=0.6
        ).add_to(m)

    st_folium(m, width=1100, height=450)

    feat = prediction_res["features"]
    d_col1, d_col2, d_col3, d_col4, d_col5 = st.columns(5)
    d_col1.metric("Dist to SF", f"{feat['dist_sf']:.1f} km")
    d_col2.metric("Dist to LA", f"{feat['dist_la']:.1f} km")
    d_col3.metric("Dist to SJ", f"{feat['dist_sj']:.1f} km")
    d_col4.metric("Dist to SD", f"{feat['dist_sd']:.1f} km")
    d_col5.metric("Coastline Dist", f"{feat['dist_coastline']:.1f} km")

# TAB 2: SHAP FEATURE ATTRIBUTION
with tab2:
    st.subheader("SHAP Feature Impact on Property Valuation")
    shap_df = explain_prediction_shap(input_dict)

    # Scale SHAP values to approximate dollar impact
    shap_df["Dollar_Impact"] = shap_df["SHAP_Value"] * 100000.0
    shap_df["Color"] = np.where(shap_df["Dollar_Impact"] >= 0, "#00E676", "#FF5252")

    fig_shap = px.bar(
        shap_df,
        x="Dollar_Impact",
        y="Feature",
        orientation="h",
        title="Key Price Increasing (+Green) & Decreasing (-Red) Factors",
        labels={"Dollar_Impact": "Price Impact ($ USD)", "Feature": "Property Attribute"},
        text_auto="$,.0f"
    )
    fig_shap.update_traces(marker_color=shap_df["Color"])
    fig_shap.update_layout(template="plotly_dark", height=450, yaxis={'categoryorder':'total ascending'})
    st.plotly_chart(fig_shap, use_container_width=True)

# TAB 3: WHAT-IF PRICE SIMULATOR
with tab3:
    st.subheader("Interactive What-If Scenario Simulator")
    sim_col1, sim_col2 = st.columns([1, 2])

    with sim_col1:
        st.markdown("#### Adjust Parameters:")
        sim_income = st.slider("Simulated Income ($10k)", 0.5, 15.0, med_inc, step=0.1)
        sim_rooms = st.slider("Simulated Total Rooms", 1.0, 20.0, total_rooms, step=1.0)
        sim_age = st.slider("Simulated House Age", 1.0, 52.0, house_age, step=1.0)

        sim_input = input_dict.copy()
        sim_input["MedInc"] = sim_income
        sim_input["TotalRooms"] = sim_rooms
        sim_input["HouseAge"] = sim_age

        sim_res = predict_property_price(sim_input)
        sim_pred_usd = sim_res["predicted_price_usd"]
        diff = sim_pred_usd - pred_usd

        st.metric("Simulated Predicted Price", f"${sim_pred_usd:,.0f}", delta=f"${diff:,.0f}")

    with sim_col2:
        fig_gauge = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=sim_pred_usd,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': "Valuation Shift ($ USD)", 'font': {'size': 20}},
            delta={'reference': pred_usd, 'increasing': {'color': "#00E676"}, 'decreasing': {'color': "#FF5252"}},
            gauge={
                'axis': {'range': [None, max(800000, sim_pred_usd * 1.3)], 'tickwidth': 1},
                'bar': {'color': "#5E6AD2"},
                'steps': [
                    {'range': [0, lower_usd], 'color': "#171A21"},
                    {'range': [lower_usd, upper_usd], 'color': "#2E384B"}
                ],
            }
        ))
        fig_gauge.update_layout(template="plotly_dark", height=400)
        st.plotly_chart(fig_gauge, use_container_width=True)

# TAB 4: COMPARABLE PROPERTIES
with tab4:
    st.subheader(f"Top 5 Nearest Comparable Properties (Cluster #{cluster_id})")
    comps_df = find_comparable_properties(input_dict, top_n=5)

    # Format dataframe for UI display
    display_df = comps_df.copy()
    display_df["Price ($)"] = display_df["Price_USD"].apply(lambda x: f"${x:,.0f}")
    display_df["MedInc ($10k)"] = display_df["MedInc"].apply(lambda x: f"${x:.2f}k")
    display_df["House Age"] = display_df["HouseAge"].astype(int)
    display_df["Similarity Score"] = display_df["Similarity_Distance"].apply(lambda x: f"{x:.3f}")

    show_cols = ["Price ($)", "MedInc ($10k)", "House Age", "RoomsPerHousehold", "Latitude", "Longitude", "Similarity Score"]
    available_show = [c for c in show_cols if c in display_df.columns]

    st.dataframe(
        display_df[available_show],
        use_container_width=True,
        hide_index=True
    )

# TAB 5: MICRO-MARKET BENCHMARK
with tab5:
    st.subheader("Micro-Market Clustering & Model Benchmarking")
    st.markdown("Proof of performance: Specialized LightGBM models trained per geographic cluster vs. a single global baseline model.")

    summary = get_cluster_benchmark_summary()

    bm_col1, bm_col2, bm_col3 = st.columns(3)
    bm_col1.metric("Overall Global Model MAE", f"${summary['overall_global_mae']:,.0f}")
    bm_col2.metric("Micro-Market Cluster MAE", f"${summary['overall_cluster_mae']:,.0f}", delta=f"-${summary['overall_global_mae'] - summary['overall_cluster_mae']:,.0f} (-{summary['improvement_pct']}%)", delta_color="normal")
    bm_col3.metric("Micro-Markets (KMeans)", f"{len(summary['benchmark_data'])} Clusters")

    st.markdown("<br>", unsafe_allow_html=True)

    st.markdown("#### 📈 MAE Error Comparison: Global Baseline vs. Micro-Market Models")
    bm_df = summary["benchmark_data"].melt(id_vars=["Micro-Market Cluster"], value_vars=["Global Model MAE ($)", "Cluster Model MAE ($)"], var_name="Model Type", value_name="MAE ($)")
    
    fig_bm = px.bar(
        bm_df,
        x="Micro-Market Cluster",
        y="MAE ($)",
        color="Model Type",
        barmode="group",
        title="Mean Absolute Error ($ USD) by Micro-Market Cluster",
        color_discrete_map={"Global Model MAE ($)": "#FF5252", "Cluster Model MAE ($)": "#00E676"},
        text_auto="$,.0f"
    )
    fig_bm.update_layout(template="plotly_dark", height=420)
    st.plotly_chart(fig_bm, use_container_width=True)

    st.markdown("#### 📋 Geographic & Demographic Profile by Micro-Market")
    st.dataframe(
        summary["cluster_stats"],
        use_container_width=True,
        hide_index=True
    )

