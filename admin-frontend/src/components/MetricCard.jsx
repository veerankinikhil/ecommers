import React from 'react';

export default function MetricCard({ title, value, icon, color = '#0F172A' }) {
  return (
    <div className="admin-card">
      <div>
        <span className="admin-lbl">{title}</span>
        <div className="admin-val" style={{ color }}>{value}</div>
      </div>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
  );
}
