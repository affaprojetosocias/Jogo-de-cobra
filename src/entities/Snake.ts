import { Container, Graphics, Point, Rectangle } from 'pixi.js';

export type SnakePersonality = 'aggressive' | 'cautious' | 'curious';

export interface SnakeConfig {
  id: string;
  name: string;
  color: number;
  initialPosition: Point;
  initialDirection: number;
  isPlayer: boolean;
  baseSpeed: number;
  turnSpeed: number;
  personality: SnakePersonality;
}

/**
 * Representa uma cobra com movimento suave e corpo em segmentos neon.
 */
export class Snake {
  public readonly container = new Container();
  public readonly id: string;
  public readonly name: string;
  public readonly isPlayer: boolean;
  public readonly personality: SnakePersonality;

  public alive = true;
  public score = 0;

  private readonly segmentSpacing = 14;
  private readonly radius = 12;
  private readonly maxSpeed = 300;

  private speed: number;
  private direction: number;
  private turnSpeed: number;
  private targetLength = 220;
  private readonly path: Point[] = [];
  private readonly segments: Graphics[] = [];
  private readonly baseColor: number;

  private pulseTimer = 0;
  private turnInput = 0;
  private dissolveProgress = 0;
  private respawnCooldown = 0;

  constructor(options: SnakeConfig) {
    this.id = options.id;
    this.name = options.name;
    this.isPlayer = options.isPlayer;
    this.personality = options.personality;
    this.baseColor = options.color;
    this.speed = options.baseSpeed;
    this.direction = options.initialDirection;
    this.turnSpeed = options.turnSpeed;

    const start = options.initialPosition.clone();
    this.path.push(start.clone(), start.clone(), start.clone());
    this.container.sortableChildren = true;
  }

  get head(): Point {
    return this.path[0];
  }

  get boundingRadius(): number {
    return this.radius;
  }

  get lengthScore(): number {
    return this.targetLength;
  }

  get directionAngle(): number {
    return this.direction;
  }

  get color(): number {
    return this.baseColor;
  }

  setTurnInput(value: number) {
    this.turnInput = Math.max(-1, Math.min(1, value));
  }

  grow(amount: number) {
    this.targetLength += amount;
    this.speed = Math.min(this.maxSpeed, this.speed + amount * 0.08);
    this.score += Math.floor(amount * 0.5);
  }

  kill() {
    if (!this.alive) return;
    this.alive = false;
    this.dissolveProgress = 0;
    this.respawnCooldown = 3;
  }

  canRespawn(): boolean {
    return !this.alive && this.respawnCooldown <= 0;
  }

  respawn(position: Point, direction: number) {
    this.path.length = 0;
    const origin = position.clone();
    this.path.push(origin.clone(), origin.clone(), origin.clone());
    this.direction = direction;
    this.speed = Math.max(160, this.speed * 0.9);
    this.targetLength = 220;
    this.alive = true;
    this.dissolveProgress = 0;
    this.container.alpha = 1;
  }

  update(delta: number, bounds: Rectangle) {
    this.pulseTimer += delta;

    if (this.alive) {
      this.direction += this.turnInput * this.turnSpeed * delta;
      const head = this.head;
      const distance = this.speed * delta;
      const newHead = new Point(
        (head.x + Math.cos(this.direction) * distance + bounds.width) % bounds.width,
        (head.y + Math.sin(this.direction) * distance + bounds.height) % bounds.height
      );

      this.path.unshift(newHead);
      this.trimPath();
      this.updateSegments();
      this.turnInput = 0;
    } else {
      this.dissolveProgress = Math.min(1, this.dissolveProgress + delta * 0.75);
      this.container.alpha = 1 - this.dissolveProgress;
      this.respawnCooldown = Math.max(0, this.respawnCooldown - delta);
    }
  }

