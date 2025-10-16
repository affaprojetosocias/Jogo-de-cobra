import { Application, Container, Graphics, Sprite, Texture, utils } from 'pixi.js';
import type { Snake } from '../entities/Snake';
import type { Food } from '../entities/Food';
import { ParticleSystem } from '../systems/ParticleSystem';
import { ScoreBoard } from '../ui/ScoreBoard';
import { RankingPanel } from '../ui/RankingPanel';
import type { RankingEntry } from './types';

interface FloatingParticle {
  graphic: Graphics;
  velocityX: number;
  velocityY: number;
}

/**
 * Encapsula a instância do PixiJS Application e responsável por resize responsivo.
 */
export class Renderer {
  public readonly app: Application;
  private readonly mount: HTMLElement;

  /**
   * Prefer {@link Renderer.create} so that the Pixi application is fully initialised
   * before consumers interact with it.
   */
  constructor(mount: HTMLElement, app: Application) {
    this.mount = mount;
    this.app = app;
    this.mount.appendChild(this.app.canvas as HTMLCanvasElement);
  }

  static async create(mount: HTMLElement): Promise<Renderer> {
    const app = new Application();
    await app.init({
      resizeTo: mount,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    return new Renderer(mount, app);
  }

  get view(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement;
  }

  get view(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement;
  }

  get view(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement;
  }

  destroy() {
    this.app.destroy();
    this.mount.innerHTML = '';
  }
}
