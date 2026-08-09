import React from 'react';
import { Search, Plus, Sun, Moon, Download, Palette } from 'lucide-react';

export default function Navbar({
  theme,
  toggleTheme,
  heroTheme,
  setHeroTheme,
  onExportReport,
  isExporting,
  onToggleAddProperty,
  searchAddress,
  setSearchAddress
}) {
  return (
    <header style={{
      height: '70px',
      padding: '0 32px',
      background: 'var(--header-bg)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Address Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'var(--input-bg)',
        border: '1px solid var(--border-color)',
        padding: '10px 16px',
        borderRadius: '12px',
        width: '380px'
      }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          placeholder="Search location address (e.g. Los Angeles, CA)..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '13.5px',
            fontWeight: '500',
            width: '100%'
          }}
        />
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Color Theme Accent Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setHeroTheme('red')}
            title="Crimson Red Theme"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
              border: heroTheme === 'red' ? '2px solid #FFF' : 'none',
              cursor: 'pointer',
              boxShadow: heroTheme === 'red' ? '0 0 8px #F43F5E' : 'none'
            }}
          />
          <button
            onClick={() => setHeroTheme('blue')}
            title="Royal Blue Theme"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              border: heroTheme === 'blue' ? '2px solid #FFF' : 'none',
              cursor: 'pointer',
              boxShadow: heroTheme === 'blue' ? '0 0 8px #2563EB' : 'none'
            }}
          />
          <button
            onClick={() => setHeroTheme('purple')}
            title="Electric Purple Theme"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              border: heroTheme === 'purple' ? '2px solid #FFF' : 'none',
              cursor: 'pointer',
              boxShadow: heroTheme === 'purple' ? '0 0 8px #8B5CF6' : 'none'
            }}
          />
        </div>

        {/* + Add Property Button */}
        <button
          onClick={onToggleAddProperty}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            fontWeight: '700',
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-main)'
          }}
        >
          <Plus size={16} color="var(--accent-primary)" /> Add property
        </button>

        {/* Export Report Button */}
        <button
          onClick={onExportReport}
          disabled={isExporting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '13.5px',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)'
          }}
        >
          <Download size={16} /> {isExporting ? 'Generating...' : 'Export Report (TXT)'}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--input-bg)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#F43F5E" />}
        </button>

        {/* User Profile Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px', paddingLeft: '14px', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F43F5E 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            fontWeight: '700',
            fontSize: '13px'
          }}>
            MC
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-main)' }}>Michael Chen</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pro Valuator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
