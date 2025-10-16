import { Point } from 'pixi.js';
import { Snake } from '../entities/Snake';
import { Food } from '../entities/Food';
import { Renderer } from './Renderer';
import { InputSystem } from '../systems/InputSystem';
import { AISystem } from '../systems/AISystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { SoundManager } from './SoundManager';
import type { FoodConfig, RankingEntry, SnakeConfig } from './types';

/**
 * Orquestra os sistemas principais do jogo, cuidando do loop de atualização
 * e da interação entre física, IA e renderização.
 */
export class GameEngine {
  private readonly renderer: Renderer;
  private readonly snakes: Snake[] = [];
  private readonly foods: Food[] = [];
  private readonly soundManager = new SoundManager();
  private readonly foodConfig: FoodConfig = {
    radius: 12,
    speedIncrement: 4,
    growthAmount: 40
  };
  private inputSystem?: InputSystem;
  private aiSystem?: AISystem;
  private collisionSystem?: CollisionSystem;
  private running = false;
  private lastTime = 0;
  private readonly gameBounds = { width: window.innerWidth, height: window.innerHeight };

  private constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  private ambientTimer = 0;

  static async create(mount: HTMLElement): Promise<GameEngine> {
    const renderer = await Renderer.create(mount);
    return new GameEngine(renderer);
  }

  private constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.worldBounds = new Rectangle(0, 0, this.renderer.screen.width, this.renderer.screen.height);
    this.background = new Background(this.worldBounds.width, this.worldBounds.height);

    this.renderer.stage.addChild(this.background.container);
    this.renderer.stage.addChild(this.particleSystem.container);
    this.renderer.stage.addChild(this.foodLayer);
    this.renderer.stage.addChild(this.snakeLayer);
    this.renderer.stage.addChild(this.hud.container);

    this.input = new InputSystem(this.renderer.view);
    this.soundSystem.unlock();

    this.loop = new Loop((delta) => this.update(delta));

    window.addEventListener('resize', this.handleResize);
    this.initializeSnakes();
    this.initializeFood();
    this.hud.resize(this.worldBounds.width);
  }

  start() {
    this.running = true;
    this.soundManager.playAmbience();
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  private loop = (time: number) => {
    if (!this.running) return;

    const delta = Math.min(0.05, (time - this.lastTime) / 1000);
    this.lastTime = time;

    this.update(delta);
    requestAnimationFrame((next) => this.loop(next));
  };

  private initialize() {
    const playerConfig: SnakeConfig = {
      id: 'Você',
      color: 0x00f7ff,
      neonColor: 0x7af4ff,
      initialSpeed: 120,
      turnSpeed: 3.2,
      behavior: 'player',
      isPlayer: true
    };

    const aiConfigs: SnakeConfig[] = [
      {
        id: 'Rex',
        color: 0xff006f,
        neonColor: 0xff4a9b,
        initialSpeed: 110,
        turnSpeed: 2.8,
        behavior: 'aggressive',
        isPlayer: false
      },
      {
        id: 'Iris',
        color: 0x7c4dff,
        neonColor: 0xb894ff,
        initialSpeed: 105,
        turnSpeed: 2.4,
        behavior: 'balanced',
        isPlayer: false
      },
      {
        id: 'Gaia',
        color: 0x3fff7c,
        neonColor: 0x9bffbe,
        initialSpeed: 95,
        turnSpeed: 2.1,
        behavior: 'cautious',
        isPlayer: false
      }
    ];

    const spawnPoint = () =>
      new Point(
        Math.random() * this.gameBounds.width,
        Math.random() * this.gameBounds.height
      );

    const playerSnake = new Snake(playerConfig, spawnPoint());
    this.snakes.push(playerSnake);
    this.renderer.addSnake(playerSnake);

    aiConfigs.forEach((config) => {
      const snake = new Snake(config, spawnPoint());
      this.snakes.push(snake);
      this.renderer.addSnake(snake);
    });

    this.inputSystem = new InputSystem(playerSnake);
    this.inputSystem.initialize();

    this.aiSystem = new AISystem(this.snakes, this.foods, this.gameBounds);
    this.collisionSystem = new CollisionSystem(
      this.snakes,
      this.foods,
      this.gameBounds,
      (snake, food) => this.handleEat(snake, food),
      (snake) => this.handleDeath(snake)
    );

    for (let i = 0; i < 25; i++) {
      this.spawnFood();
    }

    window.addEventListener('resize', () => {
      this.gameBounds.width = window.innerWidth;
      this.gameBounds.height = window.innerHeight;
    });
  }

  private update(dt: number) {
    this.renderer.updateBackground(dt);

    if (this.inputSystem) {
      this.inputSystem.update(dt);
    }
    if (this.aiSystem) {
      this.aiSystem.update(dt);
    }

    for (const snake of this.snakes) {
      snake.update(dt);
    }

    for (const food of this.foods) {
      food.update(dt);
    }

    if (this.collisionSystem) {
      this.collisionSystem.update();
    }

    this.renderer.particleSystem.update(dt);

    const player = this.snakes.find((s) => s.isPlayer);
    if (player) {
      this.renderer.updateScore(player.score);
    }

    const ranking = this.createRanking();
    const maxLength = Math.max(400, ...this.snakes.map((snake) => snake.getLength()));
    this.renderer.updateRanking(ranking, maxLength);
  }

  private spawnFood() {
    const position = new Point(
      Math.random() * this.gameBounds.width,
      Math.random() * this.gameBounds.height
    );
    const food = new Food(position, this.foodConfig.radius, 0xfff07a);
    this.foods.push(food);
    this.renderer.addFood(food);
  }

  private handleEat(snake: Snake, food: Food) {
    snake.grow(this.foodConfig.growthAmount, this.foodConfig.speedIncrement);
    this.soundManager.playEat();
    this.renderer.removeFood(food);
    this.spawnFood();
  }

  private handleDeath(snake: Snake) {
    snake.kill();
    const head = snake.body[0];
    if (head) {
      this.renderer.particleSystem.emitExplosion(head.clone(), snake.neonColor);
    }
    this.soundManager.playDeath();

    setTimeout(() => this.respawnSnake(snake), 2000);
  }

  private respawnSnake(snake: Snake) {
    const spawn = new Point(
      Math.random() * this.gameBounds.width,
      Math.random() * this.gameBounds.height
    );
    snake.reset(spawn);
  }

  private createRanking(): RankingEntry[] {
    return this.snakes
      .map<RankingEntry>((snake) => ({
        id: snake.id,
        score: snake.score,
        length: snake.getLength(),
        color: snake.color
      }))
      .sort((a, b) => {
        if (b.score === a.score) {
          return b.length - a.length;
        }
        return b.score - a.score;
      });
  }
}
