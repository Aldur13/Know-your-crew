import { useState } from 'react';
import socket from '../socket';
import QUESTIONS from '../questions';

export default function ProfileSetup({ roomCode }) {
  const [answers, setAnswers] = useState(Object.fromEntries(QUESTIONS.map((_, i) => [`q${i}`, ''])));
  const [submitting, setSubmitting] = useState(false);

  const allFilled = QUESTIONS.every((_, i) => answers[`q${i}`].trim().length > 0);

  const handleSubmit = () => {
    if (!allFilled || submitting) return;
    setSubmitting(true);
    socket.emit('submit-profile', { answers });
  };

  return (
    <div className="screen">
      <div className="room-code-badge">
        <div className="label">Room Code</div>
        <div className="code">{roomCode}</div>
      </div>

      <div>
        <h2>Your Profile</h2>
        <p className="subtitle" style={{ marginTop: '4px' }}>
          Answer all 10 questions — your coworkers will guess your answers!
        </p>
      </div>

      <div className="card">
        <div className="profile-form">
          {QUESTIONS.map((q, i) => (
            <div key={i} className="profile-question">
              <label>
                <span style={{ color: 'var(--text-dim)', marginRight: '6px' }}>{i + 1}.</span>
                <span>{q}</span>
              </label>
              <input
                type="text"
                placeholder="Your answer..."
                value={answers[`q${i}`]}
                onChange={e => setAnswers(prev => ({ ...prev, [`q${i}`]: e.target.value }))}
                maxLength={60}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn btn-success"
        onClick={handleSubmit}
        disabled={!allFilled || submitting}
        style={{ marginTop: '4px' }}
      >
        {submitting ? 'Submitting...' : `Submit Profile (${QUESTIONS.filter((_, i) => answers[`q${i}`].trim()).length}/${QUESTIONS.length} filled)`}
      </button>
    </div>
  );
}
