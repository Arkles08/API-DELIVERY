# Delivery Web

Frontend React para operar a API de delivery.

## Rodar localmente

```bash
npm install
npm run dev
```

## Build para GitHub Pages em /docs

```bash
npm run build:docs
```

Esse comando gera os arquivos estáticos em `../docs` com mock mode ativado.

## Variável de ambiente

- `VITE_API_BASE_URL` aponta para a API FastAPI.
- Padrão no app: `/api/v1`
