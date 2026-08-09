import React from 'react';
import { Home, ExternalLink } from 'lucide-react';

export default function CompsTable({ compsData, clusterId }) {
  if (!compsData || compsData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Comparable Properties...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Home size={18} color="#34D399" /> Top 5 Nearest Comparable Properties (Cluster #{clusterId})
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        Identifies actual historical sales in the dataset nearest in distance and property dimensions within the same micro-market cluster.
      </p>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Historical Price ($)</th>
              <th>Med Income ($10k)</th>
              <th>House Age</th>
              <th>Rooms / Household</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Similarity Score</th>
            </tr>
          </thead>
          <tbody>
            {compsData.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: '800', color: '#34D399' }}>
                  ${Math.round(row.Price_USD || 0).toLocaleString()}
                </td>
                <td>${(row.MedInc || 0).toFixed(2)}k</td>
                <td>{Math.round(row.HouseAge || 0)} yrs</td>
                <td>{(row.RoomsPerHousehold || row.AveRooms || 0).toFixed(2)}</td>
                <td>{(row.Latitude || 0).toFixed(4)}</td>
                <td>{(row.Longitude || 0).toFixed(4)}</td>
                <td style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>
                  {(row.Similarity_Distance || 0).toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
