export type AmbientSound = "none" | "ocean" | "rain" | "white";

// Real audio recordings — preload them once as <audio> elements so the
// browser has them buffered before the user starts a session (no glitch on play).
const RAIN_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/liecio-calming-rain-257596-RLTu3jRr0OWSvJEpXX8PkVt2XfWlaP.mp3";
const OCEAN_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/catfox_alex-ocean-wave-slowly-236010-u5SyqQBIfS73DWnYJpKpDxUkdFGxDX.mp3";
const WHITE_NOISE_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/extrasounds-white-noise-358382-StSq2h8UNs9TeUmTQfXZcMkWa9vyAf.mp3";

let rainEl: HTMLAudioElement | null = null;
let oceanEl: HTMLAudioElement | null = null;
let whiteNoiseEl: HTMLAudioElement | null = null;

function getRainElement(): HTMLAudioElement {
  if (!rainEl) {
    rainEl = new Audio(RAIN_URL);
    rainEl.loop = true;
    rainEl.preload = "auto";
    rainEl.volume = 0.55;
    rainEl.load();
  }
  return rainEl;
}

function getOceanElement(): HTMLAudioElement {
  if (!oceanEl) {
    oceanEl = new Audio(OCEAN_URL);
    oceanEl.loop = true;
    oceanEl.preload = "auto";
    oceanEl.volume = 0.55;
    oceanEl.load();
  }
  return oceanEl;
}

function getWhiteNoiseElement(): HTMLAudioElement {
  if (!whiteNoiseEl) {
    whiteNoiseEl = new Audio(WHITE_NOISE_URL);
    whiteNoiseEl.loop = true;
    whiteNoiseEl.preload = "auto";
    whiteNoiseEl.volume = 0.55;
    whiteNoiseEl.load();
  }
  return whiteNoiseEl;
}

// Pre-buffer all as soon as this module is imported (runs at bundle evaluation
// time in the browser, no-op on the server).
if (typeof window !== "undefined") {
  getRainElement();
  getOceanElement();
  getWhiteNoiseElement();
}

/**
 * Plays looping ambient background sounds from preloaded recordings, and a
 * short synthesized chime when a phase ends. Must only be driven client-side,
 * in response to a user gesture (browser autoplay policy).
 */
class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
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

    let el: HTMLAudioElement | null = null;
    if (sound === "white") {
      el = getWhiteNoiseElement();
    } else if (sound === "rain") {
      el = getRainElement();
    } else if (sound === "ocean") {
      el = getOceanElement();
    }

    if (el) {
      el.currentTime = 0;
      // play() may reject if the call isn't tied to a user gesture; swallow it.
      void el.play().catch(() => {});
    }

    this.current = sound;
  }

  stop() {
    // Always pause all real audio elements regardless of what was playing,
    // in case stop() is called while they're active.
    if (rainEl && !rainEl.paused) {
      rainEl.pause();
      rainEl.currentTime = 0;
    }
    if (oceanEl && !oceanEl.paused) {
      oceanEl.pause();
      oceanEl.currentTime = 0;
    }
    if (whiteNoiseEl && !whiteNoiseEl.paused) {
      whiteNoiseEl.pause();
      whiteNoiseEl.currentTime = 0;
    }

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
