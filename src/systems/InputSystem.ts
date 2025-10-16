import { Point } from 'pixi.js';

/**
 * Captura entrada de teclado e ponteiro para controlar a cobra do jogador.
 */
export class InputSystem {
  private readonly element: HTMLElement;
  private turnLeft: boolean;
  private turnRight: boolean;
  private pointerActive: boolean;
  private pointerPosition: Point;

  private readonly keyDownListener: (event: KeyboardEvent) => void;
  private readonly keyUpListener: (event: KeyboardEvent) => void;
  private readonly pointerDownListener: (event: PointerEvent) => void;
  private readonly pointerMoveListener: (event: PointerEvent) => void;
  private readonly pointerUpListener: (event: PointerEvent) => void;
  private readonly resetListener: () => void;

  constructor(element: HTMLElement) {
    this.element = element;
    this.turnLeft = false;
    this.turnRight = false;
    this.pointerActive = false;
    this.pointerPosition = new Point();

    this.keyDownListener = this.handleKeyDown.bind(this);
    this.keyUpListener = this.handleKeyUp.bind(this);
    this.pointerDownListener = this.handlePointerDown.bind(this);
    this.pointerMoveListener = this.handlePointerMove.bind(this);
    this.pointerUpListener = this.handlePointerUp.bind(this);
    this.resetListener = this.resetInputState.bind(this);

    window.addEventListener('keydown', this.keyDownListener);
    window.addEventListener('keyup', this.keyUpListener);
    element.addEventListener('pointerdown', this.pointerDownListener);
    element.addEventListener('pointermove', this.pointerMoveListener);
    window.addEventListener('pointerup', this.pointerUpListener);
    window.addEventListener('blur', this.resetListener);
  }

  destroy() {
    window.removeEventListener('keydown', this.keyDownListener);
    window.removeEventListener('keyup', this.keyUpListener);
    this.element.removeEventListener('pointerdown', this.pointerDownListener);
    this.element.removeEventListener('pointermove', this.pointerMoveListener);
    window.removeEventListener('pointerup', this.pointerUpListener);
    window.removeEventListener('blur', this.resetListener);
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

  private handleKeyDown(event: KeyboardEvent) {
    if (event.repeat) return;
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.turnLeft = true;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.turnRight = true;
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.turnLeft = false;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.turnRight = false;
    }
  }

  private handlePointerDown(event: PointerEvent) {
    this.pointerActive = true;
    this.updatePointer(event);
  }

  private handlePointerMove(event: PointerEvent) {
    if (!this.pointerActive) return;
    this.updatePointer(event);
  }

  private handlePointerUp() {
    this.pointerActive = false;
  }

  private updatePointer(event: PointerEvent) {
    const rect = this.element.getBoundingClientRect();
    this.pointerPosition.set(event.clientX - rect.left, event.clientY - rect.top);
  }

  private resetInputState() {
    this.turnLeft = false;
    this.turnRight = false;
    this.pointerActive = false;
  }
}
