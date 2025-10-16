import { Container, Graphics, Point } from 'pixi.js';

/**
 * Comida coletável pelas cobras. Possui sprite simples e animação leve.
 */
export class Food {
  public readonly container: Container;
  public readonly position: Point;
  public radius: number;
  private pulse = 0;
  private readonly graphics: Graphics;

  constructor(position: Point, radius: number, color: number) {
    this.position = position;
    this.radius = radius;
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.container.position.copyFrom(position);

    this.draw(color);
  }

  update(dt: number) {
    this.pulse += dt * 5;
    const scale = 0.9 + Math.sin(this.pulse) * 0.1;
    this.container.scale.set(scale, scale);
  }

  private draw(color: number) {
    this.graphics.clear();
    this.graphics.beginFill(color, 0.6);
    this.graphics.drawCircle(0, 0, this.radius + 6);
    this.graphics.endFill();

    this.graphics.beginFill(color, 1);
    this.graphics.drawCircle(0, 0, this.radius);
    this.graphics.endFill();
  }
}
