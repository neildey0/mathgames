import { useState, useEffect, useRef } from 'react';
import './App.css';

// --- UTILS ---
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateQuestion = (topic) => {
  if (topic === 'addition') {
    return { a: randomInt(1, 50), b: randomInt(1, 50), op: '+' };
  } else if (topic === 'multiplication') {
    return { a: randomInt(2, 12), b: randomInt(2, 12), op: 'x' };
  } else if (topic === 'division') {
    const b = randomInt(2, 12);
    const a = b * randomInt(2, 12);
    return { a, b, op: '÷' };
  }
  return { a: 1, b: 1, op: '+' };
};

const getAnswer = (q) => {
  if (q.op === '+') return q.a + q.b;
  if (q.op === 'x') return q.a * q.b;
  if (q.op === '÷') return q.a / q.b;
  return 0;
};

// --- COMPONENTS ---

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) onLogin(username);
  };

  return (
    <div className="screen-container center-content">
      <div className="glass-panel login-panel">
        <h1 className="logo-large">Math<span className="accent">Quest</span></h1>
        <p className="subtitle">Sign in to save your scores and race your friends!</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required 
          />
          <button type="submit" className="primary-btn">Login / Register</button>
        </form>
      </div>
    </div>
  );
}

function GameSelection({ username, onSelectGame }) {
  return (
    <div className="screen-container full-height">
      <header className="top-bar">
        <h2 className="logo">Math<span className="accent">Quest</span></h2>
        <div className="user-badge">👤 {username}</div>
      </header>
      <div className="content-area center-content">
        <h1 className="title">Select a Game</h1>
        <div className="game-grid">
          <div className="game-card" onClick={() => onSelectGame('mathracer')}>
            <div className="game-icon">🏎️</div>
            <h3>Math Racer</h3>
            <p>Type fast, calculate faster! Race against others to the finish line.</p>
          </div>
          <div className="game-card locked">
            <div className="game-icon">🧩</div>
            <h3>Geometry Puzzle</h3>
            <p>Coming Soon</p>
          </div>
          <div className="game-card locked">
            <div className="game-icon">⚔️</div>
            <h3>Algebra Arena</h3>
            <p>Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MathRacer({ username, onBack, onFinishRace }) {
  const [racerState, setRacerState] = useState('lobby'); // lobby, countdown, playing, finished
  const [topic, setTopic] = useState('multiplication');
  
  // Game state
  const [question, setQuestion] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [place, setPlace] = useState(0); // Player's finishing position
  
  const inputRef = useRef(null);

  // Initialize players
  const initRace = () => {
    setPlayers([
      { id: 1, name: username, progress: 0, isMe: true, carColor: 'blue', finishedAt: null },
      { id: 2, name: 'Bot_Alpha', progress: 0, isMe: false, carColor: 'red', finishedAt: null },
      { id: 3, name: 'Bot_Beta', progress: 0, isMe: false, carColor: 'green', finishedAt: null },
      { id: 4, name: 'Bot_Gamma', progress: 0, isMe: false, carColor: 'yellow', finishedAt: null },
      { id: 5, name: 'Bot_Delta', progress: 0, isMe: false, carColor: 'purple', finishedAt: null },
    ]);
    setQuestion(generateQuestion(topic));
    setPlace(0);
    setRacerState('countdown');
    setCountdown(3);
  };

  useEffect(() => {
    if (racerState === 'countdown') {
      const timer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timer);
            setRacerState('playing');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [racerState]);

  // Bot logic
  useEffect(() => {
    if (racerState === 'playing') {
      inputRef.current?.focus();
      
      const botInterval = setInterval(() => {
        setPlayers(prev => {
          let updated = [...prev];
          updated = updated.map(p => {
            if (p.isMe || p.progress >= 100) return p;
            const speed = Math.random() * 2;
            const newProg = Math.min(p.progress + speed, 100);
            return { ...p, progress: newProg, finishedAt: newProg === 100 && !p.finishedAt ? Date.now() : p.finishedAt };
          });
          return updated;
        });
      }, 200);
      
      return () => clearInterval(botInterval);
    }
  }, [racerState]);

  // Check if player finished
  useEffect(() => {
    if (racerState === 'playing') {
      const me = players.find(p => p.isMe);
      if (me && me.progress >= 100) {
        // Calculate place based on how many finished before me
        const othersFinished = players.filter(p => !p.isMe && p.progress >= 100).length;
        const finalPlace = othersFinished + 1;
        setPlace(finalPlace);
        setRacerState('finished');
        
        // Award points based on place: 1st = 100, 2nd = 75, 3rd = 50, etc.
        const pointsEarned = Math.max(125 - (finalPlace * 25), 10); 
        onFinishRace(pointsEarned);
      }
    }
  }, [players, racerState, onFinishRace]);

  const handleInputChange = (e) => {
    if (racerState !== 'playing') return;
    const val = e.target.value;
    setInputVal(val);
    
    if (val === '') return;
    
    const ans = getAnswer(question);
    if (parseInt(val) === ans) {
      setPlayers(prev => prev.map(p => {
        if (p.isMe) {
          return { ...p, progress: Math.min(p.progress + 10, 100), finishedAt: p.progress + 10 >= 100 ? Date.now() : p.finishedAt };
        }
        return p;
      }));
      setQuestion(generateQuestion(topic));
      setInputVal('');
    } else if (val.length >= ans.toString().length) {
      setInputVal('');
    }
  };

  const getCarClass = (color) => `car-svg car-${color}`;

  return (
    <div className="math-racer-container">
      <div className="racer-nav">
        <button onClick={onBack} className="back-btn">← Back</button>
        <div className="logo-small">Math<span className="accent">Racer</span></div>
        <div className="user-badge">👤 {username}</div>
      </div>

      {racerState === 'lobby' ? (
        <div className="lobby-screen center-content">
          <div className="glass-panel">
            <h2>Race Lobby</h2>
            <p>Select your competition track</p>
            <div className="topic-selector">
              {['addition', 'multiplication', 'division'].map(t => (
                <button 
                  key={t}
                  className={`topic-btn ${topic === t ? 'active' : ''}`}
                  onClick={() => setTopic(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button className="primary-btn pulse" onClick={initRace}>Join Race</button>
          </div>
        </div>
      ) : (
        <div className="race-layout">
          {/* TRACK AREA - Top Half */}
          <div className="track-area">
            <div className="grass top-grass"></div>
            <div className="asphalt">
              <div className="finish-line"></div>
              {players.map((p) => (
                <div key={p.id} className="lane">
                  <div className="player-tag">{p.name}</div>
                  <div className="car-wrapper" style={{ left: `${p.progress * 0.85}%` }}>
                    <div className={getCarClass(p.carColor)}></div>
                    {p.isMe && <div className="me-indicator">You</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="grass bottom-grass"></div>
            
            {racerState === 'countdown' && (
              <div className="overlay-msg">
                <h1>{countdown}</h1>
              </div>
            )}
            {racerState === 'finished' && (
              <div className="overlay-msg">
                <h1>{place === 1 ? '1st Place! 🏆' : place === 2 ? '2nd Place! 🥈' : place === 3 ? '3rd Place! 🥉' : place + 'th Place!'}</h1>
                <p style={{color: 'white', fontSize: '1.5rem', marginTop: '1rem'}}>Points Earned: +{Math.max(125 - (place * 25), 10)}</p>
                <button className="primary-btn mt-4" onClick={() => setRacerState('lobby')}>Play Again</button>
              </div>
            )}
          </div>

          {/* INPUT AREA - Bottom Half */}
          <div className="input-area">
            <div className="dashboard">
              <div className="question-display">
                {racerState === 'playing' ? (
                  <span className="equation">{question?.a} {question?.op} {question?.b} = ?</span>
                ) : (
                  <span className="equation waiting">Get Ready...</span>
                )}
              </div>
              <div className="typing-box">
                <input 
                  ref={inputRef}
                  type="number"
                  value={inputVal}
                  onChange={handleInputChange}
                  disabled={racerState !== 'playing'}
                  placeholder={racerState === 'playing' ? "Type answer..." : ""}
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Leaderboard({ currentUser, userPoints }) {
  // Mock leaderboard data
  const [topPlayers] = useState([
    { rank: 1, name: 'MathWizard99', points: 15420 },
    { rank: 2, name: 'SpeedTyper', points: 14200 },
    { rank: 3, name: 'CalcKid', points: 13550 },
    { rank: 4, name: 'NumberNinja', points: 12100 },
    { rank: 5, name: 'Einstein2.0', points: 11800 },
    { rank: 6, name: 'BrainyBot', points: 10400 },
    { rank: 7, name: 'QuickMather', points: 9900 },
    { rank: 8, name: 'AddMaster', points: 8500 },
  ]);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3>🏆 Global Leaderboard</h3>
      </div>
      
      <div className="user-stats-card">
        <h4>Your Stats</h4>
        <div className="stat-row">
          <span className="stat-label">Username:</span>
          <span className="stat-value text-accent">{currentUser}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Total Points:</span>
          <span className="stat-value text-green">{userPoints} pts</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Global Rank:</span>
          <span className="stat-value">#1,402</span>
        </div>
      </div>

      <div className="leaderboard-list">
        {topPlayers.map(p => (
          <div key={p.rank} className="lb-item">
            <div className={`lb-rank ${p.rank <= 3 ? 'top-3' : ''}`}>#{p.rank}</div>
            <div className="lb-name">{p.name}</div>
            <div className="lb-points">{p.points.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [userPoints, setUserPoints] = useState(1250);
  const [currentGame, setCurrentGame] = useState(null);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return (
    <div className="app-wrapper">
      <div className="main-content">
        {currentGame === 'mathracer' ? (
          <MathRacer 
            username={user} 
            onBack={() => setCurrentGame(null)} 
            onFinishRace={(pts) => setUserPoints(prev => prev + pts)}
          />
        ) : (
          <GameSelection username={user} onSelectGame={setCurrentGame} />
        )}
      </div>
      
      {/* Persistent Sidebar */}
      <div className="sidebar">
        <Leaderboard currentUser={user} userPoints={userPoints} />
      </div>
    </div>
  );
}

export default App;
