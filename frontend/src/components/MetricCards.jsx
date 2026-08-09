import React from 'react';
import { Sparkles, ShieldCheck, Clock } from 'lucide-react';

export default function MetricCards({ prediction, mispricing, selectedCity, heroTheme = 'gold' }) {
  if (!prediction || !mispricing) return null;

  const predUSD = prediction.predicted_price_usd || 0;
  const lowerUSD = prediction.lower_bound_usd || 0;
  const upperUSD = prediction.upper_bound_usd || 0;
  const clusterId = prediction.cluster_id ?? 0;

  const status = mispricing.status || 'Fair Market Value';
  const badge = mispricing.badge || 'BLUE';

  let badgeStyle = 'badge-blue';
  if (badge === 'GREEN') badgeStyle = 'badge-green';
  if (badge === 'RED') badgeStyle = 'badge-red';

  const cardClass = heroTheme === 'blue'
    ? 'hero-card-blue'
    : heroTheme === 'purple'
    ? 'hero-card-purple'
    : 'hero-card-gold';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hero Valuation Card */}
      <div className={cardClass}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.95, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> AI Estimated Fair Value
          </span>
          <span className={`badge ${badgeStyle}`} style={{ fontSize: '13px', background: 'rgba(255, 255, 255, 0.25)', color: '#FFF', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
            {status}
          </span>
        </div>

        {/* Large Hero Price */}
        <div style={{ fontSize: '44px', fontWeight: '800', letterSpacing: '-1px', margin: '4px 0 6px 0' }}>
          ${Math.round(predUSD).toLocaleString()}
        </div>

        {/* Subtitle Confidence Range */}
        <div style={{ fontSize: '15px', fontWeight: '600', opacity: 0.95, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>${Math.round(lowerUSD / 1000)}k - ${Math.round(upperUSD / 1000)}k</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={16} /> 90% Quantile Confidence
          </span>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.3)', margin: '16px 0 12px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', opacity: 0.9 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={14} /> Updated just now
          </span>
          <span>Micro-Market Cluster #{clusterId} ({selectedCity})</span>
        </div>
      </div>
    </div>
  );
}
