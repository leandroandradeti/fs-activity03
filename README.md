# fs-activity03 — Sistema de Eventos (React + Node + SQLite)

## Requisitos

- Node.js 18+ (no Windows)
- npm

## Como iniciar (automático)

O projeto roda o backend na porta 5191 e o frontend na porta 5391.

1) Abra um terminal na pasta do projeto e execute:

```bat
cd c:/Users/ADM/Documents/GitHub/fs-activity03
start.bat
```

O `start.bat`:

- encerra processos que estejam usando as portas 5191/5391 (se houver)
- inicia o backend e o frontend

## Estrutura do projeto

### Visão geral da arquitetura

```text
Usuário / Navegador
        │
        ▼
Frontend (React + Vite)
        │
        │ HTTP / JSON
        ▼
Backend (Express + Node.js)
        │
        │ SQLite
        ▼
backend/data/database.sqlite
```

### Pasta principal

- `backend/`: aplicação Node.js + Express + SQLite
- `frontend/`: aplicação React + Vite
- `start.bat`: script para iniciar backend e frontend

### Backend

Localização principal:

- `backend/src/server.js`: ponto de entrada do servidor Express
- `backend/src/routes/`: rotas da API
  - `auth.js`: login, cadastro e consulta do usuário autenticado
  - `events.js`: catálogo público, eventos do organizador e inscrições
- `backend/src/middleware/`: middlewares
  - `auth.js`: autenticação via JWT
  - `errorHandler.js`: tratamento de erros
- `backend/src/bootstrap.js`: inicialização do banco e dados base
- `backend/src/db.js`: conexão e acesso ao SQLite
- `backend/data/database.sqlite`: arquivo do banco de dados SQLite
- `backend/src/app.rest`: exemplos de requisições HTTP

### Frontend

Localização principal:

- `frontend/src/App.jsx`: componente principal da aplicação
- `frontend/src/main.jsx`: entrada do React
- `frontend/src/components/`: telas e componentes visuais
  - `Login.jsx`: tela de login/cadastro
  - `OrganizerHome.jsx`: painel do organizador
  - `ParticipantHome.jsx`: painel do participante
- `frontend/src/components/organizer/`: telas específicas do organizador
- `frontend/src/components/participant/`: telas específicas do participante
- `frontend/src/lib/auth.js`: funções para salvar token e chamar a API
- `frontend/src/styles.css`: estilos globais

## Banco de dados

O banco fica em:

- `backend/data/database.sqlite`

Ele é criado/atualizado automaticamente ao iniciar o backend via `bootstrap.js`.

## Rotas do backend

Backend: <http://localhost:5191>

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /events` (catálogo público)
- `GET /organizer/events` (organizador)
- `POST /organizer/events` (organizador)
- `PUT /organizer/events/:id`
- `DELETE /organizer/events/:id`
- `POST /events/:id/inscriptions`
- `DELETE /events/:id/inscriptions`
- `GET /me/inscriptions`
- `GET /organizer/events/:id/inscriptions`

## Login de teste (rápido)

A UI permite cadastrar, mas abaixo vão usuários para testes (use o cadastro e depois login).

### 1) Organizador

- role: `ORGANIZADOR`
- email: `org@test.com`
- senha: `1234`

### 2) Participante

- role: `PARTICIPANTE`
- email: `part@test.com`
- senha: `1234`

> Observação: por padrão o backend valida role. Se esses usuários ainda não existirem no seu SQLite local, crie-os via tela de cadastro.

## Fluxo básico no app

1) Acesse o frontend: <http://localhost:5391>
2) Faça login como **Organizador**:
   - crie eventos (CRUD)
   - depois selecione um evento e veja a lista de inscritos
3) Faça login como **Participante**:
   - veja catálogo e detalhes
   - inscreva/cancele
   - veja “Minhas inscrições”

## Observações sobre o papel (regras)

- Participante não consegue criar/editar/excluir eventos.
- Organizador só edita/exclui eventos que ele criou.
- Inscrição respeita limite de vagas.
