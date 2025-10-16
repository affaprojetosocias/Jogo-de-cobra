import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Snake } from '../entities/Snake';

interface RankingEntry {
  snake: Snake;
  bar: Graphics;
  label: Text;
}

/**
 * HUD respons\u00e1vel por pontua\u00e7\u00f5es, ranking e barras de progresso.
 */
export class Hud {
  public readonly container: Container;
  private readonly scoreText: Text;
  private readonly rankingTitle: Text;
  private readonly rankingEntries: RankingEntry[];
  private readonly background: Graphics;

  private width: number;

  constructor() {
    this.container = new Container();
    this.background = new Graphics();
    this.container.addChild(this.background);
    this.rankingEntries = [];
    this.width = 0;

    this.scoreText = new Text({
      text: 'Score: 0',
      style: new TextStyle({
        fill: '#ffffff',
        fontSize: 24,
        fontFamily: 'Segoe UI',
        dropShadow: {
          color: '#0ff',
          blur: 4,
          alpha: 0.6,
          distance: 4
        }
      })
    });
    this.scoreText.position.set(20, 20);
    this.container.addChild(this.scoreText);

    this.rankingTitle = new Text({
      text: 'Ranking',
      style: new TextStyle({
        fill: '#ffffff',
        fontSize: 18,
        fontFamily: 'Segoe UI',
        letterSpacing: 1,
        dropShadow: {
          color: '#0ff',
          blur: 3,
          alpha: 0.5,
          distance: 4
        }
      })
    });
    this.rankingTitle.position.set(20, 60);
    this.container.addChild(this.rankingTitle);
  }

  resize(width: number) {
    this.width = width;
    this.background.clear();
    const hudWidth = Math.max(180, Math.min(320, width - 20));
    this.background.beginFill(0x000000, 0.35);
    this.background.drawRoundedRect(10, 10, hudWidth, 180, 16);
    this.background.endFill();
  }

  update(snakes: Snake[], player: Snake) {
    this.scoreText.text = `Score: ${player.score.toString().padStart(4, '0')}`;

    const sorted = [...snakes].sort((a, b) => b.lengthScore - a.lengthScore);
    const maxLength = sorted[0]?.lengthScore ?? 1;

    while (this.rankingEntries.length < sorted.length) {
      const bar = new Graphics();
      const label = new Text({
        text: '',
        style: new TextStyle({
          fill: '#e0f7ff',
          fontSize: 14,
          fontFamily: 'Segoe UI',
          dropShadow: {
            color: '#0ff',
            blur: 4,
            distance: 0,
            alpha: 0.5
          }
        })
      });
      this.container.addChild(bar);
      this.container.addChild(label);
      this.rankingEntries.push({ snake: player, bar, label });
    }

    for (let i = 0; i < this.rankingEntries.length; i += 1) {
      const entry = this.rankingEntries[i];
      const snake = sorted[i];
      if (!snake) {
        entry.bar.visible = false;
        entry.label.visible = false;
        continue;
      }
      entry.snake = snake;
      entry.bar.visible = true;
      entry.label.visible = true;

      const progress = snake.lengthScore / maxLength;
      const maxWidth = Math.max(140, Math.min(280, this.width - 60));
      const width = maxWidth * progress;
      const baseY = 90 + i * 28;

      entry.bar.clear();
      entry.bar.beginFill(snake === player ? 0x00ffff : 0xff00ff, 0.2);
      entry.bar.drawRoundedRect(20, baseY, maxWidth, 18, 9);
      entry.bar.endFill();
      entry.bar.beginFill(snake === player ? 0x00ffff : 0xff00ff, 0.8);
      entry.bar.drawRoundedRect(20, baseY, Math.max(6, width), 18, 9);
      entry.bar.endFill();

      entry.label.text = `${i + 1}. ${snake.name}`;
      entry.label.position.set(28, baseY + 2);
    }
  }
}
