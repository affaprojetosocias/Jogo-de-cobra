import { Container, Point } from 'pixi.js';
import { Emitter } from '@pixi/particle-emitter';

/**
 * Gera partículas tanto para o plano de fundo quanto para explosões de morte.
 */
export class ParticleSystem {
  private readonly emitters: Emitter[] = [];

  constructor(private readonly container: Container) {}

  emitExplosion(position: Point, color: number) {
    const emitter = new Emitter(this.container, {
      lifetime: { min: 0.4, max: 0.8 },
      frequency: 0.001,
      spawnChance: 1,
      particlesPerWave: 12,
      emitterLifetime: 0.25,
      maxParticles: 200,
      autoUpdate: false,
      behaviors: [
        {
          type: 'alpha',
          config: { alpha: { list: [
            { value: 1, time: 0 },
            { value: 0, time: 1 }
          ] } }
        },
        {
          type: 'scale',
          config: {
            scale: {
              list: [
                { value: 1.2, time: 0 },
                { value: 0.2, time: 1 }
              ]
            }
          }
        },
        {
          type: 'moveAcceleration',
          config: {
            accel: { x: 0, y: 0 },
            minStart: 200,
            maxStart: 320,
            rotate: true
          }
        },
        {
          type: 'color',
          config: {
            color: {
              list: [
                { value: color, time: 0 },
                { value: 0xffffff, time: 1 }
              ]
            }
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'ring',
            data: {
              x: position.x,
              y: position.y,
              radius: { min: 0, max: 10 },
              innerRadius: 0
            }
          }
        }
      ]
    });

    emitter.updateSpawnPos(position.x, position.y);
    emitter.playOnceAndDestroy(() => {
      this.emitters.splice(this.emitters.indexOf(emitter), 1);
    });

    this.emitters.push(emitter);
  }

  update(dt: number) {
    for (const emitter of this.emitters) {
      emitter.update(dt);
    }
  }
}
