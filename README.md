# API de Delivery

Projeto completo de delivery com backend FastAPI e frontend React.

Este workspace está organizado em:

- `api de delivery/`: índice documental do projeto
- `delivery-api/`: backend FastAPI
- `delivery-web/`: frontend React
- `docker-compose.yml`: orquestração dos serviços

## Estrutura

- `delivery-api/`: API FastAPI
- `delivery-web/`: frontend React
- `docker-compose.yml`: sobe os dois serviços juntos

## Subir com Docker

```bash
docker compose up --build
```

## Endpoints e acessos

- Link único do app: `http://localhost:3010`
- API interna do app: `/api/v1`

## Deploy no GitHub Pages por pasta docs

Agora o frontend pode ser publicado diretamente pela pasta `docs` da branch `main`.

### Gerar os arquivos estáticos

1. Entre em `delivery-web`.
2. Execute `npm run build:docs`.
3. O build é gerado em `docs/` (na raiz do repositório).

### Como ativar no GitHub

1. Acesse `Settings` > `Pages` no repositório.
2. Em `Build and deployment`, selecione `Source: Deploy from a branch`.
3. Em `Branch`, selecione `main` e a pasta `/docs`.
4. Salve e faça commit/push do conteúdo atualizado em `docs`.

### Observações

- O comando `build:docs` usa `--mode docs`, que ativa `VITE_DELIVERY_MOCK_MODE=true` via `delivery-web/.env.docs`.
- O build em modo docs usa base relativa (`./`) para funcionar corretamente em subpasta de repositório no Pages.
