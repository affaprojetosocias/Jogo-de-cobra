import { GameEngine } from './core/GameEngine';

const appElement = document.getElementById('app');

if (!appElement) {
  throw new Error('Elemento raiz #app n\u00e3o encontrado.');
}

const engine = new GameEngine(appElement);
engine.start();
