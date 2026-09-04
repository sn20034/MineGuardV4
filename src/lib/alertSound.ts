let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

type AlertSeverity = "warning" | "critical";

export function playAlertSound(severity: AlertSeverity) {
  const ctx = getCtx();
  if (!ctx) return;

  if (ctx.state === "suspended") ctx.resume();

  const now = ctx.currentTime;

  if (severity === "critical") {
    // Three rapid high-pitched beeps
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = 880;
      const start = now + i * 0.22;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.01);
      gain.gain.linearRampToValueAtTime(0, start + 0.18);
      osc.start(start);
      osc.stop(start + 0.2);
    }
  } else {
    // Two descending tones
    const freqs = [660, 440];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.25;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.01);
      gain.gain.linearRampToValueAtTime(0, start + 0.22);
      osc.start(start);
      osc.stop(start + 0.24);
    });
  }
}
