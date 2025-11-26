# api-gateway/gateway.py (v5.0 - COM SQL SERVER)
from flask import Flask, request, jsonify
import requests
import os
import bcrypt
import jwt
import datetime
import pyodbc
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# ========================================
# CONFIGURAÇÕES
# ========================================

JWT_SECRET = os.getenv("JWT_SECRET", "secret_key_temporaria_123")

# Configurações do SQL Server
SQL_SERVER = os.getenv("SQL_SERVER", "localhost")
SQL_DATABASE = os.getenv("SQL_DATABASE", "RecomendadorMultimidia")
SQL_USERNAME = os.getenv("SQL_USERNAME", "sa")
SQL_PASSWORD = os.getenv("SQL_PASSWORD", "")
SQL_DRIVER = os.getenv("SQL_DRIVER", "ODBC Driver 17 for SQL Server")

# String de conexão
CONNECTION_STRING = (
    f"DRIVER={{{SQL_DRIVER}}};"
    f"SERVER={SQL_SERVER};"
    f"DATABASE={SQL_DATABASE};"
    f"UID={SQL_USERNAME};"
    f"PWD={SQL_PASSWORD};"
)

# URLs dos microsserviços
GAMES_API_URL = os.getenv("GAMES_API_URL", "http://localhost:5001")
MUSIC_API_URL = os.getenv("MUSIC_API_URL", "http://localhost:5002")
MOVIES_API_URL = os.getenv("MOVIES_API_URL", "http://localhost:5003")

SERVICES = {
    "games": GAMES_API_URL,
    "music": MUSIC_API_URL,
    "movies": MOVIES_API_URL,
}


# ========================================
# FUNÇÕES DE BANCO DE DADOS
# ========================================

def get_db_connection():
    """Cria e retorna conexão com o SQL Server"""
    try:
        conn = pyodbc.connect(CONNECTION_STRING)
        return conn
    except pyodbc.Error as e:
        print(f"[DB] ❌ Erro ao conectar ao SQL Server: {e}")
        raise


def verificar_usuario_existe(email):
    """Verifica se usuário existe no banco"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT COUNT(*) FROM usuarios WHERE email = ?",
            (email,)
        )
        
        count = cursor.fetchone()[0]
        conn.close()
        
        return count > 0
    
    except Exception as e:
        print(f"[DB] ❌ Erro ao verificar usuário: {e}")
        return False


def criar_usuario(nome, email, senha_hash):
    """Insere novo usuário no banco"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            INSERT INTO usuarios (nome, email, senha_hash)
            VALUES (?, ?, ?)
            """,
            (nome, email, senha_hash)
        )
        
        conn.commit()
        conn.close()
        
        print(f"[DB] ✅ Usuário criado: {email}")
        return True
    
    except Exception as e:
        print(f"[DB] ❌ Erro ao criar usuário: {e}")
        return False


def buscar_usuario(email):
    """Busca usuário no banco pelo email"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT id, nome, email, senha_hash
            FROM usuarios
            WHERE email = ?
            """,
            (email,)
        )
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "password_hash": row[3]
            }
        
        return None
    
    except Exception as e:
        print(f"[DB] ❌ Erro ao buscar usuário: {e}")
        return None


def atualizar_ultimo_login(email):
    """Atualiza data/hora do último login"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            UPDATE usuarios
            SET ultimo_login = GETDATE()
            WHERE email = ?
            """,
            (email,)
        )
        
        conn.commit()
        conn.close()
        
        return True
    
    except Exception as e:
        print(f"[DB] ❌ Erro ao atualizar último login: {e}")
        return False


# ========================================
# ROTAS DE AUTENTICAÇÃO
# ========================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Endpoint de registro - salva no SQL Server"""
    try:
        data = request.get_json()
        print(f"[AUTH] Tentativa de registro: {data.get('email')}")
        
        # Validações
        if not data or not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({
                "success": False,
                "error": "Todos os campos são obrigatórios"
            }), 400
        
        email = data['email'].lower().strip()
        name = data['name'].strip()
        password = data['password']
        
        # Validação de senha mínima
        if len(password) < 6:
            return jsonify({
                "success": False,
                "error": "A senha deve ter no mínimo 6 caracteres"
            }), 400
        
        # Verifica se usuário já existe
        if verificar_usuario_existe(email):
            return jsonify({
                "success": False,
                "error": "Email já cadastrado"
            }), 400
        
        # Hash da senha
        password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Salva no banco
        if not criar_usuario(name, email, password_hash):
            return jsonify({
                "success": False,
                "error": "Erro ao criar conta no banco de dados"
            }), 500
        
        # Gera token JWT
        token = jwt.encode({
            'email': email,
            'name': name,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, JWT_SECRET, algorithm='HS256')
        
        print(f"[AUTH] ✅ Usuário registrado com sucesso: {email}")
        
        return jsonify({
            "success": True,
            "message": "Conta criada com sucesso!",
            "token": token,
            "user": {
                "name": name,
                "email": email
            }
        }), 201
        
    except Exception as e:
        print(f"[AUTH] ❌ Erro no registro: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro ao criar conta: {str(e)}"
        }), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Endpoint de login - verifica no SQL Server"""
    try:
        data = request.get_json()
        print(f"[AUTH] Tentativa de login: {data.get('email')}")
        
        # Validações
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                "success": False,
                "error": "Email e senha são obrigatórios"
            }), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Busca usuário no banco
        user = buscar_usuario(email)
        
        if not user:
            return jsonify({
                "success": False,
                "error": "Email ou senha incorretos"
            }), 401
        
        # Verifica senha
        if not bcrypt.checkpw(
            password.encode('utf-8'),
            user['password_hash'].encode('utf-8')
        ):
            return jsonify({
                "success": False,
                "error": "Email ou senha incorretos"
            }), 401
        
        # Atualiza último login
        atualizar_ultimo_login(email)
        
        # Gera token JWT
        token = jwt.encode({
            'email': email,
            'name': user['name'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, JWT_SECRET, algorithm='HS256')
        
        print(f"[AUTH] ✅ Login bem-sucedido: {email}")
        
        return jsonify({
            "success": True,
            "message": "Login realizado com sucesso!",
            "token": token,
            "user": {
                "name": user['name'],
                "email": email
            }
        }), 200
        
    except Exception as e:
        print(f"[AUTH] ❌ Erro no login: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro ao fazer login: {str(e)}"
        }), 500


# ========================================
# ROTA DE TESTE DE CONEXÃO
# ========================================

@app.route('/api/auth/test-db', methods=['GET'])
def test_database():
    """Testa conexão com o banco de dados"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Testa consulta simples
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Conexão com banco de dados OK!",
            "total_usuarios": count
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Erro na conexão: {str(e)}"
        }), 500


