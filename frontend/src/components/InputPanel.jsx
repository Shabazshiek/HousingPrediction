import React from 'react';
import { MapPin, Sliders, Home, DollarSign, Layers } from 'lucide-react';

export default function InputPanel({ cities, selectedCity, setSelectedCity, inputs, setInputs, prediction }) {
  if (!cities) return null;

  const cityKeys = Object.keys(cities);

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    const info = cities[cityName];
    if (info) {
      setInputs(prev => ({
        ...prev,
        Latitude: info.lat,
        Longitude: info.lon,
        MedInc: info.med_inc
      }));
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Section 1: City Selector */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <MapPin size={16} color="#6366F1" /> Select California Metro / Region
        </label>
        <select
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--input-bg)',
            color: 'var(--text-main)',
            fontSize: '14px',
            fontWeight: '600',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {cityKeys.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Optional Fine-Tune Expandable Slider */}
      <details style={{
        background: 'rgba(148, 163, 184, 0.05)',
        borderRadius: '10px',
        padding: '12px 16px',
        border: '1px solid var(--border-color)'
      }}>
        <summary style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={14} /> Fine-Tune Coordinates (Lat / Lon)
        </summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Latitude</span>
              <span>{inputs.Latitude.toFixed(4)}</span>
            </div>
            <input
              type="range"
              min={inputs.Latitude - 0.3}
              max={inputs.Latitude + 0.3}
              step={0.005}
              value={inputs.Latitude}
              onChange={(e) => setInputs(prev => ({ ...prev, Latitude: parseFloat(e.target.value) }))}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Longitude</span>
              <span>{inputs.Longitude.toFixed(4)}</span>
            </div>
            <input
              type="range"
              min={inputs.Longitude - 0.3}
              max={inputs.Longitude + 0.3}
              step={0.005}
              value={inputs.Longitude}
              onChange={(e) => setInputs(prev => ({ ...prev, Longitude: parseFloat(e.target.value) }))}
            />
          </div>
        </div>
      </details>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

      {/* Section 2: Home Specifications */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Home size={16} color="#8B5CF6" /> Property Dimensions & Age
        </label>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Bedrooms */}
          <div>
            <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Bedrooms
            </label>
            <select
              value={inputs.TotalBedrooms}
              onChange={(e) => {
                const beds = parseFloat(e.target.value);
                const suggestedRooms = beds === 1 ? 3 : beds === 2 ? 5 : beds === 3 ? 6 : beds === 4 ? 8 : 10;
                setInputs(prev => ({
                  ...prev,
                  TotalBedrooms: beds,
                  TotalRooms: Math.max(prev.TotalRooms, suggestedRooms),
                  AskingPrice: prediction?.predicted_price_usd ? Math.round(prediction.predicted_price_usd) : prev.AskingPrice
                }));
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-main)',
                fontSize: '13.5px',
                fontWeight: '600'
              }}
            >
              <option value={1}>1 Bedroom (3 Rooms)</option>
              <option value={2}>2 Bedrooms (5 Rooms)</option>
              <option value={3}>3 Bedrooms (6 Rooms)</option>
              <option value={4}>4 Bedrooms (8 Rooms)</option>
              <option value={5}>5+ Bedrooms (10 Rooms)</option>
            </select>
          </div>

          {/* Total Rooms Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>
              <span>Total Rooms (incl. living/dining)</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{inputs.TotalRooms} Rooms</span>
            </div>
            <input
              type="range"
              min={2}
              max={16}
              step={1}
              value={inputs.TotalRooms}
              onChange={(e) => {
                const rooms = parseFloat(e.target.value);
                setInputs(prev => ({
                  ...prev,
                  TotalRooms: rooms,
                  AskingPrice: prediction?.predicted_price_usd ? Math.round(prediction.predicted_price_usd) : prev.AskingPrice
                }));
              }}
            />
          </div>

          {/* House Age Category */}
          <div>
            <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Building Age
            </label>
            <select
              value={inputs.HouseAge}
              onChange={(e) => setInputs(prev => ({ ...prev, HouseAge: parseFloat(e.target.value) }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-main)',
                fontSize: '13.5px',
                fontWeight: '600'
              }}
            >
              <option value={3.0}>Brand New (&lt; 5 yrs)</option>
              <option value={10.0}>Modern (5-15 yrs)</option>
              <option value={22.0}>Established (15-30 yrs)</option>
              <option value={40.0}>Vintage (30+ yrs)</option>
            </select>
          </div>

          {/* Neighborhood Income Tier */}
          <div>
            <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              Neighborhood Income Tier
            </label>
            <select
              value={inputs.MedInc}
              onChange={(e) => setInputs(prev => ({ ...prev, MedInc: parseFloat(e.target.value) }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-main)',
                fontSize: '13.5px',
                fontWeight: '600'
              }}
            >
              <option value={4.5}>Moderate Income (~$45k/yr)</option>
              <option value={7.5}>Middle Class (~$75k/yr)</option>
              <option value={10.5}>High Income (~$105k/yr)</option>
              <option value={13.5}>Ultra-High Income (~$135k+/yr)</option>
            </select>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />

      {/* Section 3: Target Listing Price */}
      <div>
        <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <DollarSign size={16} color="#34D399" /> Asking Listed Price ($ USD)
        </label>
        <input
          type="number"
          step={25000}
          min={50000}
          max={5000000}
          value={inputs.AskingPrice}
          onChange={(e) => setInputs(prev => ({ ...prev, AskingPrice: parseFloat(e.target.value) || 0 }))}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--input-bg)',
            color: 'var(--text-main)',
            fontSize: '15px',
            fontWeight: '700',
            outline: 'none'
          }}
        />

        {/* Quick Mispricing Presets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => {
              const pred = prediction?.predicted_price_usd || 500000;
              setInputs(prev => ({ ...prev, AskingPrice: Math.round(pred * 0.85) }));
            }}
            style={{
              padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.4)',
              background: 'rgba(52,211,153,0.1)', color: '#34D399', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer'
            }}
          >
            🔥 Bargain
          </button>

          <button
            type="button"
            onClick={() => {
              const pred = prediction?.predicted_price_usd || 500000;
              setInputs(prev => ({ ...prev, AskingPrice: Math.round(pred) }));
            }}
            style={{
              padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(96,165,250,0.4)',
              background: 'rgba(96,165,250,0.1)', color: '#60A5FA', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer'
            }}
          >
            ⚖️ Fair Value
          </button>

          <button
            type="button"
            onClick={() => {
              const pred = prediction?.predicted_price_usd || 500000;
              setInputs(prev => ({ ...prev, AskingPrice: Math.round(pred * 1.25) }));
            }}
            style={{
              padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.4)',
              background: 'rgba(248,113,113,0.1)', color: '#F87171', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer'
            }}
          >
            ⚠️ Overpriced
          </button>
        </div>
      </div>
    </div>
  );
}