  private trimPath() {
    let distance = 0;
    for (let i = 0; i < this.path.length - 1; i += 1) {
      const current = this.path[i];
      const next = this.path[i + 1];
      const dx = current.x - next.x;
      const dy = current.y - next.y;
      const segment = Math.hypot(dx, dy);
      if (distance + segment > this.targetLength) {
        const overflow = this.targetLength - distance;
        const ratio = overflow / segment;
        next.set(current.x - dx * ratio, current.y - dy * ratio);
        this.path.length = i + 2;
        return;
      }
      distance += segment;
    }

    const maxSamples = Math.ceil(this.targetLength / this.segmentSpacing) * 4;
    if (this.path.length > maxSamples) {
      this.path.length = maxSamples;
    }
  }

  private updateSegments() {
    const requiredSegments = Math.max(6, Math.floor(this.targetLength / this.segmentSpacing));

    while (this.segments.length < requiredSegments) {
      this.segments.push(this.createSegmentGraphic());
    }

    while (this.segments.length > requiredSegments) {
      const segment = this.segments.pop();
      segment?.destroy();
    }

    const pulse = (Math.sin(this.pulseTimer * 4) + 1) * 0.5;

    for (let i = 0; i < this.segments.length; i += 1) {
      const segment = this.segments[i];
      const sample = this.samplePath(i * this.segmentSpacing);
      if (!sample) continue;

      const falloff = 1 - i / this.segments.length;
      const pulseScale = 0.85 + pulse * 0.2 * falloff;

      segment.position.copyFrom(sample);
      segment.scale.set(pulseScale);
      segment.alpha = 0.25 + falloff * 0.75;
      segment.zIndex = this.segments.length - i;
    }
  }

  private samplePath(distance: number): Point | null {
    if (this.path.length < 2) {
      return null;
    }

    let accumulated = 0;
    for (let i = 0; i < this.path.length - 1; i += 1) {
      const current = this.path[i];
      const next = this.path[i + 1];
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const segment = Math.hypot(dx, dy);
      if (accumulated + segment >= distance) {
        const ratio = (distance - accumulated) / segment;
        return new Point(current.x + dx * ratio, current.y + dy * ratio);
      }
      accumulated += segment;
    }

    return this.path[this.path.length - 1].clone();
  }

  private createSegmentGraphic(): Graphics {
    const g = new Graphics();
    this.drawSegment(g);
    this.container.addChild(g);
    return g;
  }

  private drawSegment(graphic: Graphics) {
    graphic.clear();
    graphic.beginFill(this.baseColor, 0.1);
    graphic.drawCircle(0, 0, this.radius * 1.8);
    graphic.endFill();
    graphic.beginFill(this.baseColor, 0.35);
    graphic.drawCircle(0, 0, this.radius * 1.4);
    graphic.endFill();
    graphic.beginFill(this.baseColor, 0.95);
    graphic.drawCircle(0, 0, this.radius);
    graphic.endFill();
  }

  collidesWithPoint(point: Point, radius: number): boolean {
    const head = this.head;
    const dx = head.x - point.x;
    const dy = head.y - point.y;
    return dx * dx + dy * dy <= (this.radius + radius) ** 2;
  }

  collidesWithBody(point: Point, radius: number, skipHeadSegments = 5): boolean {
    const limit = this.path.length;
    for (let i = skipHeadSegments; i < limit; i += 1) {
      const sample = this.path[i];
      const dx = sample.x - point.x;
      const dy = sample.y - point.y;
      if (dx * dx + dy * dy <= (this.radius + radius) ** 2) {
        return true;
      }
    }
    return false;
  }

  hasSelfCollision(): boolean {
    if (this.path.length < 12) {
      return false;
    }

    const head = this.head;
    for (let i = 6; i < this.path.length; i += 1) {
      const point = this.path[i];
      const dx = head.x - point.x;
      const dy = head.y - point.y;
      if (dx * dx + dy * dy < (this.radius * 0.9) ** 2) {
        return true;
      }
    }

    return false;
  }
}
