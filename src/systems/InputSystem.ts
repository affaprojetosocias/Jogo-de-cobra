import { Point } from 'pixi.js';

/**
 * Captura entrada de teclado e ponteiro para controlar a cobra do jogador.
 */
export class InputSystem {
  private turnLeft = false;
  private turnRight = false;
  private pointerActive = false;
  private pointerPosition = new Point();

  constructor(private readonly element: HTMLElement) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    element.addEventListener('pointerdown', this.onPointerDown);
    element.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('blur', this.resetInput);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    this.element.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('blur', this.resetInput);
  }

  getTurnInput(directionAngle: number, headPosition: Point): number {
    let turn = 0;
    if (this.turnLeft) turn -= 1;
    if (this.turnRight) turn += 1;

    if (this.pointerActive) {
      const dx = this.pointerPosition.x - headPosition.x;
      const dy = this.pointerPosition.y - headPosition.y;
      const pointerAngle = Math.atan2(dy, dx);
      let diff = pointerAngle - directionAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      turn = Math.max(-1, Math.min(1, diff * 2));
    }

    return turn;
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return;
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.turnLeft = true;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.turnRight = true;
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.turnLeft = false;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.turnRight = false;
    }
  };

  private onPointerDown = (event: PointerEvent) => {
    this.pointerActive = true;
    this.updatePointer(event);
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!this.pointerActive) return;
    this.updatePointer(event);
  };

  private onPointerUp = () => {
    this.pointerActive = false;
  };

  private updatePointer(event: PointerEvent) {
    const rect = this.element.getBoundingClientRect();
    this.pointerPosition.set(event.clientX - rect.left, event.clientY - rect.top);
  }

  private resetInput = () => {
    this.turnLeft = false;
    this.turnRight = false;
    this.pointerActive = false;
  };
}
