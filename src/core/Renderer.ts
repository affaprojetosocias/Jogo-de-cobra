import { Application, Container } from 'pixi.js';

/**
 * Encapsula a instancia do PixiJS Application e respons\u00e1vel por resize responsivo.
 */
export class Renderer {
  public readonly app: Application;

  constructor(private readonly mount: HTMLElement) {
    this.app = new Application({
      resizeTo: mount,
      backgroundAlpha: 0,
      antialias: true,
      powerPreference: 'high-performance'
    });

    mount.appendChild(this.app.view as HTMLCanvasElement);
  }

  get stage(): Container {
    return this.app.stage;
  }

  get screen() {
    return this.app.screen;
  }

  destroy() {
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
    this.mount.innerHTML = '';
  }
}
