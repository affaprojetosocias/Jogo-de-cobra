import { Container, Graphics, Point } from 'pixi.js';
import type { SnakeConfig } from '../core/types';

/**
 * Representa uma cobra e a lógica responsável pelo movimento e renderização.
 */
export class Snake {
  public readonly container: Container;
  public readonly id: string;
  public readonly name: string;
  public readonly body: Point[] = [];
  public readonly color: number;
  public readonly neonColor: number;
  public readonly behavior: SnakeConfig['behavior'];
  public readonly isPlayer: boolean;

  public alive = true;
  public score = 0;
  public lengthScore = 0;

  public direction: number;
  public turnSpeed: number;

  private readonly bodyGraphics: Graphics;
  private readonly glowGraphics: Graphics;

  private readonly maxLength = 420;
  private readonly initialSpeed: number;
  private readonly initialLength = 160;

  private speed: number;
  private targetLength: number;
  private turnInput = 0;
  private deathTimer = 0;
  private pulse = 0;

  constructor(config: SnakeConfig, startPosition: Point) {
    this.container = new Container();
    this.bodyGraphics = new Graphics();
    this.glowGraphics = new Graphics();
    this.container.addChild(this.glowGraphics);
    this.container.addChild(this.bodyGraphics);

    this.id = config.id;
    this.name = config.id;
    this.color = config.color;
    this.neonColor = config.neonColor;
    this.behavior = config.behavior;
    this.isPlayer = config.isPlayer;

    this.initialSpeed = config.initialSpeed;
    this.turnSpeed = config.turnSpeed;
    this.speed = config.initialSpeed;
    this.direction = Math.random() * Math.PI * 2;
    this.targetLength = this.initialLength;

    const start = startPosition.clone();
    this.body.push(start);
    this.lengthScore = 0;

    this.updateGraphics();
  }

  update(dt: number) {
    if (!this.alive) {
      this.deathTimer += dt;
      const fade = Math.max(0, 1 - this.deathTimer * 0.9);
      this.container.alpha = fade;
      return;
    }

    this.direction += this.turnInput * this.turnSpeed * dt;

    const head = this.body[0];
    const distance = this.speed * dt;
    const newHead = new Point(
      head.x + Math.cos(this.direction) * distance,
      head.y + Math.sin(this.direction) * distance
    );
    this.body.unshift(newHead);

    const trimmed: Point[] = [this.body[0]];
    let accumulated = 0;
    for (let i = 1; i < this.body.length; i++) {
      const previous = trimmed[trimmed.length - 1];
      const current = this.body[i];
      const segmentDistance = Math.hypot(previous.x - current.x, previous.y - current.y);
      if (accumulated + segmentDistance <= this.targetLength) {
        trimmed.push(current);
        accumulated += segmentDistance;
      } else {
        const remaining = this.targetLength - accumulated;
        if (remaining > 0) {
          const ratio = remaining / segmentDistance;
          trimmed.push(
            new Point(
              previous.x + (current.x - previous.x) * ratio,
              previous.y + (current.y - previous.y) * ratio
            )
          );
          accumulated = this.targetLength;
        }
        break;
      }
    }

    this.body.length = trimmed.length;
    for (let i = 0; i < trimmed.length; i++) {
      this.body[i] = trimmed[i];
    }

    this.lengthScore = accumulated;
    this.pulse += dt * 2;
    this.container.alpha = 1;

    this.updateGraphics();
  }

  grow(amount: number, speedIncrement: number) {
    this.targetLength = Math.min(this.maxLength, this.targetLength + amount);
    this.speed = Math.min(this.initialSpeed * 1.8, this.speed + speedIncrement);
    this.score += Math.round(amount * 0.4);
  }

  setTurnInput(value: number) {
    this.turnInput = Math.max(-1, Math.min(1, value));
  }

  kill() {
    if (!this.alive) return;
    this.alive = false;
    this.deathTimer = 0;
    this.turnInput = 0;
  }

  reset(position: Point) {
    this.body.length = 0;
    this.body.push(position.clone());
    this.direction = Math.random() * Math.PI * 2;
    this.speed = this.initialSpeed;
    this.targetLength = this.initialLength;
    this.lengthScore = 0;
    this.score = 0;
    this.turnInput = 0;
    this.alive = true;
    this.deathTimer = 0;
    this.container.alpha = 1;
    this.updateGraphics();
  }

  getLength(): number {
    return this.lengthScore;
  }

  getHead(): Point | null {
    return this.body[0] ?? null;
  }

  private updateGraphics() {
    this.bodyGraphics.clear();
    this.glowGraphics.clear();

    if (this.body.length === 0) {
      return;
    }

    const glowColor = this.neonColor;
    for (let i = this.body.length - 1; i >= 0; i--) {
      const segment = this.body[i];
      const t = i / Math.max(1, this.body.length - 1);
      const radius = 10 + (1 - t) * 6;

      this.glowGraphics.beginFill(glowColor, 0.15);
      this.glowGraphics.drawCircle(segment.x, segment.y, radius + 6);
      this.glowGraphics.endFill();

      const alpha = 0.6 + 0.4 * Math.sin(this.pulse + t * Math.PI);
      this.bodyGraphics.beginFill(this.color, alpha);
      this.bodyGraphics.drawCircle(segment.x, segment.y, radius);
      this.bodyGraphics.endFill();
    }
  }
}
