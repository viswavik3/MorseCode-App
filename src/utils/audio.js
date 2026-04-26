export function createTonePlayer() {
  let audioContext = null;

  return function playTone(duration = 120) {
    if (typeof window === "undefined") {
      return;
    }

    audioContext ??= new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 620;
    gainNode.gain.value = 0.03;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  };
}

export function vibrate(pattern = 18) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
