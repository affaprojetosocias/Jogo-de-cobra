/**
 * Gera efeitos sonoros simples via Web Audio API.
 */
const createAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext ||
    // @ts-expect-error - Safari ainda expõe apenas webkitAudioContext
    window.webkitAudioContext;
  if (!AudioContextClass) return null;
  try {
    return new AudioContextClass();
  } catch (error) {
    console.warn('[SoundSystem] Falha ao criar AudioContext', error);
    return null;
  }
};

export class SoundSystem {
  private readonly context = createAudioContext();
  private musicNode: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private unlocked = false;

  unlock() {
    if (!this.context || this.unlocked) return;
    const resume = () => {
      this.context?.resume();
      this.startMusic();
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
      this.unlocked = true;
    };
    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('keydown', resume, { once: true });
  }

  playEat() {
    this.playTone(660, 0.1, 0.15);
  }

  playDeath() {
    this.playTone(160, 0.5, 0.2);
  }

  private playTone(frequency: number, duration: number, gainValue: number) {
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(gainValue, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    osc.connect(gain).connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  private startMusic() {
    if (!this.context || this.musicNode) return;
    this.musicNode = this.context.createOscillator();
    this.musicGain = this.context.createGain();
    this.musicNode.type = 'sawtooth';
    this.musicNode.frequency.value = 110;
    this.musicGain.gain.value = 0.05;
    this.musicNode.connect(this.musicGain).connect(this.context.destination);
    this.musicNode.start();
  }
}
