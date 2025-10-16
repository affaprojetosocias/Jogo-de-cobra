import { GameEngine } from './core/GameEngine';

async function bootstrap() {
  const appElement = document.getElementById('app');

  if (!appElement) {
    throw new Error('Elemento raiz #app não encontrado.');
  }

  try {
    const engine = await GameEngine.create(appElement);
    engine.start();
  } catch (error) {
    console.error('Falha ao iniciar o jogo', error);
  }
}

bootstrap();
