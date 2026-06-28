import { useEffect } from 'react';
import socket from '../socket';
import { playReveal, playCorrect, playWrong } from '../utils/sounds';
import { CheckCircle, XCircle, Star } from 'lucide-react';

export default function RevealScreen({ revealData, isHost, myId }) {
  const myResult = revealData.results.find(r => r.playerId === myId);
  const isMySubject = revealData.subjectId === myId;
  const wrongGuesses = revealData.results.filter(r => !r.isCorrect).length;
  const subjectBonus = revealData.subjectBonus ?? wrongGuesses * 75;

  useEffect(() => {
    if (isMySubject) {
      playReveal();
    } else if (myResult?.isCorrect) {
      playCorrect();
    } else if (myResult && !myResult.isCorrect) {
      playWrong();
    } else {
      playReveal();
    }
  }, []);

  return (
    <div className="screen">
      <div className="correct-answer-card">
        <div className="correct-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <CheckCircle size={13} /> Correct Answer
        </div>
        <div className="correct-answer-text">"{revealData.correctAnswer}"</div>
        <div className="subject-line">— {revealData.subjectName}'s answer to: {revealData.question}</div>
      </div>

      {isMySubject ? (
        <div className="my-result subject">
          <Star size={20} />
          <div>
            <div>You were in the spotlight</div>
            {subjectBonus > 0 && (
              <div style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                +{subjectBonus} pts ({wrongGuesses} wrong guess{wrongGuesses !== 1 ? 'es' : ''})
              </div>
            )}
          </div>
        </div>
      ) : myResult ? (
        <div className={`my-result ${myResult.isCorrect ? 'correct' : 'wrong'}`}>
          <span className="result-icon">
            {myResult.isCorrect ? <CheckCircle size={22} /> : <XCircle size={22} />}
          </span>
          <div>
            <div>{myResult.isCorrect ? 'Correct!' : 'Not quite!'}</div>
            {myResult.isCorrect && (
              <div style={{ fontSize: '0.9rem', marginTop: '2px' }}>+{myResult.points} pts this round</div>
            )}
          </div>
        </div>
      ) : null}

      <div className="card-sm">
        <h3 style={{ marginBottom: '10px' }}>Who guessed what</h3>
        <div className="guess-rows">
          {revealData.results.map(r => (
            <div key={r.playerId} className={`guess-row ${r.isCorrect ? 'correct' : 'wrong'}`}>
              <span
                className="guess-icon"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: r.playerColor || 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0
                }}
              >
                {r.playerAvatar || r.playerName[0].toUpperCase()}
              </span>
              <span className="guess-name">{r.playerName}{r.playerId === myId ? ' (you)' : ''}</span>
              <span style={{ display: 'flex', color: r.isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                {r.isCorrect ? <CheckCircle size={15} /> : <XCircle size={15} />}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                {r.isCorrect && <span className="guess-pts">+{r.points}</span>}
                {r.streak > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>🔥 {r.streak}</span>}
                {r.streakBroken && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>streak lost</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-sm">
        <h3 style={{ marginBottom: '10px' }}>Leaderboard</h3>
        <div className="score-rows">
          {revealData.scores.slice(0, 6).map((p, idx) => (
            <div key={p.id} className={`score-row${p.id === myId ? ' me' : ''}${idx === 0 ? ' top1' : ''}`}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: p.color || 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#0a0a1a',
                  flexShrink: 0
                }}
              >
                {p.avatar || p.name[0].toUpperCase()}
              </span>
              <span className="score-name">{p.name}{p.id === myId ? ' (you)' : ''}</span>
              <span className="rank" style={{ width: 'auto' }}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
              </span>
              <span className="score-pts">{p.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <button className="btn btn-primary" onClick={() => socket.emit('next-round')}>
          Next Round →
        </button>
      ) : (
        <p className="waiting-text">Waiting for host to continue...</p>
      )}
    </div>
  );
}
