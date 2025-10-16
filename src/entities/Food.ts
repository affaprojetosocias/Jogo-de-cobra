import { Container, Graphics, Point } from 'pixi.js';

export interface FoodConfig {
  color: number;
  radius: number;
}

/**
 * Representa uma comida flutuante que aumenta o tamanho das cobras.
 */
export class Food {
  public readonly container = new Container();
  public readonly radius: number;
  public readonly color: number;

  private readonly sprite: Graphics;

  constructor(private readonly config: FoodConfig) {
    this.radius = config.radius;
    this.color = config.color;
    this.sprite = new Graphics();
    this.draw();
    this.container.addChild(this.sprite);
  }

  set position(point: Point) {
    this.container.position.copyFrom(point);
  }

  get position(): Point {
    return this.container.position.clone();
  }

  private draw() {
    this.sprite.clear();
    this.sprite.beginFill(this.color, 0.25);
    this.sprite.drawCircle(0, 0, this.radius * 1.8);
    this.sprite.endFill();
    this.sprite.beginFill(this.color, 0.85);
    this.sprite.drawCircle(0, 0, this.radius);
    this.sprite.endFill();
  }
}
