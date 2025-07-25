import React from 'react';

export default function Header({ user, onLogout }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 32px 0', padding: '0 16px' }}>
      <div style={{
        background: 'rgba(10,102,194,0.08)',
        borderRadius: '50%',
        boxShadow: '0 4px 24px #0a66c244',
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 54,
        minHeight: 54
      }}>
        <img src="/logo.svg" alt="Ramu Sirivella Logo" style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', boxShadow: '0 2px 8px #0a66c222' }} />
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user.picture && (
            <img src={user.picture} alt="Profile" style={{ width: 36, height: 36, borderRadius: '50%', boxShadow: '0 2px 8px #0072ff22', objectFit: 'cover', background: '#fff', border: '2px solid #e3eefe' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 16, color: '#222', fontWeight: 700, lineHeight: 1.1 }}>
              {user.displayName || user.name || 'User'}
            </span>
            <span style={{ fontSize: 13, color: '#666', fontWeight: 400 }}>
              {user.email || ''}
            </span>
          </div>
          <button onClick={onLogout} style={{ background: '#f2f6fc', color: '#0a66c2', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'background 0.2s' }}>Logout</button>
        </div>
      )}
    </div>
  );
}
