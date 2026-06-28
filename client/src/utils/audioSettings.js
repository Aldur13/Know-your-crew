let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  localStorage.setItem('soundEnabled', enabled ? 'true' : 'false');
}

export function toggleSound() {
  setSoundEnabled(!soundEnabled);
  return soundEnabled;
}
