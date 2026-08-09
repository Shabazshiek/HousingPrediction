import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin } from 'lucide-react';

// Fix default Leaflet icon paths with custom glowing marker
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
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [lat, lon, zoom, map]);
  return null;
}

export default function MapView({ lat, lon, zoom = 11, theme, prediction, economicHubs, selectedCity }) {
  const [mapStyle, setMapStyle] = useState('dark'); // 'dark', 'satellite', 'street'

  const predUSD = prediction?.predicted_price_usd || 0;
  const features = prediction?.features || {};

  // Tile layer mapping for professional GIS maps
  let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  let attribution = '&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ';

  if (mapStyle === 'satellite') {
    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    attribution = '&copy; <a href="https://www.esri.com/">Esri World Imagery</a>';
  } else if (mapStyle === 'street' || (theme === 'light' && mapStyle === 'dark')) {
    tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    attribution = '&copy; <a href="https://carto.com/">CARTO Voyager</a>';
  }

  const hubs = economicHubs || {
    "dist_sf": [37.7749, -122.4194],
    "dist_la": [34.0522, -118.2437],
    "dist_sj": [37.3382, -121.8863],
    "dist_sd": [32.7157, -117.1611]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Map Style Selector Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} color="var(--accent-primary)" /> {selectedCity} Interactive GIS Map
        </span>

        <div style={{ display: 'flex', gap: '6px', background: 'var(--input-bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setMapStyle('dark')}
            style={{
              padding: '5px 12px',
              borderRadius: '7px',
              border: 'none',
              background: mapStyle === 'dark' ? 'var(--accent-primary)' : 'transparent',
              color: mapStyle === 'dark' ? '#FFF' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🌌 Esri Dark Canvas
          </button>

          <button
            onClick={() => setMapStyle('satellite')}
            style={{
              padding: '5px 12px',
              borderRadius: '7px',
              border: 'none',
              background: mapStyle === 'satellite' ? 'var(--accent-primary)' : 'transparent',
              color: mapStyle === 'satellite' ? '#FFF' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🛰️ Satellite
          </button>

          <button
            onClick={() => setMapStyle('street')}
            style={{
              padding: '5px 12px',
              borderRadius: '7px',
              border: 'none',
              background: mapStyle === 'street' ? 'var(--accent-primary)' : 'transparent',
              color: mapStyle === 'street' ? '#FFF' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🗺️ Street Map
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div style={{
        height: '420px',
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
            attribution={attribution}
            url={tileUrl}
          />
          
          {/* Target Property Marker */}
          <Marker position={[lat, lon]}>
            <Popup>
              <div style={{ padding: '4px', textAlign: 'center' }}>
                <strong style={{ color: '#2563EB', fontSize: '14px' }}>Target Property ({selectedCity})</strong><br />
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                  Fair Value: ${Math.round(predUSD).toLocaleString()}
                </span>
              </div>
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
                  pathOptions={{ color: '#F59E0B', weight: 2.5, opacity: 0.8, dashArray: '6, 8' }}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Distance Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        <div style={{ background: 'var(--input-bg)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Dist to SF</div>
          <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px', color: 'var(--text-main)' }}>{(features.dist_sf || 0).toFixed(1)} km</div>
        </div>

        <div style={{ background: 'var(--input-bg)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Dist to LA</div>
          <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px', color: 'var(--text-main)' }}>{(features.dist_la || 0).toFixed(1)} km</div>
        </div>

        <div style={{ background: 'var(--input-bg)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Dist to SJ</div>
          <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px', color: 'var(--text-main)' }}>{(features.dist_sj || 0).toFixed(1)} km</div>
        </div>

        <div style={{ background: 'var(--input-bg)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Dist to SD</div>
          <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px', color: 'var(--text-main)' }}>{(features.dist_sd || 0).toFixed(1)} km</div>
        </div>

        <div style={{ background: 'var(--input-bg)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Coast Dist</div>
          <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px', color: '#F59E0B' }}>{(features.dist_coastline || 0).toFixed(1)} km</div>
        </div>
      </div>
    </div>
  );
}
