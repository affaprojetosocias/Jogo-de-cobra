import { Container, Graphics, Text } from 'pixi.js';
import type { RankingEntry } from '../core/types';

/**
 * Mostra ranking das cobras com barras de progresso.
 */
export class RankingPanel {
  public readonly container: Container;
  private readonly background: Graphics;
  private readonly entries: Text[] = [];
  private readonly bars: Graphics[] = [];

  constructor() {
    this.container = new Container();
    this.container.position.set(16, 60);

    this.background = new Graphics();
    this.container.addChild(this.background);

    for (let i = 0; i < 4; i++) {
      const text = new Text('', {
        fontFamily: 'Orbitron',
        fontSize: 14,
        fill: 0xffffff,
        align: 'left'
      });
      text.position.set(12, 10 + i * 34);
      this.container.addChild(text);
      this.entries.push(text);

      const bar = new Graphics();
      bar.position.set(12, 28 + i * 34);
      this.container.addChild(bar);
      this.bars.push(bar);
    }

    this.redrawBackground();
  }

  update(ranking: RankingEntry[], maxLength: number) {
    ranking.forEach((entry, index) => {
      const text = this.entries[index];
      const bar = this.bars[index];
      if (!text || !bar) return;

      text.text = `${index + 1}. ${entry.id} - ${entry.score}`;
      const ratio = Math.min(1, entry.length / maxLength);

      bar.clear();
      bar.beginFill(entry.color, 0.2);
      bar.drawRoundedRect(0, 0, 180, 8, 4);
      bar.endFill();

      bar.beginFill(entry.color, 0.9);
      bar.drawRoundedRect(0, 0, 180 * ratio, 8, 4);
      bar.endFill();
    });

    for (let i = ranking.length; i < this.entries.length; i++) {
      this.entries[i].text = '';
      this.bars[i].clear();
    }
  }

  private redrawBackground() {
    this.background.clear();
    this.background.beginFill(0x000000, 0.4);
    this.background.drawRoundedRect(0, 0, 210, 160, 12);
    this.background.endFill();
    this.background.lineStyle(1, 0x00f7ff, 0.8);
    this.background.drawRoundedRect(0, 0, 210, 160, 12);
  }
}
