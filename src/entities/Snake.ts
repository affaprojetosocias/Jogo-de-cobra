import { Container, Graphics, Point, filters } from 'pixi.js';
import type { SnakeConfig } from '../core/types';

/**
 * Representa uma cobra com corpo contínuo renderizado por segmentos circulares.
 * Contém dados de física e componentes gráficos para o loop de jogo.
 */
export class Snake {
  public readonly container: Container;
  public readonly id: string;
  public readonly container: Container;
  public readonly body: Point[] = [];
  public readonly color: number;
  public readonly neonColor: number;
  public readonly behavior: SnakeConfig['behavior'];
  public readonly isPlayer: boolean;

  public alive: boolean;
  public score: number;

  private readonly segmentSpacing: number;
  private readonly radius: number;
  private readonly maxSpeed: number;

  private speed: number;
  private direction: number;
  private turnSpeed: number;
  private targetLength: number;
  private readonly path: Point[];
  private readonly segments: Graphics[];
  private readonly baseColor: number;

  private pulseTimer: number;
  private turnInput: number;
  private dissolveProgress: number;
  private respawnCooldown: number;

  constructor(options: SnakeConfig) {
    this.container = new Container();
    this.id = options.id;
    this.name = options.name;
    this.isPlayer = options.isPlayer;
    this.personality = options.personality;
    this.baseColor = options.color;

    this.segmentSpacing = 14;
    this.radius = 12;
    this.maxSpeed = 300;

    this.alive = true;
    this.score = 0;

    this.speed = options.baseSpeed;
    this.direction = options.initialDirection;
    this.turnSpeed = options.turnSpeed;
    this.targetLength = 220;

    this.path = [];
    this.segments = [];

    this.pulseTimer = 0;
    this.turnInput = 0;
    this.dissolveProgress = 0;
    this.respawnCooldown = 0;

    this.body.push(new Point(start.x, start.y));
  }

  /**
   * Atualiza o movimento da cobra, adicionando o novo ponto da cabeça e
   * aparando o rastro conforme o tamanho desejado.
   */
  update(dt: number) {
    if (!this.alive) {
      this.deathTimer += dt;
      this.container.alpha = Math.max(0, 1 - this.deathTimer * 0.6);
      return;
    }

    const head = this.body[0];
    const distance = this.speed * dt;
    const newHead = new Point(
      head.x + Math.cos(this.direction) * distance,
      head.y + Math.sin(this.direction) * distance
    );
    this.body.unshift(newHead);

    let accumulated = 0;
    const trimmed: Point[] = [this.body[0]];

    for (let i = 1; i < this.body.length; i++) {
      const prev = this.body[i - 1];
      const current = this.body[i];
      const segmentDist = Math.hypot(prev.x - current.x, prev.y - current.y);
      if (accumulated + segmentDist <= this.targetLength) {
        trimmed.push(current);
        accumulated += segmentDist;
      } else {
        const remaining = this.targetLength - accumulated;
        if (remaining > 0) {
          const ratio = remaining / segmentDist;
          const point = new Point(
            prev.x + (current.x - prev.x) * ratio,
            prev.y + (current.y - prev.y) * ratio
          );
          trimmed.push(point);
          accumulated = this.targetLength;
        }
        break;
      }
    }

    this.body.length = trimmed.length;
    for (let i = 0; i < trimmed.length; i++) {
      this.body[i] = trimmed[i];
    }

    this.length = accumulated;
    this.pulse += dt * 2;

    this.updateGraphics();
  }

  /**
   * Aumenta o tamanho da cobra e ajusta um leve incremento de velocidade.
   */
  grow(amount: number, speedIncrement: number) {
    this.targetLength = Math.min(this.maxLength, this.targetLength + amount);
    this.speed += speedIncrement;
    this.score += Math.round(amount * 0.5);
  }

  /**
   * Marca a cobra como morta e inicia o efeito de dissolução.
   */
  kill() {
    if (!this.alive) return;
    this.alive = false;
    this.deathTimer = 0;
  }

  reset(position: Point) {
    this.body.length = 0;
    this.body.push(new Point(position.x, position.y));
    this.direction = Math.random() * Math.PI * 2;
    this.length = this.initialLength;
    this.targetLength = this.initialLength;
    this.speed = this.initialSpeed;
    this.score = 0;
    this.alive = true;
    this.container.alpha = 1;
    this.respawnCooldown = 0;
  }

  getLength(): number {
    return this.length;
  }

  private updateGraphics() {
    this.bodyGraphics.clear();

    const pulseStrength = (Math.sin(this.pulse) + 1) * 0.5;
    const baseRadius = 6 + pulseStrength * 2;

    for (let i = 0; i < this.body.length; i++) {
      const p = this.body[i];
      const t = i / this.body.length;
      const radius = baseRadius * (1 - t * 0.4);

      this.bodyGraphics.beginFill(this.color, 0.8);
      this.bodyGraphics.drawCircle(p.x, p.y, radius + 2);
      this.bodyGraphics.endFill();

      this.bodyGraphics.beginFill(this.neonColor, 0.95);
      this.bodyGraphics.drawCircle(p.x, p.y, radius);
      this.bodyGraphics.endFill();
    }
  }
}
