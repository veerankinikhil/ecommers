import React from 'react';

export default function StatsMetricCard({ title, value, icon, color = '#1A237E' }) {
  return (
    <div className="stat-card">
      <div>
        <span className="stat-lbl">{title}</span>
        <div className="stat-val" style={{ color }}>{value}</div>
      </div>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
  );
}
