import { Container, Filter, Graphics } from 'pixi.js';

/**
 * Fundo animado com gradiente din\u00e2mico.
 */
export class Background {
  public readonly container = new Container();
  private readonly gradient: Graphics;
  private readonly filter: Filter;
  private time = 0;

  constructor(width: number, height: number) {
    this.gradient = new Graphics();
    this.gradient.beginFill(0x000000, 1);
    this.gradient.drawRect(0, 0, width, height);
    this.gradient.endFill();
    this.container.addChild(this.gradient);

    const fragment = /* glsl */ `
      precision mediump float;
      varying vec2 vTextureCoord;
      uniform float uTime;
      void main() {
        vec2 uv = vTextureCoord;
        float wave = sin((uv.x + uTime * 0.05) * 6.2831) * 0.05;
        float gradient = uv.y + wave;
        vec3 top = vec3(0.02, 0.04, 0.1);
        vec3 mid = vec3(0.0, 0.5, 0.7);
        vec3 accent = vec3(0.7, 0.2, 1.0);
        vec3 base = mix(top, mid, smoothstep(0.0, 1.0, gradient));
        float pulse = 0.35 + 0.35 * sin(uTime * 0.5);
        base += accent * pulse * 0.25;
        gl_FragColor = vec4(base, 1.0);
      }
    `;

    this.filter = new Filter(undefined, fragment, { uTime: 0 });
    this.gradient.filters = [this.filter];
  }

  resize(width: number, height: number) {
    this.gradient.clear();
    this.gradient.beginFill(0x000000, 1);
    this.gradient.drawRect(0, 0, width, height);
    this.gradient.endFill();
  }

  update(delta: number) {
    this.time += delta;
    this.filter.uniforms.uTime = this.time;
  }
}
