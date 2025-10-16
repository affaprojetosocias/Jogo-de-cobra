import type { Food } from '../entities/Food';
import type { Snake } from '../entities/Snake';

interface Bounds {
  width: number;
  height: number;
}

export type EatCallback = (snake: Snake, food: Food) => void;
export type DeathCallback = (snake: Snake) => void;

/**
 * Detecta colisões entre cobras e comidas, além de auto colisões.
 */
export class CollisionSystem {
  constructor(
    private readonly snakes: Snake[],
    private readonly foods: Food[],
    private readonly bounds: Bounds,
    private readonly onEat: EatCallback,
    private readonly onDeath: DeathCallback
  ) {}

  update() {
    for (const snake of this.snakes) {
      if (!snake.alive) continue;
      this.wrapAround(snake);
      this.checkFoodCollision(snake);
      this.checkSnakeCollision(snake);
    }
  }

  private wrapAround(snake: Snake) {
    const head = snake.body[0];
    if (!head) return;
    if (head.x < 0) {
      for (const segment of snake.body) {
        segment.x += this.bounds.width;
      }
    } else if (head.x > this.bounds.width) {
      for (const segment of snake.body) {
        segment.x -= this.bounds.width;
      }
    }

    if (head.y < 0) {
      for (const segment of snake.body) {
        segment.y += this.bounds.height;
      }
    } else if (head.y > this.bounds.height) {
      for (const segment of snake.body) {
        segment.y -= this.bounds.height;
      }
    }
  }

  private checkFoodCollision(snake: Snake) {
    const head = snake.body[0];
    if (!head) return;

    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];
      const dist = Math.hypot(food.position.x - head.x, food.position.y - head.y);
      if (dist < food.radius + 12) {
        this.foods.splice(i, 1);
        this.onEat(snake, food);
      }
    }
  }

  private checkSnakeCollision(snake: Snake) {
    const head = snake.body[0];
    if (!head) return;

    for (const other of this.snakes) {
      if (!other.alive) continue;
      const startIndex = other === snake ? 6 : 0;
      for (let i = startIndex; i < other.body.length; i += 2) {
        const segment = other.body[i];
        const dist = Math.hypot(segment.x - head.x, segment.y - head.y);
        if (dist < 10) {
          this.onDeath(snake);
          return;
        }
      }
    }
  }
}
