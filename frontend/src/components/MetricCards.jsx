import React from 'react';
import { DollarSign, ShieldAlert, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCards({ prediction, mispricing }) {
  if (!prediction || !mispricing) return null;

  const predUSD = prediction.predicted_price_usd || 0;
  const lowerUSD = prediction.lower_bound_usd || 0;
  const upperUSD = prediction.upper_bound_usd || 0;
  const clusterId = prediction.cluster_id ?? 0;

  const diffPct = mispricing.diff_pct || 0;
  const status = mispricing.status || 'Fair Market Value';
  const badge = mispricing.badge || 'BLUE';

  let badgeStyle = 'badge-blue';
  if (badge === 'GREEN') badgeStyle = 'badge-green';
  if (badge === 'RED') badgeStyle = 'badge-red';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      marginBottom: '32px'
    }}>
      {/* Card 1: Estimated Fair Price */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            AI Estimated Fair Value
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
            <Sparkles size={18} />
          </div>
        </div>
        <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          ${Math.round(predUSD).toLocaleString()}
        </div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#818CF8', marginTop: '6px' }}>
          Geographic Micro-Market Cluster #{clusterId}
        </div>
      </div>

      {/* Card 2: 90% Confidence Interval */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            90% Confidence Interval
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
            <DollarSign size={18} />
          </div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
          ${Math.round(lowerUSD).toLocaleString()} - ${Math.round(upperUSD).toLocaleString()}
        </div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginTop: '6px' }}>
          Quantile LightGBM Error Bounds
        </div>
      </div>

      {/* Card 3: Market Price Evaluation */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Market Listing Evaluation
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244, 114, 182, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F472B6' }}>
            <ShieldAlert size={18} />
          </div>
        </div>
        <div style={{ marginTop: '4px' }}>
          <span className={`badge ${badgeStyle}`} style={{ fontSize: '15px', padding: '6px 16px' }}>
            {status}
          </span>
        </div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: diffPct < 0 ? '#34D399' : diffPct > 0 ? '#F87171' : 'var(--text-muted)', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {diffPct < 0 ? <TrendingDown size={15} /> : <TrendingUp size={15} />}
          {diffPct > 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`} vs AI Baseline Valuation
        </div>
      </div>
    </div>
  );
}
