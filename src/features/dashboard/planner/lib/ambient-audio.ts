export type AmbientSound = "none" | "ocean" | "rain" | "white";

// Rain is a real recording — preload it once as an <audio> element so the
// browser has it buffered before the user starts a session (no glitch on play).
const RAIN_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/liecio-calming-rain-257596-RLTu3jRr0OWSvJEpXX8PkVt2XfWlaP.mp3";

let rainEl: HTMLAudioElement | null = null;

function getRainElement(): HTMLAudioElement {
  if (!rainEl) {
    rainEl = new Audio(RAIN_URL);
    rainEl.loop = true;
    rainEl.preload = "auto";
    rainEl.volume = 0.55;
    // Kick off buffering immediately (browser may restrict until gesture,
    // but subsequent play() calls will succeed after the first user action).
    rainEl.load();
  }
  return rainEl;
}

// Pre-buffer as soon as this module is imported (runs at bundle evaluation
// time in the browser, no-op on the server).
if (typeof window !== "undefined") {
  getRainElement();
}

/**
 * Synthesizes ambient sounds with the Web Audio API so no audio
 * assets need to be downloaded. Must only be called client-side,
 * in response to a user gesture (browser autoplay policy).
 */
function createNoiseBuffer(
  ctx: AudioContext,
  color: "white" | "pink" | "brown",
): AudioBuffer {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (color === "white") {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (color === "pink") {
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private current: AmbientSound = "none";

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  get playing(): AmbientSound {
    return this.current;
  }

  play(sound: AmbientSound) {
    this.stop();
    if (sound === "none" || typeof window === "undefined") return;

    const ctx = this.getContext();
    const master = ctx.createGain();
    master.connect(ctx.destination);

    if (sound === "white") {
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, "white");
      src.loop = true;
      master.gain.value = 0.08;
      src.connect(master);
      src.start();
      this.activeNodes = [src, master];
    } else if (sound === "rain") {
      // Use the preloaded <audio> element — seamless looping, no synthesis.
      master.disconnect(); // not needed for the <audio> path
      const el = getRainElement();
      el.currentTime = 0;
      void el.play();
      this.activeNodes = [];
    } else {
      // ocean: brown noise with a slow swell, like waves
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, "brown");
      src.loop = true;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 600;
      const swell = ctx.createGain();
      swell.gain.value = 0.5;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain).connect(swell.gain);
      master.gain.value = 0.55;
      src.connect(lowpass).connect(swell).connect(master);
      src.start();
      lfo.start();
      this.activeNodes = [src, lowpass, swell, lfo, lfoGain, master];
    }

    this.current = sound;
  }

  stop() {
    // Always pause the rain element regardless of what was playing,
    // in case stop() is called while rain is active.
    if (rainEl && !rainEl.paused) {
      rainEl.pause();
      rainEl.currentTime = 0;
    }

    for (const node of this.activeNodes) {
      try {
        if ("stop" in node && typeof node.stop === "function") {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // node may already be stopped/disconnected
      }
    }
    this.activeNodes = [];
    this.current = "none";
  }

  /** Short two-tone chime when a phase ends. */
  chime() {
    if (typeof window === "undefined") return;
    try {
      const ctx = this.getContext();
      const notes = [660, 880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.25;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.2, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.7);
      });
    } catch {
      // audio context unavailable — fail silently, the UI still updates
    }
  }
}

export const ambientAudio = new AmbientAudioEngine();
