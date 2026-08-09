import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function WhatIfSimulator({ currentInputs, basePrediction }) {
  const [simIncome, setSimIncome] = useState(currentInputs?.MedInc || 7.5);
  const [simRooms, setSimRooms] = useState(currentInputs?.TotalRooms || 6);
  const [simAge, setSimAge] = useState(currentInputs?.HouseAge || 22);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const basePrice = basePrediction?.predicted_price_usd || 0;

  useEffect(() => {
    setSimIncome(currentInputs?.MedInc || 7.5);
    setSimRooms(currentInputs?.TotalRooms || 6);
    setSimAge(currentInputs?.HouseAge || 22);
  }, [currentInputs]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const simPayload = {
        ...currentInputs,
        MedInc: simIncome,
        TotalRooms: simRooms,
        HouseAge: simAge
      };
      const res = await fetch('http://127.0.0.1:8000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simPayload)
      });
      const data = await res.json();
      setSimResult(data.prediction);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 300);
    return () => clearTimeout(timer);
  }, [simIncome, simRooms, simAge]);

  const simPrice = simResult?.predicted_price_usd || basePrice;
  const diff = simPrice - basePrice;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sliders size={18} color="#6366F1" /> What-If Scenario Renovator & Simulator
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        Simulate property upgrades (adding extra rooms, lowering effective property age, or neighborhood income changes) to observe instant valuation shifts.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Sliders Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              <span>Simulated Income Level</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>${(simIncome * 10).toFixed(0)}k / yr</span>
            </div>
            <input
              type="range" min={0.5} max={15.0} step={0.1}
              value={simIncome}
              onChange={(e) => setSimIncome(parseFloat(e.target.value))}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              <span>Simulated Total Rooms</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{simRooms} Rooms</span>
            </div>
            <input
              type="range" min={2} max={16} step={1}
              value={simRooms}
              onChange={(e) => setSimRooms(parseFloat(e.target.value))}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              <span>Simulated House Age</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{simAge} Years</span>
            </div>
            <input
              type="range" min={1} max={52} step={1}
              value={simAge}
              onChange={(e) => setSimAge(parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Valuation Shift Hero Metric */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Simulated Valuation Output
          </span>
          
          <div style={{ fontSize: '36px', fontWeight: '800', margin: '12px 0', color: 'var(--text-main)' }}>
            ${Math.round(simPrice).toLocaleString()}
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 18px',
            borderRadius: '30px',
            fontWeight: '700',
            fontSize: '15px',
            background: diff >= 0 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
            color: diff >= 0 ? '#34D399' : '#F87171',
            border: `1px solid ${diff >= 0 ? '#34D399' : '#F87171'}`
          }}>
            {diff >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            {diff >= 0 ? `+$${Math.round(diff).toLocaleString()}` : `-$${Math.round(Math.abs(diff)).toLocaleString()}`} Value Shift
          </div>
        </div>
      </div>
    </div>
  );
}
