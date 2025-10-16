import { Container, Graphics, Point, filters } from 'pixi.js';
import type { SnakeConfig } from '../core/types';

/**
 * Representa uma cobra com corpo contínuo renderizado por segmentos circulares.
 * Contém dados de física e componentes gráficos para o loop de jogo.
 */
export class Snake {
  public readonly id: string;
  public readonly container: Container;
  public readonly body: Point[] = [];
  public readonly color: number;
  public readonly neonColor: number;
  public readonly behavior: SnakeConfig['behavior'];
  public readonly isPlayer: boolean;

  public direction: number = Math.random() * Math.PI * 2;
  public speed: number;
  public turnSpeed: number;
  public pulse: number = 0;
  public alive = true;
  public score = 0;

  private length = 120;
  private targetLength = 120;
  private readonly initialLength = 120;
  private readonly initialSpeed: number;
  private readonly maxLength = 1200;
  private readonly bodyGraphics: Graphics;
  private deathTimer = 0;

  constructor(config: SnakeConfig, start: Point) {
    this.id = config.id;
    this.color = config.color;
    this.neonColor = config.neonColor;
    this.speed = config.initialSpeed;
    this.initialSpeed = config.initialSpeed;
    this.turnSpeed = config.turnSpeed;
    this.behavior = config.behavior;
    this.isPlayer = config.isPlayer;

    this.container = new Container();
    this.container.sortableChildren = true;

    this.bodyGraphics = new Graphics();
    const glow = new filters.BlurFilter();
    glow.blur = 8;
    glow.quality = 4;
    this.bodyGraphics.filters = [glow];

    this.container.addChild(this.bodyGraphics);

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
    this.pulse = 0;
    this.updateGraphics();
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