# ========================================
# PROXY PARA OUTROS SERVIÇOS
# ========================================

@app.route('/api/<service>/<path:path>', methods=['GET', 'POST'])
def proxy_request(service, path):
    print("\n--- INICIANDO DEPURACAO DE ROTA (GATEWAY) ---")
    print(f"[GATEWAY] Requisição recebida: {request.method} para /api/{service}/{path}")
    
    if service not in SERVICES:
        print(f"[GATEWAY] ERRO: Serviço '{service}' não existe no mapeamento.")
        return jsonify({"error": f"Serviço '{service}' não encontrado."}), 404

    service_url = f"{SERVICES[service]}/api/{service}/{path}"
    print(f"[GATEWAY] Redirecionando para: {service_url}")

    headers = {
        key: value for key, value in request.headers
        if key.lower() not in ['host', 'content-length']
    }
    params = {key: value for key, value in request.args.items()}
    
    print(f"[GATEWAY] Parâmetros da URL (params): {params}")

    try:
        if request.method == 'POST':
            resp = requests.post(
                service_url,
                json=request.get_json(),
                headers=headers,
                params=params,
                timeout=30
            )
        else:
            resp = requests.get(
                service_url,
                params=params,
                headers=headers,
                timeout=30
            )

        print(f"[GATEWAY] Resposta recebida com status: {resp.status_code}")
        return (resp.content, resp.status_code, resp.headers.items())

    except requests.exceptions.ConnectionError:
        print(f"[GATEWAY] ERRO DE CONEXÃO: {service_url}")
        return jsonify({
            "error": f"Não foi possível conectar ao serviço de '{service}'"
        }), 503
    
    except Exception as e:
        print(f"[GATEWAY] ERRO INESPERADO: {str(e)}")
        return jsonify({
            "error": f"Erro inesperado: {str(e)}"
        }), 500


# ========================================
# INICIALIZAÇÃO
# ========================================

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Gateway iniciando...")
    print(f"📊 SQL Server: {SQL_SERVER}")
    print(f"💾 Database: {SQL_DATABASE}")
    print("=" * 60)
    
    # Testa conexão ao iniciar
    try:
        conn = get_db_connection()
        print("✅ Conexão com SQL Server OK!")
        conn.close()
    except Exception as e:
        print(f"❌ ERRO: Não foi possível conectar ao SQL Server!")
        print(f"   Detalhes: {e}")
        print("   Verifique as configurações no arquivo .env")
    
    app.run(port=5000, debug=True)