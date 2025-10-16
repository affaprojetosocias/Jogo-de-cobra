import { Container, Graphics, Point } from 'pixi.js';

interface Particle {
  sprite: Graphics;
  velocity: Point;
  life: number;
  maxLife: number;
}

/**
 * Sistema simples para explos\u00f5es de part\u00edculas e efeitos atmosf\u00e9ricos.
 */
export class ParticleSystem {
  public readonly container: Container;
  private readonly particles: Particle[];

  constructor() {
    this.container = new Container();
    this.particles = [];
  }

  update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      particle.life -= delta;
      if (particle.life <= 0) {
        particle.sprite.destroy();
        this.particles.splice(i, 1);
        continue;
      }

      particle.sprite.position.x += particle.velocity.x * delta;
      particle.sprite.position.y += particle.velocity.y * delta;
      const progress = particle.life / particle.maxLife;
      particle.sprite.alpha = progress;
      particle.sprite.scale.set(0.5 + 0.5 * progress);
    }
  }

  spawnExplosion(position: Point, color: number) {
    const count = 24;
    for (let i = 0; i < count; i += 1) {
      const sprite = new Graphics();
      sprite.beginFill(color, 1);
      sprite.drawCircle(0, 0, 4 + Math.random() * 4);
      sprite.endFill();
      sprite.position.copyFrom(position);

      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 220;
      const velocity = new Point(Math.cos(angle) * speed, Math.sin(angle) * speed);
      const life = 0.6 + Math.random() * 0.7;

      this.container.addChild(sprite);
      this.particles.push({ sprite, velocity, life, maxLife: life });
    }
  }

  spawnAmbient(width: number, height: number, color: number) {
    const sprite = new Graphics();
    sprite.beginFill(color, 0.08);
    sprite.drawCircle(0, 0, 3 + Math.random() * 6);
    sprite.endFill();
    sprite.position.set(Math.random() * width, Math.random() * height);
    const angle = Math.random() * Math.PI * 2;
    const speed = 5 + Math.random() * 10;
    const velocity = new Point(Math.cos(angle) * speed, Math.sin(angle) * speed);
    const life = 4 + Math.random() * 6;

    this.container.addChild(sprite);
    this.particles.push({ sprite, velocity, life, maxLife: life });
  }
}
