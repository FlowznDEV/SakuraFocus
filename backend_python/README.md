# 🚀 Backend Python (FastAPI + Supabase) com Clean Architecture e Segurança Avançada

Este repositório contém a arquitetura de backend Python completa para integração com o **Supabase**, utilizando **FastAPI**, **Pydantic v2**, a biblioteca oficial `supabase` e validação de tokens JWT do **Supabase Auth**.

---

## 🛡️ Regras de Segurança Implementadas (Senior Architecture)

1. **Service Role Key Isolada no Servidor**: A `SUPABASE_SERVICE_ROLE_KEY` é lida apenas pelo processo Python no backend e NUNCA enviada ao navegador ou ao cliente.
2. **Uso da Anon Key no Frontend**: O aplicativo cliente React interage estritamente utilizando a `VITE_SUPABASE_ANON_KEY`.
3. **Validação de Token JWT**: Todas as rotas administrativas e CRUD no FastAPI utilizam a injeção de dependência `get_current_user` em `security.py`, que valida o token Bearer do Supabase Auth e extrai com segurança o `user_id`.
4. **Row Level Security (RLS)**: O banco PostgreSQL possui RLS ativado em todas as tabelas (`profiles`, `user_tasks`, `user_stats`, `user_badges`, `focus_sessions`), garantindo a política `auth.uid() = user_id`.
5. **Sem Credenciais Hardcoded**: Leitura estrita via variáveis de ambiente (`os.getenv`).

---

## 📁 Estrutura do Projeto Python (Clean Architecture)

```
backend_python/
├── config.py             # Configurações centralizadas e leitura das variáveis (.env)
├── supabase_client.py    # Fábrica do cliente administrativo Supabase (Service Role)
├── security.py           # Middleware/Injeção de Dependência para verificação de JWT do Supabase Auth
├── schemas.py            # DTOs Pydantic (TaskCreate, TaskUpdate, TaskResponse, APIResponse)
├── routers/
│   └── tasks.py          # Rotas REST CRUD completas (GET, POST, PUT, DELETE) com auth
├── main.py               # Servidor FastAPI principal, CORS e Tratamento Global de Erros
├── requirements.txt      # Dependências do projeto (fastapi, uvicorn, supabase, pydantic)
└── README.md             # Documentação técnica e guia de execução
```

---

## 🔑 Variáveis de Ambiente Necessárias (`.env`)

```env
# URL do seu projeto Supabase
SUPABASE_URL=https://seu-projeto.supabase.co

# Chave Privada do Servidor (MANTENHA EM SEGREDO ABSOLUTO)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚙️ Como Executar o Backend Python

### 1. Criar ambiente virtual Python e instalar dependências

```bash
cd backend_python
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Iniciar o servidor Uvicorn

```bash
uvicorn main:app --reload --port 8000
```

### 3. Documentação Interativa Swagger UI (OpenAPI)

Acesse no navegador:
- **Swagger**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 📡 Endpoints Disponíveis

| Método | Endpoint | Proteção JWT | Descrição |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | Não | Status de saúde do servidor e checagem de variáveis |
| **GET** | `/api/tasks` | Sim (`Bearer JWT`) | Retorna tarefas pertencentes ao usuário autenticado |
| **GET** | `/api/tasks/{id}` | Sim (`Bearer JWT`) | Retorna detalhes de uma tarefa específica por UUID |
| **POST** | `/api/tasks` | Sim (`Bearer JWT`) | Cria uma nova tarefa atribuída ao usuário |
| **PUT** | `/api/tasks/{id}` | Sim (`Bearer JWT`) | Atualiza campos de uma tarefa existente do usuário |
| **DELETE** | `/api/tasks/{id}` | Sim (`Bearer JWT`) | Deleta uma tarefa do usuário do banco Supabase |
