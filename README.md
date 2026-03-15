## Projeto Sonhário

Aplicação fullstack para registro de sonhos, composta por:

- **Backend**: Node.js + Express + PostgreSQL (Supabase) em `api/`
- **Frontend Web**: React + Vite + TypeScript em `web/`
- (Opcional) **Mobile**: estrutura inicial em `mobile/` (Expo)

Este README descreve como qualquer desenvolvedor pode clonar o repositório, configurar o banco de dados no Supabase e rodar o projeto localmente.

---

## 1. Pré‑requisitos

- **Git**
- **Node.js** (recomendado ≥ 18.x)
- **npm** (vem com o Node)
- Conta no **Supabase** (gratuita)
- Opcional: **DBeaver / TablePlus / psql** para inspecionar o banco

Verifique se o Node está instalado:

```bash
node -v
npm -v
```

---

## 2. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd sonhario
```

> Substitua `<URL_DO_REPOSITORIO>` pela URL HTTPS ou SSH deste projeto.

---

## 3. Configurar o banco de dados (Supabase)

### 3.1 Criar o projeto no Supabase

1. Acesse o painel do Supabase e crie um novo projeto.
2. Anote:
   - **Project URL**
   - **Anon/Publishable key** (para uso futuro no front, se necessário)
   - **Connection string** do banco (PostgreSQL).
3. Em **Project Settings → Database → Connection String → Direct connection**, copie a string `postgresql://...` (ela será usada como `DATABASE_URL`).
4. Em **Project Settings → Database → Password**, veja/reset a **senha do banco** (é a senha usada na URL).

### 3.2 Criar as tabelas necessárias

No painel do Supabase, vá em **SQL Editor**, crie um novo script e execute o SQL abaixo para criar as tabelas que a API espera:

```sql
-- Tabela de usuários
create table if not exists public.usuarios (
  id serial primary key,
  nome text not null,
  email text not null unique,
  senha text not null
);

-- Tabela de registros de sonhos
create table if not exists public.registros (
  id serial primary key,
  id_usuario integer not null references public.usuarios(id) on delete cascade,
  registro text not null,
  criado_em timestamp with time zone not null default now(),
  data_alteracao timestamp with time zone[] not null default array[now()]
);
```

Após executar, você deve ver as tabelas `usuarios` e `registros` no **Table Editor** do Supabase.

---

## 4. Backend (`api/`)

O backend é um servidor Express que faz a ponte entre o front e o banco PostgreSQL hospedado no Supabase.

### 4.1 Instalar dependências

```bash
cd api
npm install
```

> As principais dependências incluem: `express`, `pg`, `dotenv`, `cors`, `bcrypt`, `jsonwebtoken`, `morgan`, `nodemailer`.

### 4.2 Configurar variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `api/` com o seguinte formato (exemplo):

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.SEUPROJETO.supabase.co:5432/postgres
PORT=3000
JWT_SECRET=um-segredo-bem-forte-aqui

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS='sua-senha-de-app-ou-token'
```

Notas importantes:

- **DATABASE_URL**: copie exatamente a `Direct connection string` do Supabase e apenas substitua `[YOUR-PASSWORD]` pela senha real do banco.
- Se a senha tiver caracteres especiais (`@`, `$`, `!`, etc.), normalmente o Supabase já traz a URL com **URL encode** aplicado (ex.: `@` → `%40`). Não altere.
- **JWT_SECRET**: pode ser qualquer string longa e difícil de adivinhar.
- As variáveis de e‑mail são usadas para envio de reset de senha. Se não quiser enviar e‑mail em desenvolvimento, pode manter valores falsos e adaptar o código.

### 4.3 Rodar o backend em desenvolvimento

Ainda dentro de `api/`:

```bash
npm run dev
```

O servidor sobe por padrão em `http://localhost:3000`.  
Exemplos de rotas:

- `POST /usuarios/registrar` – cria usuário
- `POST /usuarios/login` – login com JWT
- `GET /usuarios` – lista usuários (para testes)
- `POST /registros` – cria registro (autenticado)
- `GET /registros` – lista registros (autenticado)

---

## 5. Frontend Web (`web/`)

Aplicação React + Vite + TypeScript, responsável pela interface web.

### 5.1 Instalar dependências

```bash
cd web
npm install
```

Principais libs:

- `react`, `react-dom`, `react-router-dom`
- `bootstrap`, `reactstrap`
- `axios`

Certifique‑se de que o CSS global do Bootstrap está sendo importado em `main.tsx`:

```ts
import "bootstrap/dist/css/bootstrap.min.css";
```

### 5.2 Rodar o frontend em desenvolvimento

Na pasta `web/`:

```bash
npm run dev
```

O Vite normalmente sobe em `http://localhost:5173` (a porta exata aparece no terminal).  
Certifique‑se de que as URLs que o front usa para chamar a API apontam para `http://localhost:3000` (ou para a porta que você configurou no backend).

---

## 6. Rodando tudo junto

Em terminais separados:

1. **Backend**:
   ```bash
   cd api
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd web
   npm run dev
   ```

Acesse a aplicação web no navegador (porta do Vite) e certifique‑se de que o backend está ativo para que login, cadastro e registros funcionem.

---

## 7. Acesso ao banco via Workbench (opcional)

Se quiser acessar o banco do Supabase via DBeaver ou outro cliente PostgreSQL, use os dados da conexão direta (`Direct connection`):

- **Host**: `db.SEUPROJETO.supabase.co`
- **Porta**: `5432`
- **Database**: `postgres`
- **Usuário**: `postgres`
- **Senha**: senha do banco (mesma da `DATABASE_URL`)
- **SSL**: habilitado (`sslmode=require` ou equivalente)

No DBeaver, crie uma nova conexão PostgreSQL, preencha os campos acima, habilite SSL e teste a conexão.

---

## 8. Dicas rápidas de terminal (Windows)

- `cd nome-da-pasta` – acessar diretório.
- `code .` – abrir pasta atual no VS Code / Cursor.
- `node -v` – verificar versão do Node.
- `npm install` – instalar dependências.
- `npm run dev` – rodar projeto em modo desenvolvimento (backend ou frontend, dependendo da pasta).

---
