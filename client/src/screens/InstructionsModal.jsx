export default function InstructionsModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--card)',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '480px',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>How to Play</h2>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: 0,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text)' }}>
          <div>
            <h3 style={{ color: 'var(--accent)', margin: '0 0 8px 0', fontSize: '1rem' }}>The Goal</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4', color: 'var(--text-dim)' }}>
              Answer trivia questions about your crew to earn points. The more correct guesses, the more points the subject earns!
            </p>
          </div>

          <div>
            <h3 style={{ color: 'var(--accent)', margin: '0 0 8px 0', fontSize: '1rem' }}>Round Types</h3>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-dim)' }}>
              <div><strong style={{ color: 'var(--text)' }}>Answer-Guess:</strong> Pick which answer belongs to the subject.</div>
              <div style={{ marginTop: '6px' }}><strong style={{ color: 'var(--text)' }}>Player-Guess:</strong> Guess which player gave the answer.</div>
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--accent)', margin: '0 0 8px 0', fontSize: '1rem' }}>Scoring</h3>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-dim)' }}>
              <li>Correct guess: 500-1000 points (faster = more)</li>
              <li>Streak bonus: 25% at 3, 50% at 5, 100% at 10+</li>
              <li>Subject bonus: +75 per wrong guess</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: 'var(--accent)', margin: '0 0 8px 0', fontSize: '1rem' }}>Streaks</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4', color: 'var(--text-dim)' }}>
              Build consecutive correct answers to earn streak bonuses! The longer your streak, the bigger your reward.
            </p>
          </div>

          <div>
            <h3 style={{ color: 'var(--accent)', margin: '0 0 8px 0', fontSize: '1rem' }}>Tips</h3>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-dim)' }}>
              <li>Speed matters — answer quickly for more points</li>
              <li>When you're the subject, stay quiet!</li>
              <li>Pay attention to your crew's answers</li>
            </ul>
          </div>
        </div>

        <button onClick={onClose} style={{
          width: '100%',
          marginTop: '20px',
          padding: '12px',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          Got it!
        </button>
      </div>
    </div>
  );
}
