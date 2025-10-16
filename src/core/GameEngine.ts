import { Container, Point, Rectangle } from 'pixi.js';
import { Food } from '../entities/Food';
import { Snake } from '../entities/Snake';
import { Loop } from './Loop';
import { Renderer } from './Renderer';
import { InputSystem } from '../systems/InputSystem';
import { AISystem } from '../systems/AISystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { SoundSystem } from '../systems/SoundSystem';
import { Background } from '../ui/Background';
import { Hud } from '../ui/Hud';

/**
 * Orquestra todas as entidades, sistemas e o loop do jogo.
 */
export class GameEngine {
  private readonly renderer: Renderer;
  private readonly loop: Loop;
  private readonly input: InputSystem;
  private readonly aiSystem = new AISystem();
  private readonly particleSystem = new ParticleSystem();
  private readonly soundSystem = new SoundSystem();
  private readonly background: Background;
  private readonly hud = new Hud();

  private readonly worldBounds: Rectangle;
  private readonly foodLayer = new Container();
  private readonly snakeLayer = new Container();

  private readonly snakes: Snake[] = [];
  private readonly foods: Food[] = [];

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
    this.loop.start();
  }

  destroy() {
    this.loop.stop();
    this.input.destroy();
    window.removeEventListener('resize', this.handleResize);
    this.renderer.destroy();
  }

  private initializeSnakes() {
    const center = new Point(this.worldBounds.width / 2, this.worldBounds.height / 2);
    const player = new Snake({
      id: 'P',
      name: 'Jogador',
      color: 0x00ffff,
      initialPosition: center,
      initialDirection: 0,
      isPlayer: true,
      baseSpeed: 220,
      turnSpeed: 2.4,
      personality: 'curious'
    });
    this.addSnake(player);

    const aiConfigs = [
      { id: 'A', name: 'Víbora', color: 0xff00ff, personality: 'aggressive' as const },
      { id: 'B', name: 'Spectra', color: 0x00ff99, personality: 'cautious' as const },
      { id: 'C', name: 'Pulse', color: 0xffaa00, personality: 'curious' as const }
    ];

    aiConfigs.forEach((config, index) => {
      const angle = (index / aiConfigs.length) * Math.PI * 2;
      const distance = 200;
      const position = new Point(
        center.x + Math.cos(angle) * distance,
        center.y + Math.sin(angle) * distance
      );
      const snake = new Snake({
        id: config.id,
        name: config.name,
        color: config.color,
        initialPosition: position,
        initialDirection: angle,
        isPlayer: false,
        baseSpeed: 200 + Math.random() * 30,
        turnSpeed: 2.2,
        personality: config.personality
      });
      this.addSnake(snake);
    });
  }

  private initializeFood() {
    for (let i = 0; i < 24; i += 1) {
      this.spawnFood();
    }
  }

  private addSnake(snake: Snake) {
    this.snakes.push(snake);
    this.snakeLayer.addChild(snake.container);
    snake.update(0.016, this.worldBounds);
  }

  private spawnFood() {
    const palette = [0xff5f9e, 0x66ffcc, 0xffd166, 0x7c5cff, 0x4af3ff];
    const food = new Food({
      color: palette[Math.floor(Math.random() * palette.length)],
      radius: 8 + Math.random() * 4
    });
    const position = new Point(
      Math.random() * this.worldBounds.width,
      Math.random() * this.worldBounds.height
    );
    food.position = position;
    this.foods.push(food);
    this.foodLayer.addChild(food.container);
  }

  private update(delta: number) {
    this.background.update(delta);
    this.particleSystem.update(delta);
    this.ambientTimer -= delta;
    if (this.ambientTimer <= 0) {
      this.particleSystem.spawnAmbient(this.worldBounds.width, this.worldBounds.height, 0xffffff);
      this.ambientTimer = 0.35 + Math.random() * 0.45;
    }

    const player = this.snakes[0];
    if (player?.alive) {
      const turn = this.input.getTurnInput(player.directionAngle, player.head);
      player.setTurnInput(turn);
    }

    this.aiSystem.update(this.snakes, this.foods);

    for (const snake of this.snakes) {
      snake.update(delta, this.worldBounds);
    }

    this.handleFoodConsumption();
    this.handleCollisions();
    this.handleRespawns();
    this.hud.update(this.snakes, player);
  }

  private handleFoodConsumption() {
    for (let i = this.foods.length - 1; i >= 0; i -= 1) {
      const food = this.foods[i];
      for (const snake of this.snakes) {
        if (!snake.alive) continue;
        if (snake.collidesWithPoint(food.position, food.radius)) {
          const pos = food.position;
          snake.grow(30);
          this.soundSystem.playEat();
          this.particleSystem.spawnExplosion(pos, snake.color);
          this.foodLayer.removeChild(food.container);
          this.foods.splice(i, 1);
          this.spawnFood();
          break;
        }
      }
    }
  }

  private handleCollisions() {
    for (const snake of this.snakes) {
      if (!snake.alive) continue;
      if (snake.hasSelfCollision()) {
        snake.kill();
        this.soundSystem.playDeath();
        this.particleSystem.spawnExplosion(snake.head.clone(), 0xff6699);
        continue;
      }
      for (const other of this.snakes) {
        if (other === snake || !other.alive) continue;
        if (other.collidesWithPoint(snake.head, snake.boundingRadius * 0.6) ||
          other.collidesWithBody(snake.head, snake.boundingRadius * 0.6)) {
          snake.kill();
          this.soundSystem.playDeath();
          this.particleSystem.spawnExplosion(snake.head.clone(), 0xff3366);
          break;
        }
      }
    }
  }

  private handleRespawns() {
    for (const snake of this.snakes) {
      if (snake.canRespawn()) {
        const position = new Point(
          Math.random() * this.worldBounds.width,
          Math.random() * this.worldBounds.height
        );
        const direction = Math.random() * Math.PI * 2;
        snake.respawn(position, direction);
        snake.update(0.016, this.worldBounds);
      }
    }
  }

  private handleResize = () => {
    this.worldBounds.width = this.renderer.screen.width;
    this.worldBounds.height = this.renderer.screen.height;
    this.background.resize(this.worldBounds.width, this.worldBounds.height);
    this.hud.resize(this.worldBounds.width);
  };
}
