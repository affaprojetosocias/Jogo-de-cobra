import { Container, Filter, Graphics } from 'pixi.js';
import type { UniformGroup } from 'pixi.js';

const DEFAULT_VERTEX = /* glsl */ `
  in vec2 aPosition;
  out vec2 vTextureCoord;

  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;

    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
  }

  vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
  }

  void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
  }
`;

/**
 * Fundo animado com gradiente din\u00e2mico.
 */
export class Background {
  public readonly container = new Container();
  private readonly gradient: Graphics;
  private readonly filter: Filter;
  private readonly timeUniform: UniformGroup<{ uTime: { type: 'f32'; value: number } }>;
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

    this.filter = Filter.from({
      gl: { vertex: DEFAULT_VERTEX, fragment },
      resources: {
        uTime: { type: 'f32', value: 0 }
      }
    });
    this.timeUniform = this.filter.resources.uTime as UniformGroup<{
      uTime: { type: 'f32'; value: number };
    }>;
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
    this.timeUniform.uniforms.uTime = this.time;
    this.timeUniform.update();
  }
}
