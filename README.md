# fs-activity03 — Sistema de Eventos (React + Node + SQLite)

## Requisitos

- Node.js 18+ (no Windows)
- npm

## Como iniciar (automático)

O projeto roda **backend** na **4190** e **frontend** na **5390**.

1) Abra um terminal na pasta do projeto e execute:

```bat
cd c:/Users/ADM/Documents/GitHub/fs-activity03
start.bat
```

O `start.bat`:

- encerra processos que estejam usando as portas 4190/5390 (se houver)
- inicia o backend e o frontend

## Endpoints do backend

Backend: <http://localhost:4190>

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

O arquivo `backend/src/app.rest` tem exemplos prontos.

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

1) Acesse o frontend: <http://localhost:5390>
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
