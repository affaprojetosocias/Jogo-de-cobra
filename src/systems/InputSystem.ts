import type { Snake } from '../entities/Snake';

/**
 * Gerencia entrada do jogador através do teclado e converte em mudanças de direção.
 */
export class InputSystem {
  private readonly pressed = new Set<string>();

  constructor(private readonly player: Snake) {}

  initialize() {
    window.addEventListener('keydown', (event) => this.pressed.add(event.code));
    window.addEventListener('keyup', (event) => this.pressed.delete(event.code));
  }

  update(dt: number) {
    if (!this.player.alive) return;

    let directionChange = 0;
    if (this.pressed.has('ArrowLeft') || this.pressed.has('KeyA')) {
      directionChange -= this.player.turnSpeed * dt;
    }
    if (this.pressed.has('ArrowRight') || this.pressed.has('KeyD')) {
      directionChange += this.player.turnSpeed * dt;
    }

    if (directionChange !== 0) {
      this.player.direction += directionChange;
    }
  }
}
