import { Container, Text } from 'pixi.js';

/**
 * Exibe o placar atual do jogador.
 */
export class ScoreBoard {
  public readonly container: Container;
  private readonly scoreText: Text;

  constructor() {
    this.container = new Container();
    this.scoreText = new Text('Score: 0', {
      fontFamily: 'Orbitron',
      fontSize: 20,
      fill: 0xffffff,
      dropShadow: true,
      dropShadowColor: '#00f7ff',
      dropShadowDistance: 2
    });
    this.scoreText.position.set(16, 16);
    this.container.addChild(this.scoreText);
  }

  update(score: number) {
    this.scoreText.text = `Score: ${Math.floor(score)}`;
  }
}
