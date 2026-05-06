import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
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

function AuthScreen({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        onAuthSuccess(data.user);
      } else {
        // Sign Up
        const { data: signUpData, error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { username, location }
          }
        });
        if (authError) throw authError;
        
        // Create profile
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: signUpData.user.id, username, location, points: 0 }]);
          if (profileError) throw profileError;
        }
        
        alert("Account created! You can now login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-container center-content">
      <div className="glass-panel login-panel">
        <h1 className="logo-large">Math<span className="accent">Quest</span></h1>
        <div className="auth-tabs">
          <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
          <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Sign Up</button>
        </div>
        
        <form onSubmit={handleAuth} className="login-form">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {!isLogin && (
            <>
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
              <input type="text" placeholder="Location (City/State)" value={location} onChange={e => setLocation(e.target.value)} required />
            </>
          )}
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

function GameSelection({ profile, onSelectGame }) {
  return (
    <div className="screen-container full-height">
      <header className="top-bar">
        <h2 className="logo">Math<span className="accent">Quest</span></h2>
        <div className="user-badge">👤 {profile?.username} ({profile?.location})</div>
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

function MathRacer({ profile, onBack, onFinishRace }) {
  const [racerState, setRacerState] = useState('lobby');
  const [topic, setTopic] = useState('multiplication');
  const [question, setQuestion] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [place, setPlace] = useState(0);
  const inputRef = useRef(null);

  const initRace = () => {
    setPlayers([
      { id: 1, name: profile?.username || 'You', progress: 0, isMe: true, carColor: 'blue' },
      { id: 2, name: 'Bot_Alpha', progress: 0, isMe: false, carColor: 'red' },
      { id: 3, name: 'Bot_Beta', progress: 0, isMe: false, carColor: 'green' },
      { id: 4, name: 'Bot_Gamma', progress: 0, isMe: false, carColor: 'yellow' },
      { id: 5, name: 'Bot_Delta', progress: 0, isMe: false, carColor: 'purple' },
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

  useEffect(() => {
    if (racerState === 'playing') {
      inputRef.current?.focus();
      const botInterval = setInterval(() => {
        setPlayers(prev => prev.map(p => {
          if (p.isMe || p.progress >= 100) return p;
          const speed = Math.random() * 2;
          return { ...p, progress: Math.min(p.progress + speed, 100) };
        }));
      }, 200);
      return () => clearInterval(botInterval);
    }
  }, [racerState]);

  useEffect(() => {
    if (racerState === 'playing') {
      const me = players.find(p => p.isMe);
      if (me && me.progress >= 100) {
        const othersFinished = players.filter(p => !p.isMe && p.progress >= 100).length;
        const finalPlace = othersFinished + 1;
        setPlace(finalPlace);
        setRacerState('finished');
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
      setPlayers(prev => prev.map(p => p.isMe ? { ...p, progress: Math.min(p.progress + 10, 100) } : p));
      setQuestion(generateQuestion(topic));
      setInputVal('');
    } else if (val.length >= ans.toString().length) {
      setInputVal('');
    }
  };

  return (
    <div className="math-racer-container">
      <div className="racer-nav">
        <button onClick={onBack} className="back-btn">← Back</button>
        <div className="logo-small">Math<span className="accent">Racer</span></div>
        <div className="user-badge">👤 {profile?.username}</div>
      </div>

      {racerState === 'lobby' ? (
        <div className="lobby-screen center-content">
          <div className="glass-panel">
            <h2>Race Lobby</h2>
            <div className="topic-selector">
              {['addition', 'multiplication', 'division'].map(t => (
                <button key={t} className={`topic-btn ${topic === t ? 'active' : ''}`} onClick={() => setTopic(t)}>{t}</button>
              ))}
            </div>
            <button className="primary-btn pulse" onClick={initRace}>Join Race</button>
          </div>
        </div>
      ) : (
        <div className="race-layout">
          <div className="track-area">
            <div className="grass"></div>
            <div className="asphalt">
              <div className="finish-line"></div>
              {players.map(p => (
                <div key={p.id} className="lane">
                  <div className="player-tag">{p.name}</div>
                  <div className="car-wrapper" style={{ left: `${p.progress * 0.85}%` }}>
                    <div className={`car-svg car-${p.carColor}`}></div>
                    {p.isMe && <div className="me-indicator">You</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="grass"></div>
            {racerState === 'countdown' && <div className="overlay-msg"><h1>{countdown}</h1></div>}
            {racerState === 'finished' && <div className="overlay-msg"><h1>{place}th Place!</h1><button className="primary-btn mt-4" onClick={() => setRacerState('lobby')}>Play Again</button></div>}
          </div>
          <div className="input-area">
            <div className="dashboard">
              <div className="question-display">
                <span className="equation">{racerState === 'playing' ? `${question.a} ${question.op} ${question.b} = ?` : 'Waiting...'}</span>
              </div>
              <div className="typing-box">
                <input ref={inputRef} type="number" value={inputVal} onChange={handleInputChange} disabled={racerState !== 'playing'} autoFocus />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Leaderboard({ profile }) {
  const [leaders, setLeaders] = useState([]);

  const fetchLeaders = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, points, location')
      .order('points', { ascending: false })
      .limit(10);
    if (!error) setLeaders(data);
  };

  useEffect(() => {
    fetchLeaders();
    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchLeaders)
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header"><h3>🏆 Global Leaderboard</h3></div>
      <div className="user-stats-card">
        <h4>Your Stats</h4>
        <div className="stat-row"><span>Username:</span><span className="text-accent">{profile?.username}</span></div>
        <div className="stat-row"><span>Points:</span><span className="text-green">{profile?.points} pts</span></div>
        <div className="stat-row"><span>Location:</span><span>{profile?.location}</span></div>
      </div>
      <div className="leaderboard-list">
        {leaders.map((p, i) => (
          <div key={i} className="lb-item">
            <div className={`lb-rank ${i < 3 ? 'top-3' : ''}`}>#{i + 1}</div>
            <div className="lb-name">{p.username} <small>({p.location})</small></div>
            <div className="lb-points">{p.points}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (!error) setProfile(data);
  };

  const handleFinishRace = async (pts) => {
    if (!profile) return;
    const newPoints = (profile.points || 0) + pts;
    const { error } = await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', profile.id);
    if (!error) setProfile(prev => ({ ...prev, points: newPoints }));
  };

  if (!session) return <AuthScreen onAuthSuccess={setSession} />;

  return (
    <div className="app-wrapper">
      <div className="main-content">
        {currentGame === 'mathracer' 
          ? <MathRacer profile={profile} onBack={() => setCurrentGame(null)} onFinishRace={handleFinishRace} />
          : <GameSelection profile={profile} onSelectGame={setCurrentGame} />
        }
      </div>
      <div className="sidebar"><Leaderboard profile={profile} /></div>
    </div>
  );
}

export default App;
