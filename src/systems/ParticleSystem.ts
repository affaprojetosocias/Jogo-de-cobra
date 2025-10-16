import { Container, Graphics, Point } from 'pixi.js';

interface Particle {
  sprite: Graphics;
  velocity: Point;
  lifetime: number;
  maxLifetime: number;
}

/**
 * Sistema simples de partículas para explosões ao morrer.
 */
export class ParticleSystem {
  public readonly container: Container;
  private readonly particles: Particle[] = [];

  constructor() {
    this.container = new Container();
  }

  emitExplosion(position: Point, color: number) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 80 + Math.random() * 160;
      const velocity = new Point(Math.cos(angle) * speed, Math.sin(angle) * speed);

      const sprite = new Graphics();
      sprite.beginFill(color, 0.9);
      sprite.drawCircle(0, 0, 4 + Math.random() * 3);
      sprite.endFill();
      sprite.position.copyFrom(position);

      this.container.addChild(sprite);
      this.particles.push({ sprite, velocity, lifetime: 0, maxLifetime: 0.8 + Math.random() * 0.4 });
    }
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.lifetime += dt;
      if (particle.lifetime >= particle.maxLifetime) {
        this.container.removeChild(particle.sprite);
        particle.sprite.destroy();
        this.particles.splice(i, 1);
        continue;
      }

      particle.sprite.x += particle.velocity.x * dt;
      particle.sprite.y += particle.velocity.y * dt;
      const progress = particle.lifetime / particle.maxLifetime;
      particle.sprite.alpha = 1 - progress;
      const scale = 1 + progress * 0.4;
      particle.sprite.scale.set(scale);
    }
  }
}
