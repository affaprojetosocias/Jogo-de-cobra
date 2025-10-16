import { Application, Container } from 'pixi.js';

/**
 * Encapsula a instância do PixiJS Application e responsável por resize responsivo.
 */
export class Renderer {
  public readonly app: Application;

  /**
   * Prefer {@link Renderer.create} so that the Pixi application is fully initialised
   * before consumers interact with it.
   */
  constructor(private readonly mount: HTMLElement, app: Application) {
    this.app = app;
    this.mount.appendChild(this.app.canvas as HTMLCanvasElement);
  }

  static async create(mount: HTMLElement): Promise<Renderer> {
    const app = new Application();
    await app.init({
      resizeTo: mount,
      backgroundAlpha: 0,
      antialias: true,
      powerPreference: 'high-performance'
    });

    return new Renderer(mount, app);
  }

  get stage(): Container {
    return this.app.stage;
  }

  get screen() {
    return this.app.screen;
  }

  get view(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement;
  }

  destroy() {
    this.app.destroy();
    this.mount.innerHTML = '';
  }
}
