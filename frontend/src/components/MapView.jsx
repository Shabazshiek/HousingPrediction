import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterMap({ lat, lon, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], zoom);
    // Invalidate size to fix Leaflet gray box bug
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [lat, lon, zoom, map]);
  return null;
}

export default function MapView({ lat, lon, zoom = 11, theme, prediction, economicHubs, selectedCity }) {
  const predUSD = prediction?.predicted_price_usd || 0;
  const features = prediction?.features || {};

  // Tile layer according to active theme
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const hubs = economicHubs || {
    "dist_sf": [37.7749, -122.4194],
    "dist_la": [34.0522, -118.2437],
    "dist_sj": [37.3382, -121.8863],
    "dist_sd": [32.7157, -117.1611]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Map Container */}
      <div style={{
        height: '460px',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-main)',
        position: 'relative'
      }}>
        <MapContainer
          center={[lat, lon]}
          zoom={zoom}
          style={{ height: '100%', width: '100%', borderRadius: '16px' }}
        >
          <RecenterMap lat={lat} lon={lon} zoom={zoom} />
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrl}
          />
          
          {/* Target Property Marker matching Screenshot 1 */}
          <Marker position={[lat, lon]}>
            <Popup>
              <strong>Target Property ({selectedCity})</strong><br />
              Fair Value: ${Math.round(predUSD).toLocaleString()}
            </Popup>
          </Marker>

          {/* Hub Markers & Connecting Polyline Lines */}
          {Object.entries(hubs).map(([hubKey, coords]) => {
            const title = hubKey.replace('dist_', '').toUpperCase();
            return (
              <React.Fragment key={hubKey}>
                <Marker position={coords}>
                  <Popup>Hub: {title}</Popup>
                </Marker>
                <Polyline
                  positions={[[lat, lon], coords]}
                  pathOptions={{ color: '#38BDF8', weight: 2, opacity: 0.6, dashArray: '4, 8' }}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Distance Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Dist to SF</div>
          <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: 'var(--text-main)' }}>{(features.dist_sf || 0).toFixed(1)} km</div>
        </div>

        <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Dist to LA</div>
          <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: 'var(--text-main)' }}>{(features.dist_la || 0).toFixed(1)} km</div>
        </div>

        <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Dist to SJ</div>
          <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: 'var(--text-main)' }}>{(features.dist_sj || 0).toFixed(1)} km</div>
        </div>

        <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Dist to SD</div>
          <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: 'var(--text-main)' }}>{(features.dist_sd || 0).toFixed(1)} km</div>
        </div>

        <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Coast Dist</div>
          <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px', color: '#38BDF8' }}>{(features.dist_coastline || 0).toFixed(1)} km</div>
        </div>
      </div>
    </div>
  );
}
