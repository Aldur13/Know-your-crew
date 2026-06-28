import { useState } from 'react';
import socket from '../socket';

export default function ProfileSetup({ roomCode, questions }) {
  const [answers, setAnswers] = useState(Object.fromEntries(questions.map((_, i) => [`q${i}`, ''])));
  const [submitting, setSubmitting] = useState(false);

  const allFilled = questions.every((_, i) => answers[`q${i}`]?.trim().length > 0);

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
          Answer all {questions.length} questions — your crew will guess your answers!
        </p>
      </div>

      <div className="card">
        <div className="profile-form">
          {questions.map((q, i) => (
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
        {submitting ? 'Submitting...' : `Submit Profile (${questions.filter((_, i) => answers[`q${i}`]?.trim()).length}/${questions.length} filled)`}
      </button>
    </div>
  );
}
