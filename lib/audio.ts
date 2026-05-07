// Create and play a soft beep sound using Web Audio API
export const playBeep = (frequency = 1000, duration = 150) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Soft envelope to avoid harsh sounds
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration / 1000
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    // Silently fail if Web Audio API is not available
    console.error('[v0] Beep playback failed:', error);
  }
};

// Play a double beep for warnings (last 5 seconds)
export const playWarningBeep = () => {
  playBeep(1200, 100);
  setTimeout(() => playBeep(1200, 100), 150);
};
