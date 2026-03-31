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

## Deploy no GitHub Pages

O repositório já está configurado com workflow para deploy automático do frontend.

- Workflow: `.github/workflows/deploy-pages.yml`
- Branch de deploy: `main`
- Diretório publicado: `delivery-web/dist`

### Como ativar no GitHub

1. Acesse `Settings` > `Pages` no repositório.
2. Em `Build and deployment`, selecione `Source: GitHub Actions`.
3. Faça commit e push na branch `main`.
4. Aguarde o workflow `Deploy Frontend to GitHub Pages` finalizar.

### Observações

- O build de Pages ativa `VITE_DELIVERY_MOCK_MODE=true` para o frontend funcionar sem backend.
- O `base` do Vite é ajustado automaticamente para o nome do repositório durante o build do GitHub Actions..
