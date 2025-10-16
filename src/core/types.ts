import type { Snake } from '../entities/Snake';

export type SnakeBehavior = 'aggressive' | 'cautious' | 'balanced' | 'player';

export interface SnakeConfig {
  id: string;
  color: number;
  neonColor: number;
  initialSpeed: number;
  turnSpeed: number;
  behavior: SnakeBehavior;
  isPlayer: boolean;
}

export interface FoodConfig {
  radius: number;
  speedIncrement: number;
  growthAmount: number;
}

export interface GameState {
  snakes: Snake[];
  foods: number;
  isRunning: boolean;
}

export interface RankingEntry {
  id: string;
  score: number;
  length: number;
  color: number;
}
