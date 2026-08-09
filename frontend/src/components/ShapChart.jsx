import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export default function ShapChart({ shapData }) {
  if (!shapData || shapData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading SHAP Feature Attributions...</div>;
  }

  const formattedData = [...shapData]
    .map(item => ({
      feature: item.Feature,
      impact: Math.round(item.Dollar_Impact || 0),
      value: item.Value
    }))
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
        SHAP Valuation Drivers (Positive vs. Negative Impact)
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        Explains how property characteristics (Income, Proximity to SF/Coast, Building Age) push the predicted price up (+Green) or down (-Red) in USD.
      </p>

      <div style={{ width: '100%', height: '380px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={formattedData}
            margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
          >
            <XAxis type="number" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} stroke="var(--text-muted)" />
            <YAxis type="category" dataKey="feature" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`$${value.toLocaleString()} USD`, 'Dollar Impact']}
              contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
            <ReferenceLine x={0} stroke="var(--border-color)" />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.impact >= 0 ? '#34D399' : '#F87171'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
