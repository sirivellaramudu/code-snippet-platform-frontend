import React from 'react';

export default function PresenceList({ presence }) {
  const entries = Object.entries(presence);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, padding: '6px 0' }}>
      <span style={{ fontWeight: 600, color: '#0a66c2', fontSize: 15 }}>Users in Room:</span>
      {entries.length === 0 && <span style={{ color: '#999', fontSize: 14 }}>No other users in room</span>}
      {entries.map(([id, info]) => (
        <span key={id} style={{ display: 'flex', alignItems: 'center', gap: 7, background: info.color + '22', borderRadius: 16, padding: '4px 12px', fontSize: 14, color: info.color, fontWeight: 600, minHeight: 28 }}>
          <span style={{ display: 'inline-block', width: 22, height: 22, borderRadius: 11, background: info.color, marginRight: 7, border: '2px solid #fff' }}></span>
          {info.label}
        </span>
      ))}
    </div>
  );
}

