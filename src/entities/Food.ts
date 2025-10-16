import { Container, Graphics, Point } from 'pixi.js';

/**
 * Representa uma comida coletável no campo. Possui animação simples para dar
 * sensação de energia.
 */
export class Food {
  public readonly container: Container;
  public readonly position: Point;
  public readonly radius: number;
  public readonly color: number;

  private readonly graphics: Graphics;
  private pulse = 0;

  constructor(position: Point, radius: number, color: number) {
    this.position = position.clone();
    this.radius = radius;
    this.color = color;

    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.container.position.copyFrom(this.position);

    this.redraw();
  }

  update(dt: number) {
    this.pulse += dt * 5;
    const scale = 0.9 + Math.sin(this.pulse) * 0.08;
    this.container.scale.set(scale);
  }

  private redraw() {
    this.graphics.clear();

    this.graphics.beginFill(this.color, 0.25);
    this.graphics.drawCircle(0, 0, this.radius + 6);
    this.graphics.endFill();

    this.graphics.beginFill(this.color, 0.85);
    this.graphics.drawCircle(0, 0, this.radius);
    this.graphics.endFill();
  }
}
