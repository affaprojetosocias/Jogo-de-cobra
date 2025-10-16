# Snake.io+

Jogo Snake.io+ moderno escrito em TypeScript, renderizado com Pixi.js e empacotado com Vite. O projeto foi estruturado para facilitar evolução para multiplayer em tempo real.

## ✨ Recursos

- Movimento fluido com física baseada em direção e velocidade contínua.
- 3 cobras controladas por IA com personalidades distintas.
- Plano de fundo neon com gradiente dinâmico e partículas flutuantes.
- UI com pontuação, ranking e barra de progresso de crescimento.
- Efeitos sonoros (comer, morte e ambiente).
- Sistema de partículas para explosões na morte das cobras.
- Arquitetura modular organizada em módulos `core`, `entities`, `systems` e `ui`.

## 🧩 Estrutura de pastas

```
src/
  core/         # Motor do jogo, renderização e áudio
  entities/     # Entidades principais (Snake, Food)
  systems/      # Sistemas (input, IA, colisões, partículas)
  ui/           # Componentes da interface (placar, ranking)
```

## 🚀 Como rodar

```bash
npm install
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:5173`.

## 🏗️ Build de produção

```bash
npm run build
npm run preview
```

## 🔊 Controles

- `←` / `A`: vira para a esquerda
- `→` / `D`: vira para a direita

## 🔮 Próximos passos sugeridos

- Integrar comunicação em tempo real via WebSockets ou Supabase Realtime.
- Adicionar matchmaking e sincronia de estado entre clientes.
- Criar personalização avançada de skins e efeitos visuais.
- Implementar painel de configurações (áudio, dificuldade da IA, etc.).

Divirta-se evoluindo o Snake.io+! 🐍
