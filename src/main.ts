import { GameEngine } from './core/GameEngine';

async function start() {
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Elemento #app não encontrado');
  }

  const engine = await GameEngine.bootstrap(container);
  engine.start();
}

start().catch((error) => {
  console.error('Falha ao iniciar o jogo', error);
});
