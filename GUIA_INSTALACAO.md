"# 🚀 GUIA DE INSTALAÇÃO - SISTEMA DE AUTENTICAÇÃO

## 📋 PRÉ-REQUISITOS

- SQL Server instalado e rodando
- Python 3.8+
- Node.js e npm/yarn
- Projeto TFG1.2 clonado

---

## 🗄️ PASSO 1: CONFIGURAR BANCO DE DADOS

### 1.1 Abrir SQL Server Management Studio

### 1.2 Executar o script SQL
1. Abra o arquivo: `backend/create_users_table.sql`
2. Execute o script completo (F5)
3. Verifique se aparecem as mensagens de sucesso

**OU execute manualmente:**
```sql
CREATE DATABASE recomendador;
GO

USE recomendador;
GO

CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO
```

---

## 🐍 PASSO 2: INSTALAR DEPENDÊNCIAS PYTHON

### 2.1 Navegue até a pasta backend
```bash
cd C:\Users\alexc\Desktop\TFG1.2-react\backend
```

### 2.2 Instale as novas dependências
```bash
pip install -r requirements_auth.txt
```

**OU instale manualmente:**
```bash
pip install bcrypt==4.1.2
pip install PyJWT==2.8.0
pip install pyodbc==5.0.1
pip install python-dotenv==1.0.0
```

### 2.3 Teste a conexão com o banco
```bash
python database.py
```

**Deve aparecer:** `✅ Conexão com SQL Server OK!`

---

## 📁 PASSO 3: COPIAR ARQUIVOS PARA O PROJETO

### 3.1 Backend - Copie estes arquivos:

**NOVOS ARQUIVOS:**
- `backend/database.py` → Módulo de conexão
- `backend/blueprints/auth.py` → Blueprint de autenticação
- `backend/create_users_table.sql` → Script SQL

**SUBSTITUA:**
- `backend/__init__.py` → Use a versão `__init___UPDATED.py`

### 3.2 Frontend - Crie a pasta auth:

```bash
mkdir frontend\src\components\auth
```

**Copie:**
- `frontend/src/components/auth/LoginPage.js`
- `frontend/src/components/auth/RegisterPage.js`

**SUBSTITUA:**
- `frontend/src/App.js` → Use a versão `App_UPDATED.js` (renomeie para App.js)

### 3.3 (OPCIONAL) Atualizar HomePage:
- `frontend/src/components/home/HomePage.js` → Use `HomePage_UPDATED.js` se quiser o botão de login

---

## ⚙️ PASSO 4: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 4.1 Criar arquivo `.env` na raiz do backend

```bash
cd backend
type nul > .env
```

### 4.2 Adicionar no arquivo `.env`:

```env
# Banco de Dados SQL Server
DB_SERVER=localhost
DB_NAME=recomendador
DB_DRIVER={SQL Server}
USE_WINDOWS_AUTH=true

# JWT Secret Key (MUDE ISSO EM PRODUÇÃO!)
JWT_SECRET_KEY=sua-chave-secreta-super-segura-aqui-12345
```

**Se usar usuário e senha SQL Server (ao invés de Windows Auth):**
```env
USE_WINDOWS_AUTH=false
DB_USER=sa
DB_PASSWORD=sua_senha_aqui
```

---

## 🚀 PASSO 5: TESTAR O SISTEMA

### 5.1 Inicie o backend
```bash
cd C:\Users\alexc\Desktop\TFG1.2-react
python run.py
```

**Deve aparecer:**
```
>>> Aplicação Flask criada e pronta para rodar. <<<
✅ Blueprint de autenticação registrado em /api/auth
```

### 5.2 Inicie o frontend (em outro terminal)
```bash
cd frontend
npm start
```

### 5.3 Teste as rotas de autenticação

**Abra o navegador e teste:**
- `http://localhost:5000/api/auth/register` (POST)
- `http://localhost:5000/api/auth/login` (POST)

**OU use o Postman/Insomnia:**

**Teste Registro:**
```json
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  \"name\": \"Teste Usuario\",
  \"email\": \"teste@email.com\",
  \"password\": \"senha123\"
}
```

**Teste Login:**
```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  \"email\": \"teste@email.com\",
  \"password\": \"senha123\"
}
```

---

## 🎨 PASSO 6: TESTAR NO FRONTEND

1. Abra `http://localhost:3000`
2. Clique em \"Entrar / Cadastrar\" no canto superior direito
3. Crie uma conta
4. Faça login
5. Veja se seu nome aparece no botão

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] SQL Server rodando
- [ ] Database `recomendador` criado
- [ ] Tabela `users` criada
- [ ] Dependências Python instaladas
- [ ] Arquivo `.env` configurado
- [ ] `python database.py` retorna sucesso
- [ ] Arquivos copiados para o projeto
- [ ] Backend iniciando sem erros
- [ ] Frontend compilando sem erros
- [ ] Consegue acessar página de registro
- [ ] Consegue criar uma conta
- [ ] Consegue fazer login

---

## 🐛 SOLUÇÃO DE PROBLEMAS COMUNS

### Erro: \"pyodbc.Error: Can't open lib 'SQL Server'\"
**Solução:** Instale o driver ODBC:
https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

### Erro: \"Login failed for user\"
**Solução:** Verifique as credenciais no `.env` ou use Windows Authentication

### Erro: \"Cannot connect to SQL Server\"
**Solução:** 
1. Verifique se o SQL Server está rodando
2. Verifique o nome do servidor no `.env`
3. Teste com SQL Server Management Studio primeiro

### Erro: \"Module 'bcrypt' not found\"
**Solução:** 
```bash
pip install bcrypt
```

### Frontend não encontra `/api/auth/register`
**Solução:** Verifique se:
1. Backend está rodando na porta 5000
2. `proxy` no package.json está configurado: `\"proxy\": \"http://localhost:5000\"`
3. Blueprint foi registrado corretamente no `__init__.py`

---

## 📞 PRÓXIMOS PASSOS

Depois de tudo funcionando:

1. **Proteger rotas:** Adicionar middleware JWT para rotas protegidas
2. **Migrar dados:** Mover CSV/Parquet para SQL Server
3. **Histórico de usuário:** Criar tabela de interações
4. **Perfil de usuário:** Página de configurações
5. **Recuperação de senha:** Sistema de reset via email

---

## 🔒 SEGURANÇA

**IMPORTANTE ANTES DE FAZER DEPLOY:**

1. Mude a `JWT_SECRET_KEY` para algo mais seguro
2. Use HTTPS em produção
3. Configure CORS adequadamente
4. Use variáveis de ambiente reais (não commitadas no git)
5. Implemente rate limiting
6. Adicione validação de email

---

**Qualquer dúvida, consulte os comentários nos arquivos criados!** 🎉
"