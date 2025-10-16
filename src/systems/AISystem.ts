import { Point } from 'pixi.js';
import { Food } from '../entities/Food';
import { Snake } from '../entities/Snake';

/**
 * Controla as 3 cobras de IA com personalidades distintas.
 */
export class AISystem {
  update(snakes: Snake[], foods: Food[]) {
    const aiSnakes = snakes.filter((snake) => !snake.isPlayer);

    for (const snake of aiSnakes) {
      if (!snake.alive) continue;

      const avoidance = this.computeAvoidanceVector(snake, snakes);
      const foodVector = this.computeFoodVector(snake, foods);
      const wander = this.computeWanderVector(snake);

      let target: Point;
      switch (snake.personality) {
        case 'aggressive':
          target = this.combineVectors(foodVector, avoidance, wander, { food: 0.7, avoidance: 0.2, wander: 0.1 });
          break;
        case 'cautious':
          target = this.combineVectors(foodVector, avoidance, wander, { food: 0.4, avoidance: 0.5, wander: 0.1 });
          break;
        default:
          target = this.combineVectors(foodVector, avoidance, wander, { food: 0.5, avoidance: 0.2, wander: 0.3 });
          break;
      }

      const desiredAngle = Math.atan2(target.y, target.x);
      this.applySteering(snake, desiredAngle);
    }
  }

  private computeAvoidanceVector(snake: Snake, snakes: Snake[]): Point {
    const result = new Point();
    const head = snake.head;

    for (const other of snakes) {
      if (other === snake || !other.alive) continue;
      const otherHead = other.head;
      const dx = head.x - otherHead.x;
      const dy = head.y - otherHead.y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq === 0) continue;
      if (distanceSq < 140 * 140) {
        const weight = 1 / distanceSq;
        result.x += dx * weight;
        result.y += dy * weight;
      }
    }

    return result;
  }

  private computeFoodVector(snake: Snake, foods: Food[]): Point {
    const head = snake.head;
    let bestFood: Food | null = null;
    let bestDistance = Infinity;

    for (const food of foods) {
      const pos = food.position;
      const dx = pos.x - head.x;
      const dy = pos.y - head.y;
      const dist = Math.hypot(dx, dy);
      if (dist < bestDistance) {
        bestFood = food;
        bestDistance = dist;
      }
    }

    if (!bestFood) {
      return new Point(Math.cos(snake.directionAngle), Math.sin(snake.directionAngle));
    }

    const dx = bestFood.position.x - head.x;
    const dy = bestFood.position.y - head.y;
    return new Point(dx, dy);
  }

  private computeWanderVector(snake: Snake): Point {
    const t = performance.now() / 1000;
    const offset = snake.id.charCodeAt(0) * 0.5;
    const angle = snake.directionAngle + Math.sin(t * 0.5 + offset) * 0.8;
    return new Point(Math.cos(angle), Math.sin(angle));
  }

  private combineVectors(food: Point, avoidance: Point, wander: Point, weights: { food: number; avoidance: number; wander: number }): Point {
    const result = new Point(0, 0);
    result.x = food.x * weights.food + avoidance.x * weights.avoidance + wander.x * weights.wander;
    result.y = food.y * weights.food + avoidance.y * weights.avoidance + wander.y * weights.wander;

    if (result.x === 0 && result.y === 0) {
      result.x = 1;
    }

    return result;
  }

  private applySteering(snake: Snake, desiredAngle: number) {
    let diff = desiredAngle - snake.directionAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    const turn = Math.max(-1, Math.min(1, diff / (Math.PI / 2)));
    snake.setTurnInput(turn);
  }
}
