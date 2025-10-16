import { Point } from 'pixi.js';
import type { Food } from '../entities/Food';
import type { Snake } from '../entities/Snake';

interface Bounds {
  width: number;
  height: number;
}

/**
 * Controla cobras de IA com estilos diferentes.
 */
export class AISystem {
  constructor(
    private readonly snakes: Snake[],
    private readonly foods: Food[],
    private readonly bounds: Bounds
  ) {}

  update(dt: number) {
    for (const snake of this.snakes) {
      if (snake.isPlayer || !snake.alive) continue;
      const head = snake.body[0];
      if (!head) continue;

      const nearestFood = this.getNearestFood(head);
      if (nearestFood) {
        const desiredAngle = Math.atan2(
          nearestFood.position.y - head.y,
          nearestFood.position.x - head.x
        );
        this.turnTowards(snake, desiredAngle, dt);
      }

      this.avoidWalls(snake, head, dt);
      this.avoidSnakes(snake, head, dt);
    }
  }

  private getNearestFood(head: Point): Food | null {
    let nearest: Food | null = null;
    let minDist = Number.POSITIVE_INFINITY;
    for (const food of this.foods) {
      const dist = Math.hypot(food.position.x - head.x, food.position.y - head.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = food;
      }
    }
    return nearest;
  }

  private turnTowards(snake: Snake, desiredAngle: number, dt: number) {
    const diff = this.normalizeAngle(desiredAngle - snake.direction);

    const modifier =
      snake.behavior === 'aggressive' ? 1.5 : snake.behavior === 'cautious' ? 0.8 : 1;
    const maxTurn = snake.turnSpeed * modifier * dt;
    const turn = Math.max(-maxTurn, Math.min(maxTurn, diff));
    snake.direction += turn;
  }

  private avoidWalls(snake: Snake, head: Point, dt: number) {
    const margin = 80;
    const turnStrength = snake.behavior === 'cautious' ? 2 : 1;

    if (head.x < margin) {
      snake.direction += snake.turnSpeed * turnStrength * dt;
    } else if (head.x > this.bounds.width - margin) {
      snake.direction -= snake.turnSpeed * turnStrength * dt;
    }

    if (head.y < margin) {
      snake.direction += snake.turnSpeed * turnStrength * dt;
    } else if (head.y > this.bounds.height - margin) {
      snake.direction -= snake.turnSpeed * turnStrength * dt;
    }
  }

  private avoidSnakes(snake: Snake, head: Point, dt: number) {
    const detectionDistance = snake.behavior === 'aggressive' ? 40 : 70;
    let avoidance = 0;

    for (const other of this.snakes) {
      if (other === snake || !other.alive) continue;
      for (let i = 0; i < other.body.length; i += 5) {
        const segment = other.body[i];
        const dist = Math.hypot(segment.x - head.x, segment.y - head.y);
        if (dist < detectionDistance) {
          const angleAway = Math.atan2(head.y - segment.y, head.x - segment.x);
          const diff = this.normalizeAngle(angleAway - snake.direction);
          avoidance += diff;
        }
      }
    }

    if (avoidance !== 0) {
      const caution = snake.behavior === 'cautious' ? 1.4 : 1;
      snake.direction += avoidance * 0.5 * caution * dt;
    }
  }

  private normalizeAngle(angle: number) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }
}
