import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
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
  const [theme, setTheme] = useState('light'); // Default to sleek Light Mode
  const [cities, setCities] = useState(null);
  const [economicHubs, setEconomicHubs] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Los Angeles');
  const [searchAddress, setSearchAddress] = useState('1234 Maple Ave, Los Angeles, CA 90028');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeDashboardSubTab, setActiveDashboardSubTab] = useState('map');
  const [isExporting, setIsExporting] = useState(false);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

  // Property Inputs State
  const [inputs, setInputs] = useState({
    Latitude: 34.0522,
    Longitude: -118.2437,
    MedInc: 7.5,
    HouseAge: 22.0,
    TotalRooms: 6.0,
    TotalBedrooms: 3.0,
    AskingPrice: 845000.0
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
        if (data.cities['Los Angeles']) {
          const la = data.cities['Los Angeles'];
          setInputs(prev => ({
            ...prev,
            Latitude: la.lat,
            Longitude: la.lon,
            MedInc: la.med_inc
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Left Sidebar matching Screenshot 1 */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar matching Screenshot 1 */}
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          onExportReport={handleExportReport}
          isExporting={isExporting}
          onToggleAddProperty={() => setIsAddPropertyOpen(prev => !prev)}
          searchAddress={searchAddress}
          setSearchAddress={setSearchAddress}
        />

        {/* Main Body Layout matching Screenshot 1 */}
        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {/* Header Title Section matching Screenshot 1 */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Valuation Dashboard
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {searchAddress}
            </p>
          </div>

          {/* Grid Layout matching Screenshot 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
            {/* Left Column: Hero Blue Valuation Card + SHAP Chart + Controls matching Screenshot 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Blue Hero Valuation Card */}
              <MetricCards prediction={prediction} mispricing={mispricing} selectedCity={selectedCity} />

              {/* Embedded SHAP Drivers Card directly underneath matching Screenshot 1 */}
              <div className="ui-card">
                <ShapChart shapData={shapData} />
              </div>

              {/* Property Specification Input Controls */}
              <InputPanel
                cities={cities}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                inputs={inputs}
                setInputs={setInputs}
                prediction={prediction}
                isOpen={false}
              />
            </div>

            {/* Right Column: Interactive Leaflet Map View + Distance Metrics matching Screenshot 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="ui-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    Geospatial Location Map
                  </h3>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Leaflet Map View
                  </span>
                </div>

                <MapView
                  lat={inputs.Latitude}
                  lon={inputs.Longitude}
                  zoom={cityZoom}
                  theme={theme}
                  prediction={prediction}
                  economicHubs={economicHubs}
                  selectedCity={selectedCity}
                />
              </div>

              {/* Analytics Sub-Tabs Container (What-If, Comps, Benchmark) */}
              <div className="ui-card">
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setActiveDashboardSubTab('simulator')}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      background: activeDashboardSubTab === 'simulator' ? 'var(--accent-primary)' : 'transparent',
                      color: activeDashboardSubTab === 'simulator' ? '#FFF' : 'var(--text-muted)',
                      fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Sliders size={15} /> What-If Simulator
                  </button>

                  <button
                    onClick={() => setActiveDashboardSubTab('comps')}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      background: activeDashboardSubTab === 'comps' ? 'var(--accent-primary)' : 'transparent',
                      color: activeDashboardSubTab === 'comps' ? '#FFF' : 'var(--text-muted)',
                      fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Building size={15} /> Comps Table
                  </button>

                  <button
                    onClick={() => setActiveDashboardSubTab('benchmark')}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      background: activeDashboardSubTab === 'benchmark' ? 'var(--accent-primary)' : 'transparent',
                      color: activeDashboardSubTab === 'benchmark' ? '#FFF' : 'var(--text-muted)',
                      fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Award size={15} /> Cluster Accuracy Benchmark
                  </button>
                </div>

                {activeDashboardSubTab === 'simulator' && (
                  <WhatIfSimulator currentInputs={inputs} basePrediction={prediction} />
                )}

                {activeDashboardSubTab === 'comps' && (
                  <CompsTable compsData={compsData} clusterId={prediction?.cluster_id} />
                )}

                {activeDashboardSubTab === 'benchmark' && (
                  <BenchmarkTab />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Slide-over Drawer for + Add property button */}
      {isAddPropertyOpen && (
        <InputPanel
          cities={cities}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          inputs={inputs}
          setInputs={setInputs}
          prediction={prediction}
          isOpen={true}
          onClose={() => setIsAddPropertyOpen(false)}
        />
      )}
    </div>
  );
}
