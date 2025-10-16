import { Point } from 'pixi.js';
import type { Snake } from '../entities/Snake';

/**
 * Traduz entradas de teclado e ponteiro para comandos de curva da cobra.
 */
export class InputSystem {
  private readonly element: HTMLElement;
  private readonly player: Snake;

  private turnLeft = false;
  private turnRight = false;

  private pointerActive = false;
  private pointerPosition = new Point();

  private readonly keyDownListener: (event: KeyboardEvent) => void;
  private readonly keyUpListener: (event: KeyboardEvent) => void;
  private readonly pointerDownListener: (event: PointerEvent) => void;
  private readonly pointerMoveListener: (event: PointerEvent) => void;
  private readonly pointerUpListener: () => void;
  private readonly blurListener: () => void;

  constructor(element: HTMLElement, player: Snake) {
    this.element = element;
    this.player = player;

    this.keyDownListener = (event) => this.handleKeyDown(event);
    this.keyUpListener = (event) => this.handleKeyUp(event);
    this.pointerDownListener = (event) => this.handlePointerDown(event);
    this.pointerMoveListener = (event) => this.handlePointerMove(event);
    this.pointerUpListener = () => this.handlePointerUp();
    this.blurListener = () => this.reset();

    window.addEventListener('keydown', this.keyDownListener);
    window.addEventListener('keyup', this.keyUpListener);
    window.addEventListener('pointerup', this.pointerUpListener);
    window.addEventListener('blur', this.blurListener);
    this.element.addEventListener('pointerdown', this.pointerDownListener);
    this.element.addEventListener('pointermove', this.pointerMoveListener);
  }

  destroy() {
    window.removeEventListener('keydown', this.keyDownListener);
    window.removeEventListener('keyup', this.keyUpListener);
    window.removeEventListener('pointerup', this.pointerUpListener);
    window.removeEventListener('blur', this.blurListener);
    this.element.removeEventListener('pointerdown', this.pointerDownListener);
    this.element.removeEventListener('pointermove', this.pointerMoveListener);
  }

  update() {
    if (!this.player.alive) {
      this.player.setTurnInput(0);
      return;
    }

    let turn = 0;
    if (this.turnLeft) turn -= 1;
    if (this.turnRight) turn += 1;

    if (this.pointerActive) {
      const rect = this.element.getBoundingClientRect();
      const center = rect.width / 2;
      const offset = (this.pointerPosition.x - center) / center;
      turn += Math.max(-1, Math.min(1, offset));
    }

    this.player.setTurnInput(turn);
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

  private reset() {
    this.turnLeft = false;
    this.turnRight = false;
    this.pointerActive = false;
    this.player.setTurnInput(0);
  }
}
