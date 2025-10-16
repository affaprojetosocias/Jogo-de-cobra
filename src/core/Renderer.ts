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
  public readonly stage: Container;
  public readonly particleSystem: ParticleSystem;
  public readonly uiLayer: Container;

  private readonly backgroundLayer: Container;
  private readonly entityLayer: Container;
  private readonly foodLayer: Container;
  private readonly snakeLayer: Container;
  private readonly backgroundGradient: Sprite;
  private readonly floatingParticles: FloatingParticle[] = [];
  private gradientTimer = 0;
  private gradientPhase = 0;
  private gradientDirty = true;

  private readonly scoreboard: ScoreBoard;
  private readonly rankingPanel: RankingPanel;

  private constructor(app: Application) {
    this.app = app;
    this.stage = app.stage;
    this.stage.sortableChildren = true;

    this.backgroundLayer = new Container();
    this.entityLayer = new Container();
    this.foodLayer = new Container();
    this.snakeLayer = new Container();
    this.uiLayer = new Container();

    this.stage.addChild(this.backgroundLayer);
    this.stage.addChild(this.entityLayer);
    this.entityLayer.addChild(this.foodLayer);
    this.entityLayer.addChild(this.snakeLayer);
    this.stage.addChild(this.uiLayer);

    this.backgroundGradient = new Sprite(
      this.createGradientTexture(app.renderer.width || window.innerWidth, app.renderer.height || window.innerHeight)
    );
    this.backgroundGradient.width = app.renderer.width;
    this.backgroundGradient.height = app.renderer.height;
    this.backgroundLayer.addChild(this.backgroundGradient);

    this.createFloatingParticles();

  private constructor(private readonly mount: HTMLElement, app: Application) {
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

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.app.renderer.resize(width, height);
    this.backgroundGradient.width = width;
    this.backgroundGradient.height = height;
    this.backgroundGradient.texture.destroy(true);
    this.backgroundGradient.texture = this.createGradientTexture(width, height);
    this.gradientDirty = true;
  }

  private createGradientTexture(width: number, height: number, colorA?: number, colorB?: number) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(width));
    canvas.height = Math.max(1, Math.floor(height));
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return Texture.WHITE;
    }
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    const startColor = colorA ?? 0x040b1f;
    const endColor = colorB ?? 0x080f3f;
    gradient.addColorStop(0, `#${startColor.toString(16).padStart(6, '0')}`);
    gradient.addColorStop(1, `#${endColor.toString(16).padStart(6, '0')}`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return Texture.from(canvas);
  }

  get view(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement;
  }

  destroy() {
    this.app.destroy();
    this.mount.innerHTML = '';
  }
}
