import React, { useState, useEffect, useRef } from 'react';
import CodeEditor from './components/CodeEditor';
import Output from './components/Output';
import Header from './components/Header';
import PresenceList from './components/PresenceList';
import RoomSelector from './components/RoomSelector';
import LanguageSelector from './components/LanguageSelector';
import axios from 'axios';
import { socket } from './socket';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [roomId, setRoomId] = useState('default');
  const [roomInput, setRoomInput] = useState('default');
  const [code, setCode] = useState('print("Hello from JDoodle!")');
  const [language, setLanguage] = useState('python3');
  const [output, setOutput] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remoteCursors, setRemoteCursors] = useState([]);
  const [presence, setPresence] = useState({}); // userId -> {label, color, lastSeen}

  const ignoreRemote = useRef(false);
  const lastRemoteCode = useRef(null);
  const userId = useRef(uuidv4());
  const userColor = useRef(`#${Math.floor(Math.random()*16777215).toString(16)}`);
  const userLabel = user?.displayName || user?.name || user?.email || 'User';

  // Set starter code only if language actually changed and code doesn't match
  const lastLang = useRef(language);
  useEffect(() => {
    const STARTER_CODE = {
      python3: 'print("Hello, World!")',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    };
    if (lastLang.current !== language) {
      if (code !== STARTER_CODE[language]) {
        setCode(STARTER_CODE[language]);
        socket.emit('code-change', { roomId, code: STARTER_CODE[language] });
      }
      lastLang.current = language;
    }
    // eslint-disable-next-line
  }, [language]);

  useEffect(() => {
    const joinRoom = () => {
      console.log(`Attempting to join room: ${roomId}`);
      socket.emit('join-room', { roomId, language });
    };

    // Ensure socket is connected before joining room
    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
      socket.on('connect', () => {
        console.log('Socket connected, joining room');
        joinRoom();
      });
    }

    // Handle room join confirmation
    socket.on('room-joined', ({ roomId: joinedRoom, success, members = [] }) => {
      if (success) {
        console.log(`Successfully joined room: ${joinedRoom}`);
      }
      // Initialize presence list with other members in room
      setPresence(prev => {
        const updated = { ...prev };
        members.forEach(id => {
          if (id !== socket.id && !updated[id]) {
            updated[id] = { label: 'User', color: '#888', lastSeen: Date.now() };
          }
        });
        return updated;
      });
    });

    // Handle code updates from other users
    socket.on('code-update', remoteCode => {
      ignoreRemote.current = true;
      lastRemoteCode.current = remoteCode;
      setCode(typeof remoteCode === 'string' ? remoteCode : '');
    });

    // Handle cursor updates from other users
    socket.on('cursor-update', ({ userId: remoteId, position, color, label }) => {
      setRemoteCursors(prev => {
        // Remove any old cursor for this user
        const filtered = prev.filter(c => c.userId !== remoteId);
        return [...filtered, { userId: remoteId, position, color, label }];
      });
      setPresence(prev => ({
        ...prev,
        [remoteId]: { label, color, lastSeen: Date.now() }
      }));
    });

    // Handle user join/leave notifications
    socket.on('user-joined', ({ userId, roomId: joinedRoom, members = [] }) => {
      console.log(`User ${userId} joined room ${joinedRoom}`);
      if (userId !== socket.id) {
        setPresence(prev => ({
          ...prev,
          [userId]: {
            label: 'User',
            color: '#888',
            lastSeen: Date.now()
          }
        }));
      }
    });

    socket.on('user-left', ({ userId, roomId: leftRoom }) => {
      console.log(`User ${userId} left room ${leftRoom}`);
      // Remove their cursor and presence
      setRemoteCursors(prev => prev.filter(c => c.userId !== userId));
      setPresence(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    return () => {
      // Clear presence and cursor state when leaving room
      setPresence({});
      setRemoteCursors([]);
      socket.off('room-joined');
      socket.off('code-update');
      socket.off('cursor-update');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('connect');
    };
  }, [roomId, language]);

  // Emit code changes to others
  useEffect(() => {
    if (ignoreRemote.current) {
      ignoreRemote.current = false;
      return;
    }
    if (code !== lastRemoteCode.current) {
      socket.emit('code-change', { roomId, code: code || '' });
    }
  }, [code]);

  useEffect(() => {
    // Fetch user info on load
    axios.get('http://localhost:4000/auth/user', { withCredentials: true })
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const runCode = async () => {
    if (!user) {
      setOutput('You must be logged in via SSO to run code.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:4000/execute', {
        script: code,
        language,
        versionIndex: '0',
      }, { withCredentials: true });
      setOutput(response.data.output || response.data.error);
    } catch (err) {
      setOutput('Error running code');
    }
  };

  const handleLogin = (provider) => {
    window.location.href = `http://localhost:4000/auth/${provider}`;
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:4000/auth/logout';
  };

  return (
    <div style={{ padding: '20px' }}>
      {loading ? (
        <div>Loading...</div>
      ) : !user ? (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(120deg, #232526 0%, #414345 40%, #0072ff 100%)',
          fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Animated gradient blobs for background */}
          <div style={{
            position: 'absolute',
            top: '-10%', left: '-10%', width: 340, height: 340, zIndex: 0,
            background: 'radial-gradient(circle at 60% 40%, #00c6ff80 0%, #0072ff00 70%)',
            filter: 'blur(32px)',
            animation: 'floatBlob 8s ease-in-out infinite alternate',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-10%', right: '-10%', width: 320, height: 320, zIndex: 0,
            background: 'radial-gradient(circle at 40% 60%, #fff17680 0%, #fff17600 70%)',
            filter: 'blur(32px)',
            animation: 'floatBlob2 10s ease-in-out infinite alternate',
          }} />
          <style>{`
            @keyframes floatBlob {
              0% { transform: translateY(0) scale(1); }
              100% { transform: translateY(30px) scale(1.07); }
            }
            @keyframes floatBlob2 {
              0% { transform: translateY(0) scale(1); }
              100% { transform: translateY(-30px) scale(1.04); }
            }
          `}</style>
          <div style={{
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 20,
            padding: '54px 36px 36px 36px',
            boxShadow: '0 8px 40px 0 rgba(31, 38, 135, 0.15)',
            minWidth: 350,
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(180,200,255,0.13)',
            zIndex: 1,
          }}>
            <img src="/logo.svg" alt="Ramu Sirivella Logo" style={{ width: 60, marginBottom: 20, filter: 'drop-shadow(0 2px 8px #0072ff22)' }} />
            <h1 style={{ fontWeight: 800, fontSize: 28, marginBottom: 10, color: '#232526', letterSpacing: 1, textAlign: 'center', fontFamily: 'Inter, Segoe UI, Arial' }}>Welcome to Ramu Sirivella Platform</h1>
            <p style={{ marginBottom: 34, fontSize: 17, color: '#333', textAlign: 'center', fontWeight: 500 }}>Sign in with SSO to start running code online.</p>
            <button
              onClick={() => handleLogin('google')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', color: '#222', border: '1.5px solid #e0e0e0', borderRadius: 9,
                padding: '11px 18px', fontSize: 17, fontWeight: 600, marginBottom: 14, width: '100%', cursor: 'pointer', boxShadow: '0 1px 8px rgba(60,60,60,0.07)',
                transition: 'background 0.2s, box-shadow 0.2s',
                outline: 'none',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseOut={e => e.currentTarget.style.background = '#fff'}
            >
              <img src="/google-logo.svg" alt="Ramu SSO" style={{ width: 24, marginRight: 14 }} />
              <span style={{ fontWeight: 600 }}>Login with Google</span>
            </button>
            <button
              onClick={() => handleLogin('microsoft')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#2F2FDF', color: '#fff', border: 'none', borderRadius: 9,
                padding: '11px 18px', fontSize: 17, fontWeight: 600, width: '100%', cursor: 'pointer',
                boxShadow: '0 1px 8px rgba(60,60,60,0.07)',
                transition: 'background 0.2s, box-shadow 0.2s',
                outline: 'none',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#2323b8'}
              onMouseOut={e => e.currentTarget.style.background = '#2F2FDF'}
            >
              <svg style={{ width: 22, marginRight: 14 }} viewBox="0 0 32 32"><g><rect fill="#F35325" x="1" y="1" width="14" height="14"/><rect fill="#81BC06" x="17" y="1" width="14" height="14"/><rect fill="#05A6F0" x="1" y="17" width="14" height="14"/><rect fill="#FFBA08" x="17" y="17" width="14" height="14"/></g></svg>
              <span style={{ fontWeight: 600 }}>Login with Microsoft</span>
            </button>
            <div style={{ marginTop: 36, fontSize: 13, color: '#888', letterSpacing: 0.5, fontWeight: 500 }}>
              <span>Powered by <span style={{ color: '#0072ff', fontWeight: 700 }}>Ramu Sirivella</span></span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(120deg, #f8fafc 0%, #e3eefe 100%)',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <RoomSelector roomInput={roomInput} setRoomInput={setRoomInput} setRoomId={setRoomId} roomId={roomId} />
          <div style={{
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 6px 32px 0 rgba(31, 38, 135, 0.10)',
            marginTop: 18,
            padding: '36px 30px 30px 30px',
            minWidth: 380,
            maxWidth: 560,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}>
            <PresenceList presence={presence} />
            <Header user={user} onLogout={handleLogout} />
            <LanguageSelector
              language={language}
              setLanguage={setLanguage}
              onRun={runCode}
            />
            <CodeEditor
              code={code}
              setCode={setCode}
              language={language}
              remoteCursors={remoteCursors.filter(c => c.userId !== userId.current)}
              onCursorChange={position => {
                socket.emit('cursor-change', {
                  roomId,
                  userId: userId.current,
                  position,
                  color: userColor.current,
                  label: userLabel
                });
              }}
            />
            <Output output={output} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
