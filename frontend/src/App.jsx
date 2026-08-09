import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import InputPanel from './components/InputPanel';
import MapView from './components/MapView';
import ShapChart from './components/ShapChart';
import WhatIfSimulator from './components/WhatIfSimulator';
import CompsTable from './components/CompsTable';
import BenchmarkTab from './components/BenchmarkTab';
import { Map, BarChart3, Sliders, Building, Award } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [cities, setCities] = useState(null);
  const [economicHubs, setEconomicHubs] = useState(null);
  const [selectedCity, setSelectedCity] = useState('San Francisco');
  const [activeTab, setActiveTab] = useState('map');
  const [isExporting, setIsExporting] = useState(false);

  // Property Inputs State
  const [inputs, setInputs] = useState({
    Latitude: 37.7749,
    Longitude: -122.4194,
    MedInc: 9.5,
    HouseAge: 22.0,
    TotalRooms: 6.0,
    TotalBedrooms: 3.0,
    AskingPrice: 650000.0
  });

  // API Responses State
  const [prediction, setPrediction] = useState(null);
  const [mispricing, setMispricing] = useState(null);
  const [shapData, setShapData] = useState([]);
  const [compsData, setCompsData] = useState([]);

  // Apply dark/light theme attribute to root HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch Cities on Load
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/cities')
      .then(res => res.json())
      .then(data => {
        setCities(data.cities);
        setEconomicHubs(data.economic_hubs);
        if (data.cities['San Francisco']) {
          const sf = data.cities['San Francisco'];
          setInputs(prev => ({
            ...prev,
            Latitude: sf.lat,
            Longitude: sf.lon,
            MedInc: sf.med_inc
          }));
        }
      })
      .catch(err => console.error('Failed to fetch cities:', err));
  }, []);

  // Fetch Predictions & Analytics when inputs change
  useEffect(() => {
    const payload = { ...inputs, CityName: selectedCity };

    // 1. Predict Valuation
    fetch('http://127.0.0.1:8000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setPrediction(data.prediction);
        setMispricing(data.mispricing);
      })
      .catch(err => console.error(err));

    // 2. Fetch SHAP Impact
    fetch('http://127.0.0.1:8000/api/shap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => setShapData(data))
      .catch(err => console.error(err));

    // 3. Fetch Comps
    fetch('http://127.0.0.1:8000/api/comps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => setCompsData(data))
      .catch(err => console.error(err));
  }, [inputs, selectedCity]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const payload = { ...inputs, CityName: selectedCity };
      const res = await fetch('http://127.0.0.1:8000/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      const blob = new Blob([data.report], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Valuation_Report_${selectedCity.replace(/ /g, '_')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export report:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const cityZoom = cities && cities[selectedCity] ? cities[selectedCity].zoom : 11;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onExportReport={handleExportReport}
        isExporting={isExporting}
      />

      <main style={{ padding: '32px', flex: 1, maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {/* Top Hero Valuation Cards */}
        <MetricCards prediction={prediction} mispricing={mispricing} />

        {/* Main Grid Layout: Left Input Panel + Right Interactive Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Left Panel */}
          <InputPanel
            cities={cities}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            inputs={inputs}
            setInputs={setInputs}
            prediction={prediction}
          />

          {/* Right Panel Tabs Container */}
          <div className="glass-card">
            {/* Tab Header Navigation Buttons */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
              <button
                onClick={() => setActiveTab('map')}
                data-baseweb="tab"
                aria-selected={activeTab === 'map'}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Map size={16} /> Geospatial Map
              </button>

              <button
                onClick={() => setActiveTab('shap')}
                data-baseweb="tab"
                aria-selected={activeTab === 'shap'}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <BarChart3 size={16} /> SHAP Drivers
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                data-baseweb="tab"
                aria-selected={activeTab === 'simulator'}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Sliders size={16} /> What-If Simulator
              </button>

              <button
                onClick={() => setActiveTab('comps')}
                data-baseweb="tab"
                aria-selected={activeTab === 'comps'}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Building size={16} /> Comparable Comps
              </button>

              <button
                onClick={() => setActiveTab('benchmark')}
                data-baseweb="tab"
                aria-selected={activeTab === 'benchmark'}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Award size={16} /> Cluster Benchmark
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'map' && (
              <MapView
                lat={inputs.Latitude}
                lon={inputs.Longitude}
                zoom={cityZoom}
                theme={theme}
                prediction={prediction}
                economicHubs={economicHubs}
              />
            )}

            {activeTab === 'shap' && (
              <ShapChart shapData={shapData} />
            )}

            {activeTab === 'simulator' && (
              <WhatIfSimulator currentInputs={inputs} basePrediction={prediction} />
            )}

            {activeTab === 'comps' && (
              <CompsTable compsData={compsData} clusterId={prediction?.cluster_id} />
            )}

            {activeTab === 'benchmark' && (
              <BenchmarkTab />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
