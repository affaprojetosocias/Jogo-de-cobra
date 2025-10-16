import { Container, Text, TextStyle } from 'pixi.js';

/**
 * Exibe o placar atual do jogador.
 */
export class ScoreBoard {
  public readonly container: Container;
  private readonly scoreText: Text;

  constructor() {
    this.container = new Container();
    this.scoreText = new Text({
      text: 'Score: 0',
      style: new TextStyle({
        fontFamily: 'Orbitron',
        fontSize: 20,
        fill: 0xffffff,
        dropShadow: {
          color: '#00f7ff',
          blur: 4,
          alpha: 0.8,
          distance: 2
        }
      })
    });
    this.scoreText.position.set(16, 16);
    this.container.addChild(this.scoreText);
  }

  update(score: number) {
    this.scoreText.text = `Score: ${Math.floor(score)}`;
  }
}
