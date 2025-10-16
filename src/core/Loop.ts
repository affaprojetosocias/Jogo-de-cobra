/**
 * Controla o loop principal usando requestAnimationFrame e calcula delta time.
 */
export class Loop {
  private rafId: number | null = null;
  private lastTime = 0;
  private running = false;

  constructor(private readonly onUpdate: (deltaSeconds: number) => void) {}

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const tick = (time: number) => {
      if (!this.running) return;
      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;
      this.onUpdate(Math.min(delta, 0.1));
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.running = false;
    this.rafId = null;
  }
}
