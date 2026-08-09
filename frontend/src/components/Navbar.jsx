import React from 'react';
import { Building2, Sun, Moon, Download, CheckCircle2 } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, onExportReport, isExporting }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
        }}>
          <Building2 size={24} />
        </div>

        <div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: '800',
            background: 'linear-gradient(90deg, #60A5FA 0%, #A78BFA 50%, #F472B6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2
          }}>
            California AI Valuation & Buyer Advisor
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
            Micro-Market Clustering • Quantile LightGBM Models • SHAP Explainability • Spatial Comps Engine
          </p>
        </div>
      </div>

      {/* Right Controls & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* API Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: 'rgba(52, 211, 153, 0.1)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          fontSize: '12px',
          color: '#34D399',
          fontWeight: '600'
        }}>
          <CheckCircle2 size={14} /> FastAPI Engine Online
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-color)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px'
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} color="#F59E0B" /> Light Mode
            </>
          ) : (
            <>
              <Moon size={16} color="#6366F1" /> Dark Mode
            </>
          )}
        </button>

        {/* Download Report Button */}
        <button
          onClick={onExportReport}
          disabled={isExporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            color: '#FFFFFF',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            fontWeight: '700',
            fontSize: '13.5px',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)'
          }}
        >
          <Download size={16} /> {isExporting ? 'Generating...' : 'Export Report (TXT)'}
        </button>
      </div>
    </header>
  );
}
