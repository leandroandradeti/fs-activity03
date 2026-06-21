# TODO - Projeto Eventos (React + Node + SQLite)

- [ ] Criar estrutura de pastas: `backend/` e `frontend/`
- [ ] Inicializar `backend` (npm init) e instalar dependências (express, cors, jsonwebtoken, better-sqlite3, bcryptjs, zod/cors etc.)
- [x] Criar banco SQLite e migrations/tabelas: `users`, `events`, `event_inscriptions`
- [x] Implementar autenticação:
  - [x] Cadastro (`/auth/register`)
  - [x] Login (`/auth/login`)
  - [x] Middleware JWT + verificação de role
- [x] Implementar APIs de eventos (CRUD do organizador + catálogo público)
- [x] Implementar APIs de inscrições (inscrever/cancelar + minhas inscrições + ver inscritos por evento)
- [x] Implementar regras de acesso (organizador só mexe em próprios eventos; participante não edita; vagas)

- [ ] Inicializar `frontend` (Vite + React) e instalar dependências
- [ ] Implementar tela de login/cadastro
- [ ] Implementar tela Organizador (CRUD eventos + inscritos)
- [ ] Implementar tela Participante (catalogo + filtros + detalhes + inscrição/cancelamento)
- [ ] Configurar proxy/URL do backend no front
- [ ] Rodar localmente e ajustar CORS
- [ ] Testar fluxos principais (cadastro/login; criar evento; inscrever; cancelar; listar)

