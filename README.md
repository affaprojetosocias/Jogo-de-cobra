# Snake.io+ 🐍

Um protótipo moderno do jogo Snake.io feito com TypeScript, Vite e Pixi.js.

## Requisitos
- Node.js 18 ou superior
- npm 9 ou superior

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em [http://localhost:5173](http://localhost:5173).

## Build de produção

```bash
npm run build
```

## Preview da build

```bash
npm run preview
```

## Geração deste README

```bash
npm run generate:readme
```

## Estrutura do projeto

- `src/core`: loop do jogo, motor e serviços compartilhados
- `src/entities`: entidades principais (cobras e comidas)
- `src/systems`: sistemas de entrada, IA, som e colisões
- `src/ui`: componentes de interface e HUD

## Controles

- `A` ou ←: girar para a esquerda
- `D` ou →: girar para a direita
- Toque/arraste no mobile: acompanha a direção do dedo

Aproveite para expandir este protótipo para multiplayer real usando WebSockets ou Supabase Realtime!
