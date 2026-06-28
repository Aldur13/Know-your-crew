import { useState, useEffect, lazy, Suspense } from 'react';
import socket from './socket';
import DEFAULT_QUESTIONS from './questions';
import HomeScreen from './screens/HomeScreen';
import HostSetupScreen from './screens/HostSetupScreen';
import ProfileSetup from './screens/ProfileSetup';
import WaitingScreen from './screens/WaitingScreen';
import QuestionScreen from './screens/QuestionScreen';

const RevealScreen = lazy(() => import('./screens/RevealScreen'));
const FinalScreen = lazy(() => import('./screens/FinalScreen'));

export default function App() {
  const [screen, setScreen] = useState('home');
  const [myId, setMyId] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [readyCount, setReadyCount] = useState(0);
  const [questionData, setQuestionData] = useState(null);
  const [isSubject, setIsSubject] = useState(false);
  const [mySubjectAnswer, setMySubjectAnswer] = useState(null);
  const [guessCount, setGuessCount] = useState({ count: 0, total: 0 });
  const [revealData, setRevealData] = useState(null);
  const [finalScores, setFinalScores] = useState(null);
  const [error, setError] = useState(null);
  const [gameError, setGameError] = useState(null);
  const [disconnected, setDisconnected] = useState(false);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [totalRounds, setTotalRounds] = useState(20);

  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      setMyId(socket.id);
      setDisconnected(false);

      // If we had a session, notify server to restore it
      const session = JSON.parse(localStorage.getItem('gameSession') || 'null');
      if (session?.roomCode && session?.screen && session?.screen !== 'home') {
        socket.emit('reconnect-player', { roomCode: session.roomCode });
      }
    };

    const handleDisconnect = () => {
      // Don't immediately set disconnected = true on the first disconnect
      // Wait a moment in case it's a tab switch (will reconnect quickly)
      setTimeout(() => {
        if (!socket.connected) {
          setDisconnected(true);
        }
      }, 2000);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    const handleJoinedRoom = ({ code, isHost: host, questions: q, totalRounds: tr }) => {
      setRoomCode(code);
      setIsHost(host);
      if (q) setQuestions(q);
      if (tr) setTotalRounds(tr);
      const newScreen = host ? 'host-setup' : 'profile';
      setScreen(newScreen);
      // Store session for reconnection
      localStorage.setItem('gameSession', JSON.stringify({ roomCode: code, screen: newScreen }));
    };

    socket.on('joined-room', handleJoinedRoom);

    socket.on('room-configured', ({ questions: q, totalRounds: tr }) => {
      if (q) setQuestions(q);
      if (tr) setTotalRounds(tr);
    });

    socket.on('room-update', ({ players: p, readyCount: rc }) => {
      setPlayers(p);
      setReadyCount(rc);
    });

    socket.on('profile-accepted', () => {
      setScreen('waiting');
      const session = JSON.parse(localStorage.getItem('gameSession') || 'null');
      if (session) {
        session.screen = 'waiting';
        localStorage.setItem('gameSession', JSON.stringify(session));
      }
    });

    socket.on('game-started', () => {
      setGameError(null);
      setScreen('starting');
    });

    socket.on('new-question', (data) => {
      setQuestionData(data);
      setIsSubject(false);
      setMySubjectAnswer(null);
      setGuessCount({ count: 0, total: data.totalPlayers - 1 });
      setScreen('question');
    });

    socket.on('you-are-subject', ({ question, yourAnswer }) => {
      setIsSubject(true);
      setMySubjectAnswer(yourAnswer);
    });

    socket.on('guess-count', ({ count, total }) => {
      setGuessCount({ count, total });
    });

    socket.on('round-reveal', (data) => {
      setRevealData(data);
      setScreen('reveal');
    });

    socket.on('game-over', ({ finalScores: scores }) => {
      setFinalScores(scores);
      setScreen('final');
      // Clear session on game over
      localStorage.removeItem('gameSession');
    });

    socket.on('join-error', ({ message }) => setError(message));
    socket.on('game-error', ({ message }) => setGameError(message));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('joined-room');
      socket.off('room-configured');
      socket.off('room-update');
      socket.off('profile-accepted');
      socket.off('game-started');
      socket.off('new-question');
      socket.off('you-are-subject');
      socket.off('guess-count');
      socket.off('round-reveal');
      socket.off('game-over');
      socket.off('join-error');
      socket.off('game-error');
    };
  }, []);

  if (disconnected) return (
    <div className="screen" style={{ textAlign: 'center' }}>
      <div className="error-banner">
        Connection lost. Attempting to reconnect...
        <div style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.8 }}>
          If you don't reconnect in a few seconds, please refresh the page.
        </div>
      </div>
    </div>
  );

  if (screen === 'starting') return (
    <div className="screen" style={{ textAlign: 'center' }}>
      <p className="waiting-text">Game is starting...</p>
    </div>
  );

  if (screen === 'home') return <HomeScreen error={error} onClearError={() => setError(null)} />;
  if (screen === 'host-setup') return (
    <HostSetupScreen
      roomCode={roomCode}
      onDone={(q) => { setQuestions(q); setScreen('profile'); }}
    />
  );
  if (screen === 'profile') return <ProfileSetup key={questions.join('||')} roomCode={roomCode} questions={questions} />;
  if (screen === 'waiting') return (
    <WaitingScreen
      roomCode={roomCode}
      players={players}
      readyCount={readyCount}
      isHost={isHost}
      gameError={gameError}
      totalRounds={totalRounds}
      onClearError={() => setGameError(null)}
    />
  );
  if (screen === 'question') return (
    <QuestionScreen
      questionData={questionData}
      isSubject={isSubject}
      mySubjectAnswer={mySubjectAnswer}
      guessCount={guessCount}
    />
  );
  if (screen === 'reveal') return (
    <Suspense fallback={<div className="screen" style={{ textAlign: 'center' }}><p className="waiting-text">Loading results...</p></div>}>
      <RevealScreen
        revealData={revealData}
        isHost={isHost}
        myId={myId}
      />
    </Suspense>
  );
  if (screen === 'final') return (
    <Suspense fallback={<div className="screen" style={{ textAlign: 'center' }}><p className="waiting-text">Loading final scores...</p></div>}>
      <FinalScreen finalScores={finalScores} myId={myId} />
    </Suspense>
  );
  return null;
}
