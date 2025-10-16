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
 * Responsável por instanciar e organizar a cena Pixi, incluindo plano de fundo,
 * entidades e elementos de UI.
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

    this.particleSystem = new ParticleSystem(this.entityLayer);

    this.scoreboard = new ScoreBoard();
    this.uiLayer.addChild(this.scoreboard.container);

    this.rankingPanel = new RankingPanel();
    this.uiLayer.addChild(this.rankingPanel.container);

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  static async create(width: number, height: number) {
    const app = await Application.init({
      width,
      height,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    return new Renderer(app);
  }

  mount(target: HTMLElement) {
    target.appendChild(this.app.canvas);
  }

  addSnake(snake: Snake) {
    this.snakeLayer.addChild(snake.container);
  }

  removeSnake(snake: Snake) {
    this.snakeLayer.removeChild(snake.container);
  }

  addFood(food: Food) {
    this.foodLayer.addChild(food.container);
  }

  removeFood(food: Food) {
    this.foodLayer.removeChild(food.container);
  }

  updateScore(score: number) {
    this.scoreboard.update(score);
  }

  updateRanking(entries: RankingEntry[], maxLength: number) {
    this.rankingPanel.update(entries, maxLength);
  }

  updateBackground(dt: number) {
    this.gradientTimer += dt;
    this.gradientPhase += dt * 0.2;

    if (this.gradientTimer >= 0.3 || this.gradientDirty) {
      this.gradientTimer = 0;
      this.gradientDirty = false;
      const hueA = (this.gradientPhase * 60) % 360;
      const hueB = (hueA + 120) % 360;
      const colorA = utils.string2hex(`hsl(${hueA}, 80%, 12%)`);
      const colorB = utils.string2hex(`hsl(${hueB}, 90%, 18%)`);

      const texture = this.createGradientTexture(
        this.app.renderer.width,
        this.app.renderer.height,
        colorA,
        colorB
      );
      this.backgroundGradient.texture.destroy(true);
      this.backgroundGradient.texture = texture;
      this.backgroundGradient.width = this.app.renderer.width;
      this.backgroundGradient.height = this.app.renderer.height;
    }

    for (const particle of this.floatingParticles) {
      particle.graphic.x += particle.velocityX * dt * 60;
      particle.graphic.y += particle.velocityY * dt * 60;

      if (particle.graphic.x > this.app.renderer.width) particle.graphic.x = 0;
      if (particle.graphic.x < 0) particle.graphic.x = this.app.renderer.width;
      if (particle.graphic.y > this.app.renderer.height) particle.graphic.y = 0;
      if (particle.graphic.y < 0) particle.graphic.y = this.app.renderer.height;
    }
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

  private createFloatingParticles() {
    const count = 60;
    for (let i = 0; i < count; i++) {
      const graphic = new Graphics();
      graphic.beginFill(0xffffff, 0.05);
      graphic.drawCircle(0, 0, Math.random() * 2 + 1);
      graphic.endFill();
      const width = this.app.renderer.width || window.innerWidth;
      const height = this.app.renderer.height || window.innerHeight;
      graphic.x = Math.random() * width;
      graphic.y = Math.random() * height;
      this.backgroundLayer.addChild(graphic);
      this.floatingParticles.push({
        graphic,
        velocityX: (Math.random() - 0.5) * 0.2,
        velocityY: (Math.random() - 0.5) * 0.2
      });
    }
  }
}
