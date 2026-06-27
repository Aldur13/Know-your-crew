import { useState, useEffect, useRef } from 'react';
import socket from '../socket';

const COLORS = ['var(--opt-a)', 'var(--opt-b)', 'var(--opt-c)', 'var(--opt-d)'];
const SHAPES = ['●', '■', '▲', '♦'];

export default function QuestionScreen({ questionData, isSubject, mySubjectAnswer, guessCount }) {
  const [selected, setSelected] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questionData.timeLimit / 1000);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSelected(null);
    setHasAnswered(false);
    const limit = questionData.timeLimit / 1000;
    setTimeLeft(limit);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = Math.max(0, prev - 0.1);
        if (next === 0) clearInterval(intervalRef.current);
        return next;
      });
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [questionData]);

  const handleGuess = (optionId) => {
    if (hasAnswered || isSubject) return;
    setSelected(optionId);
    setHasAnswered(true);
    clearInterval(intervalRef.current);
    socket.emit('submit-guess', { optionId });
  };

  const pct = (timeLeft / (questionData.timeLimit / 1000)) * 100;
  const timerColor = pct > 40 ? 'var(--accent)' : pct > 20 ? '#ff9800' : 'var(--danger)';
  const eligibleTotal = guessCount.total || (questionData.totalPlayers - 1);

  if (isSubject) {
    return (
      <div className="screen">
        <div className="round-badge">Round {questionData.roundNum} / {questionData.totalRounds}</div>
        <div className="timer-bar">
          <div className="timer-fill" style={{ width: `${pct}%`, backgroundColor: timerColor }} />
        </div>

        <div className="spotlight-card">
          <div className="spotlight-emoji">🌟</div>
          <h2>You're in the spotlight!</h2>
          <p style={{ color: 'var(--text-dim)', marginTop: '6px', fontSize: '0.9rem' }}>
            Your coworkers are guessing your answer to:
          </p>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '10px' }}>{questionData.question}</p>
          <div className="your-answer-box">
            <span className="your-answer-label">Your answer is:</span>
            <span className="your-answer-text">"{mySubjectAnswer}"</span>
          </div>
        </div>

        <div className="guess-progress">
          <p>{guessCount.count} / {eligibleTotal} players have guessed</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: eligibleTotal > 0 ? `${(guessCount.count / eligibleTotal) * 100}%` : '0%' }} />
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 'auto' }}>
          ⏱ {Math.ceil(timeLeft)}s remaining
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="round-badge">Round {questionData.roundNum} / {questionData.totalRounds}</div>
      <div className="timer-bar">
        <div className="timer-fill" style={{ width: `${pct}%`, backgroundColor: timerColor }} />
      </div>
      <div style={{ textAlign: 'center', color: timerColor, fontWeight: 700, fontSize: '1.4rem' }}>
        {Math.ceil(timeLeft)}
      </div>

      <div className="question-box">
        <p className="question-label">
          What is <strong>{questionData.subjectName}'s</strong> answer to:
        </p>
        <p className="question-text">{questionData.question}</p>
      </div>

      <div className="options-grid">
        {questionData.options.map((opt, idx) => (
          <button
            key={opt.id}
            className={`option-btn${selected === opt.id ? ' selected' : ''}${hasAnswered ? ' answered' : ''}`}
            style={{ backgroundColor: COLORS[idx] }}
            onClick={() => handleGuess(opt.id)}
            disabled={hasAnswered}
          >
            <span className="option-shape">{SHAPES[idx]}</span>
            <span className="option-text">{opt.text}</span>
          </button>
        ))}
      </div>

      {hasAnswered && (
        <div className="answered-status">
          <p>✓ Answer locked in!</p>
          <p style={{ marginTop: '6px' }}>
            <strong>{guessCount.count}</strong> / {eligibleTotal} players have answered
          </p>
        </div>
      )}
    </div>
  );
}
