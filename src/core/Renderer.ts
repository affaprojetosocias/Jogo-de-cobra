import { Application, Container } from 'pixi.js';
import type { Food } from '../entities/Food';
import type { Snake } from '../entities/Snake';
import { ParticleSystem } from '../systems/ParticleSystem';
import { Background } from '../ui/Background';
import { RankingPanel } from '../ui/RankingPanel';
import { ScoreBoard } from '../ui/ScoreBoard';
import type { RankingEntry } from './types';

/**
 * Centraliza a configuração do PixiJS e organiza as camadas principais da cena.
 */
export class Renderer {
  public readonly app: Application;
  public readonly stage: Container;
  public readonly backgroundLayer: Container;
  public readonly foodLayer: Container;
  public readonly snakeLayer: Container;
  public readonly uiLayer: Container;
  public readonly particleSystem: ParticleSystem;

  private readonly mount: HTMLElement;
  private readonly scoreBoard: ScoreBoard;
  private readonly rankingPanel: RankingPanel;
  private background: Background | null = null;

  constructor(mount: HTMLElement, app: Application) {
    this.mount = mount;
    this.app = app;
    this.mount.appendChild(this.app.canvas as HTMLCanvasElement);

    this.stage = this.app.stage;
    this.backgroundLayer = new Container();
    this.foodLayer = new Container();
    this.snakeLayer = new Container();
    this.particleSystem = new ParticleSystem();
    this.uiLayer = new Container();

    this.stage.addChild(this.backgroundLayer);
    this.stage.addChild(this.foodLayer);
    this.stage.addChild(this.snakeLayer);
    this.stage.addChild(this.particleSystem.container);
    this.stage.addChild(this.uiLayer);

    this.scoreBoard = new ScoreBoard();
    this.uiLayer.addChild(this.scoreBoard.container);

    this.rankingPanel = new RankingPanel();
    this.uiLayer.addChild(this.rankingPanel.container);

    this.layoutHud();
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

  get screen() {
    return this.app.screen;
  }

  setBackground(background: Background) {
    this.backgroundLayer.removeChildren();
    this.backgroundLayer.addChild(background.container);
    this.background = background;
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
    this.scoreBoard.update(score);
  }

  updateRanking(ranking: RankingEntry[], maxLength: number) {
    this.rankingPanel.update(ranking, maxLength);
  }

  updateBackground(delta: number) {
    this.background?.update(delta);
  }

  resize(width: number, height: number) {
    this.background?.resize(width, height);
    this.layoutHud();
  }

  destroy() {
    this.app.destroy();
    this.mount.innerHTML = '';
  }

  private layoutHud() {
    this.scoreBoard.container.position.set(0, 0);
    this.rankingPanel.container.position.set(16, 70);
  }
}
