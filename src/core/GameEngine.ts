import { Point, Rectangle } from 'pixi.js';
import { Food } from '../entities/Food';
import { Snake } from '../entities/Snake';
import { AISystem } from '../systems/AISystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { InputSystem } from '../systems/InputSystem';
import { SoundSystem } from '../systems/SoundSystem';
import { Background } from '../ui/Background';
import { Loop } from './Loop';
import { Renderer } from './Renderer';
import type { FoodConfig, RankingEntry, SnakeConfig } from './types';

/**
 * Orquestra o ciclo principal do jogo conectando sistemas e renderização.
 */
export class GameEngine {
  private readonly renderer: Renderer;
  private readonly loop: Loop;
  private readonly input: InputSystem;
  private readonly aiSystem: AISystem;
  private readonly collisionSystem: CollisionSystem;
  private readonly soundSystem: SoundSystem;

  private readonly snakes: Snake[] = [];
  private readonly foods: Food[] = [];

  private readonly worldBounds: Rectangle;
  private readonly background: Background;
  private readonly foodConfig: FoodConfig = {
    radius: 10,
    speedIncrement: 18,
    growthAmount: 42
  };

  private readonly resizeListener: () => void;

  static async create(mount: HTMLElement): Promise<GameEngine> {
    const renderer = await Renderer.create(mount);
    return new GameEngine(renderer);
  }

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.soundSystem = new SoundSystem();

    this.worldBounds = new Rectangle(0, 0, this.renderer.screen.width, this.renderer.screen.height);
    this.background = new Background(this.worldBounds.width, this.worldBounds.height);
    this.renderer.setBackground(this.background);

    const playerSnake = this.initializeSnakes();
    this.input = new InputSystem(this.renderer.view, playerSnake);
    this.aiSystem = new AISystem(this.snakes, this.foods, this.worldBounds);
    this.collisionSystem = new CollisionSystem(
      this.snakes,
      this.foods,
      this.worldBounds,
      (snake, food) => this.handleEat(snake, food),
      (snake) => this.handleDeath(snake)
    );

    this.spawnInitialFood(25);

    this.loop = new Loop((delta) => this.update(delta));

    this.resizeListener = () => this.handleResize();
    window.addEventListener('resize', this.resizeListener);
  }

  start() {
    this.soundSystem.unlock();
    this.loop.start();
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
    window.removeEventListener('resize', this.resizeListener);
    this.renderer.destroy();
  }

  private initializeSnakes(): Snake {
    const playerConfig: SnakeConfig = {
      id: 'Você',
      color: 0x00f7ff,
      neonColor: 0x7af4ff,
      initialSpeed: 160,
      turnSpeed: 3.2,
      behavior: 'player',
      isPlayer: true
    };

    const aiConfigs: SnakeConfig[] = [
      {
        id: 'Rex',
        color: 0xff006f,
        neonColor: 0xff4a9b,
        initialSpeed: 150,
        turnSpeed: 2.8,
        behavior: 'aggressive',
        isPlayer: false
      },
      {
        id: 'Iris',
        color: 0x7c4dff,
        neonColor: 0xb894ff,
        initialSpeed: 140,
        turnSpeed: 2.4,
        behavior: 'balanced',
        isPlayer: false
      },
      {
        id: 'Gaia',
        color: 0x3fff7c,
        neonColor: 0x9bffbe,
        initialSpeed: 130,
        turnSpeed: 2.1,
        behavior: 'cautious',
        isPlayer: false
      }
    ];

    const spawnPoint = () =>
      new Point(
        Math.random() * this.worldBounds.width,
        Math.random() * this.worldBounds.height
      );

    const playerSnake = this.createSnake(playerConfig, spawnPoint());

    for (const config of aiConfigs) {
      this.createSnake(config, spawnPoint());
    }

    return playerSnake;
  }

  private createSnake(config: SnakeConfig, position: Point) {
    const snake = new Snake(config, position);
    this.snakes.push(snake);
    this.renderer.addSnake(snake);
    return snake;
  }

  private spawnInitialFood(amount: number) {
    for (let i = 0; i < amount; i++) {
      this.spawnFood();
    }
  }

  private spawnFood() {
    const position = new Point(
      Math.random() * this.worldBounds.width,
      Math.random() * this.worldBounds.height
    );
    const food = new Food(position, this.foodConfig.radius, 0xfff07a);
    this.foods.push(food);
    this.renderer.addFood(food);
  }

  private update(delta: number) {
    this.renderer.updateBackground(delta);

    this.input.update();
    this.aiSystem.update(delta);

    for (const snake of this.snakes) {
      snake.update(delta);
    }

    for (const food of this.foods) {
      food.update(delta);
    }

    this.collisionSystem.update();
    this.renderer.particleSystem.update(delta);

    const player = this.snakes.find((snake) => snake.isPlayer);
    if (player) {
      this.renderer.updateScore(player.score);
    }

    const ranking = this.createRanking();
    const maxLength = ranking.reduce((max, entry) => Math.max(max, entry.length), 1);
    this.renderer.updateRanking(ranking, maxLength);
  }

  private handleEat(snake: Snake, food: Food) {
    snake.grow(this.foodConfig.growthAmount, this.foodConfig.speedIncrement);
    this.soundSystem.playEat();
    this.renderer.removeFood(food);
    this.spawnFood();
  }

  private handleDeath(snake: Snake) {
    snake.kill();
    const head = snake.getHead();
    if (head) {
      this.renderer.particleSystem.emitExplosion(head.clone(), snake.neonColor);
    }
    this.soundSystem.playDeath();

    window.setTimeout(() => this.respawnSnake(snake), 2000);
  }

  private respawnSnake(snake: Snake) {
    const position = new Point(
      Math.random() * this.worldBounds.width,
      Math.random() * this.worldBounds.height
    );
    snake.reset(position);
  }

  private handleResize() {
    const { width, height } = this.renderer.screen;
    this.worldBounds.width = width;
    this.worldBounds.height = height;
    this.renderer.resize(width, height);
  }

  private createRanking(): RankingEntry[] {
    return this.snakes
      .map<RankingEntry>((snake) => ({
        id: snake.id,
        score: snake.score,
        length: snake.getLength(),
        color: snake.neonColor
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }
}
