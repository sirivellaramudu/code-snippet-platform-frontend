import React, { useState } from 'react';

export default function RoomSelector({ roomInput, setRoomInput, setRoomId, roomId }) {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = () => {
    const targetRoom = roomInput.trim() || 'default';
    if (targetRoom === roomId) {
      return; // Already in this room
    }
    
    setIsJoining(true);
    setRoomId(targetRoom);
    
    // Reset joining state after a short delay
    setTimeout(() => {
      setIsJoining(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  };

  return (
    <div style={{ marginTop: 20, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
      <input
        type="text"
        value={roomInput}
        onChange={e => setRoomInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter room name or ID"
        disabled={isJoining}
        style={{ 
          padding: '7px 12px', 
          borderRadius: 7, 
          border: '1.5px solid #d0d7e2', 
          fontSize: 15, 
          minWidth: 120,
          opacity: isJoining ? 0.6 : 1
        }}
      />
      <button
        onClick={handleJoinRoom}
        disabled={isJoining || (roomInput.trim() || 'default') === roomId}
        style={{ 
          background: isJoining ? '#6b7280' : ((roomInput.trim() || 'default') === roomId ? '#9ca3af' : '#0a66c2'), 
          color: '#fff', 
          border: 'none', 
          borderRadius: 7, 
          padding: '7px 18px', 
          fontWeight: 600, 
          fontSize: 15, 
          cursor: isJoining || (roomInput.trim() || 'default') === roomId ? 'not-allowed' : 'pointer', 
          boxShadow: '0 1px 4px #0a66c222',
          minWidth: 100
        }}
      >
        {isJoining ? 'Joining...' : 'Join Room'}
      </button>
      <span style={{ fontSize: 14, color: '#555', marginLeft: 10 }}>
        Current Room: <b style={{ color: isJoining ? '#0a66c2' : '#333' }}>{roomId}</b>
        {isJoining && <span style={{ color: '#0a66c2', marginLeft: 8 }}>🔄</span>}
      </span>
    </div>
  );
}
