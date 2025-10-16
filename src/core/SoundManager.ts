import { Howl, Howler } from 'howler';

/**
 * Centraliza efeitos sonoros e música ambiente.
 */
export class SoundManager {
  private eatSound: Howl;
  private deathSound: Howl;
  private ambience: Howl;

  constructor() {
    this.eatSound = new Howl({
      src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQAAAAA='],
      volume: 0.4
    });

    this.deathSound = new Howl({
      src: ['data:audio/wav;base64,UklGRhQAAABXQVZFZm10IBAAAAABAAEAQB8AABCxAgAEABAAZGF0YQAAAAA='],
      volume: 0.6
    });

    this.ambience = new Howl({
      src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAABCxAgAEABAAZGF0YQAAAAA='],
      loop: true,
      volume: 0.2
    });
  }

  playEat() {
    this.eatSound.play();
  }

  playDeath() {
    this.deathSound.play();
  }

  playAmbience() {
    if (!this.ambience.playing()) {
      this.ambience.play();
    }
  }

  setMuted(muted: boolean) {
    Howler.mute(muted);
  }
}
