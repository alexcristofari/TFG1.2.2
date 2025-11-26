# api-gateway/gateway.py (v6.0 - FASE 3 COMPLETA)
from flask import Flask, request, jsonify
from functools import wraps
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
SQL_DRIVER = os.getenv("SQL_DRIVER", "ODBC Driver 17 for SQL Server")
USE_WINDOWS_AUTH = os.getenv("USE_WINDOWS_AUTH", "false").lower() == "true"

# String de conexão (Windows Auth ou SQL Auth)
if USE_WINDOWS_AUTH:
    CONNECTION_STRING = (
        f"DRIVER={{{SQL_DRIVER}}};"
        f"SERVER={SQL_SERVER};"
        f"DATABASE={SQL_DATABASE};"
        f"Trusted_Connection=yes;"
    )
else:
    SQL_USERNAME = os.getenv("SQL_USERNAME", "sa")
    SQL_PASSWORD = os.getenv("SQL_PASSWORD", "")
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
# MIDDLEWARE DE AUTENTICAÇÃO
# ========================================

def require_auth(f):
    """Decorator para proteger rotas que exigem autenticação"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({
                "success": False,
                "error": "Token não fornecido"
            }), 401
        
        try:
            # Remove "Bearer " se existir
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Decodifica o token
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            
            # Busca usuário no banco para garantir que ainda existe
            user = buscar_usuario(payload['email'])
            if not user:
                return jsonify({
                    "success": False,
                    "error": "Usuário não encontrado"
                }), 401
            
            # Adiciona dados do usuário ao request
            request.user_id = user['id']
            request.user_email = payload['email']
            request.user_name = payload['name']
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "error": "Token expirado"
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "error": "Token inválido"
            }), 401
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Erro na autenticação: {str(e)}"
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function


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
# ROTAS DE LISTAS
# ========================================

@app.route('/api/listas', methods=['GET', 'POST'])
@require_auth
def listas():
    """Listar ou criar listas do usuário"""
    
    if request.method == 'GET':
        # LISTAR LISTAS DO USUÁRIO
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT l.id, l.nome, l.descricao, l.data_criacao,
                       COUNT(li.id) as total_itens
                FROM listas l
                LEFT JOIN lista_itens li ON l.id = li.lista_id
                WHERE l.usuario_id = ?
                GROUP BY l.id, l.nome, l.descricao, l.data_criacao
                ORDER BY l.data_criacao DESC
            """, (request.user_id,))
            
            listas_data = []
            for row in cursor.fetchall():
                listas_data.append({
                    "id": row[0],
                    "nome": row[1],
                    "descricao": row[2],
                    "data_criacao": str(row[3]),
                    "total_itens": row[4]
                })
            
            conn.close()
            
            print(f"[LISTAS] ✅ Listadas {len(listas_data)} listas do usuário {request.user_email}")
            
            return jsonify({
                "success": True,
                "listas": listas_data
            }), 200
            
        except Exception as e:
            print(f"[LISTAS] ❌ Erro ao listar: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Erro ao listar listas: {str(e)}"
            }), 500
    
    elif request.method == 'POST':
        # CRIAR NOVA LISTA
        try:
            data = request.get_json()
            
            if not data or not data.get('nome'):
                return jsonify({
                    "success": False,
                    "error": "Nome da lista é obrigatório"
                }), 400
            
            nome = data['nome'].strip()
            descricao = data.get('descricao', '').strip()
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO listas (usuario_id, nome, descricao)
                VALUES (?, ?, ?)
            """, (request.user_id, nome, descricao))
            
            lista_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
            
            conn.commit()
            conn.close()
            
            print(f"[LISTAS] ✅ Lista criada: '{nome}' (ID: {lista_id}) por {request.user_email}")
            
            return jsonify({
                "success": True,
                "message": "Lista criada com sucesso!",
                "lista": {
                    "id": lista_id,
                    "nome": nome,
                    "descricao": descricao
                }
            }), 201
            
        except Exception as e:
            print(f"[LISTAS] ❌ Erro ao criar: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Erro ao criar lista: {str(e)}"
            }), 500


@app.route('/api/listas/<int:lista_id>', methods=['GET', 'PUT', 'DELETE'])
@require_auth
def lista_detalhes(lista_id):
    """Ver, editar ou deletar uma lista específica"""
    
    if request.method == 'GET':
        # VER DETALHES DA LISTA
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Verifica se a lista pertence ao usuário
            cursor.execute("""
                SELECT id, nome, descricao, data_criacao
                FROM listas
                WHERE id = ? AND usuario_id = ?
            """, (lista_id, request.user_id))
            
            lista = cursor.fetchone()
            
            if not lista:
                conn.close()
                return jsonify({
                    "success": False,
                    "error": "Lista não encontrada"
                }), 404
            
            # Busca os itens da lista
            cursor.execute("""
                SELECT li.id, m.id, m.titulo, m.tipo, m.genero, 
                       m.ano_lancamento, m.imagem_url, li.ordem, li.data_adicao
                FROM lista_itens li
                JOIN midias m ON li.midia_id = m.id
                WHERE li.lista_id = ?
                ORDER BY li.ordem, li.data_adicao
            """, (lista_id,))
            
            itens = []
            for row in cursor.fetchall():
                itens.append({
                    "item_id": row[0],
                    "midia_id": row[1],
                    "titulo": row[2],
                    "tipo": row[3],
                    "genero": row[4],
                    "ano": row[5],
                    "imagem": row[6],
                    "ordem": row[7],
                    "data_adicao": str(row[8])
                })
            
            conn.close()
            
            return jsonify({
                "success": True,
                "lista": {
                    "id": lista[0],
                    "nome": lista[1],
                    "descricao": lista[2],
                    "data_criacao": str(lista[3]),
                    "itens": itens
                }
            }), 200
            
        except Exception as e:
            print(f"[LISTAS] ❌ Erro ao buscar detalhes: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Erro ao buscar lista: {str(e)}"
            }), 500
    
    elif request.method == 'PUT':
        # EDITAR LISTA
        try:
            data = request.get_json()
            
            if not data or (not data.get('nome') and not data.get('descricao')):
                return jsonify({
                    "success": False,
                    "error": "Forneça nome ou descrição para atualizar"
                }), 400
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Verifica se a lista pertence ao usuário
            cursor.execute("""
                SELECT id FROM listas
                WHERE id = ? AND usuario_id = ?
            """, (lista_id, request.user_id))
            
            if not cursor.fetchone():
                conn.close()
                return jsonify({
                    "success": False,
                    "error": "Lista não encontrada"
                }), 404
            
            # Atualiza
            updates = []
            params = []
            
            if data.get('nome'):
                updates.append("nome = ?")
                params.append(data['nome'].strip())
            
            if 'descricao' in data:
                updates.append("descricao = ?")
                params.append(data['descricao'].strip())
            
            params.extend([lista_id, request.user_id])
            
            cursor.execute(f"""
                UPDATE listas
                SET {', '.join(updates)}
                WHERE id = ? AND usuario_id = ?
            """, params)
            
            conn.commit()
            conn.close()
            
            print(f"[LISTAS] ✅ Lista {lista_id} atualizada por {request.user_email}")
            
            return jsonify({
                "success": True,
                "message": "Lista atualizada com sucesso!"
            }), 200
            
        except Exception as e:
            print(f"[LISTAS] ❌ Erro ao editar: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Erro ao editar lista: {str(e)}"
            }), 500
    
    elif request.method == 'DELETE':
        # DELETAR LISTA
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Verifica se a lista pertence ao usuário
            cursor.execute("""
                SELECT id FROM listas
                WHERE id = ? AND usuario_id = ?
            """, (lista_id, request.user_id))
            
            if not cursor.fetchone():
                conn.close()
                return jsonify({
                    "success": False,
                    "error": "Lista não encontrada"
                }), 404
            
            # Deleta (CASCADE vai deletar os itens automaticamente)
            cursor.execute("""
                DELETE FROM listas
                WHERE id = ? AND usuario_id = ?
            """, (lista_id, request.user_id))
            
            conn.commit()
            conn.close()
            
            print(f"[LISTAS] ✅ Lista {lista_id} deletada por {request.user_email}")
            
            return jsonify({
                "success": True,
                "message": "Lista deletada com sucesso!"
            }), 200
            
        except Exception as e:
            print(f"[LISTAS] ❌ Erro ao deletar: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Erro ao deletar lista: {str(e)}"
            }), 500


@app.route('/api/listas/<int:lista_id>/itens', methods=['POST'])
@require_auth
def adicionar_item(lista_id):
    """Adicionar mídia a uma lista"""
    try:
        data = request.get_json()
        
        if not data or not data.get('midia_id'):
            return jsonify({
                "success": False,
                "error": "ID da mídia é obrigatório"
            }), 400
        
        midia_id = data['midia_id']
        ordem = data.get('ordem', None)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se a lista pertence ao usuário
        cursor.execute("""
            SELECT id FROM listas
            WHERE id = ? AND usuario_id = ?
        """, (lista_id, request.user_id))
        
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "success": False,
                "error": "Lista não encontrada"
            }), 404
        
        # Verifica se a mídia existe
        cursor.execute("SELECT id FROM midias WHERE id = ?", (midia_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "success": False,
                "error": "Mídia não encontrada"
            }), 404
        
        # Verifica se já não está na lista
        cursor.execute("""
            SELECT id FROM lista_itens
            WHERE lista_id = ? AND midia_id = ?
        """, (lista_id, midia_id))
        
        if cursor.fetchone():
            conn.close()
            return jsonify({
                "success": False,
                "error": "Esta mídia já está na lista"
            }), 400
        
        # Adiciona
        cursor.execute("""
            INSERT INTO lista_itens (lista_id, midia_id, ordem)
            VALUES (?, ?, ?)
        """, (lista_id, midia_id, ordem))
        
        item_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
        
        conn.commit()
        conn.close()
        
        print(f"[LISTAS] ✅ Mídia {midia_id} adicionada à lista {lista_id}")
        
        return jsonify({
            "success": True,
            "message": "Mídia adicionada à lista!",
            "item_id": item_id
        }), 201
        
    except Exception as e:
        print(f"[LISTAS] ❌ Erro ao adicionar item: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro ao adicionar mídia: {str(e)}"
        }), 500


@app.route('/api/listas/<int:lista_id>/itens/<int:item_id>', methods=['DELETE'])
@require_auth
def remover_item(lista_id, item_id):
    """Remover mídia de uma lista"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se a lista pertence ao usuário e se o item pertence à lista
        cursor.execute("""
            SELECT li.id
            FROM lista_itens li
            JOIN listas l ON li.lista_id = l.id
            WHERE li.id = ? AND li.lista_id = ? AND l.usuario_id = ?
        """, (item_id, lista_id, request.user_id))
        
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "success": False,
                "error": "Item não encontrado"
            }), 404
        
        # Remove
        cursor.execute("DELETE FROM lista_itens WHERE id = ?", (item_id,))
        
        conn.commit()
        conn.close()
        
        print(f"[LISTAS] ✅ Item {item_id} removido da lista {lista_id}")
        
        return jsonify({
            "success": True,
            "message": "Mídia removida da lista!"
        }), 200
        
    except Exception as e:
        print(f"[LISTAS] ❌ Erro ao remover item: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro ao remover mídia: {str(e)}"
        }), 500


# ========================================
# ROTAS DE AVALIAÇÕES
# ========================================

@app.route('/api/avaliacoes', methods=['POST'])
@require_auth
def criar_avaliacao():
    """Criar ou atualizar avaliação de uma mídia"""
    try:
        data = request.get_json()
        
        if not data or not data.get('midia_id') or not data.get('nota'):
            return jsonify({
                "success": False,
                "error": "ID da mídia e nota são obrigatórios"
            }), 400
        
        midia_id = data['midia_id']
        nota = float(data['nota'])
        comentario = data.get('comentario', '').strip()
        
        # Valida nota
        if nota < 0 or nota > 10:
            return jsonify({
                "success": False,
                "error": "Nota deve estar entre 0 e 10"
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se a mídia existe
        cursor.execute("SELECT id FROM midias WHERE id = ?", (midia_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({
                "success": False,
                "error": "Mídia não encontrada"
            }), 404
        
        # Verifica se já existe avaliação
        cursor.execute("""
            SELECT id FROM avaliacoes
            WHERE usuario_id = ? AND midia_id = ?
        """, (request.user_id, midia_id))
        
        avaliacao_existe = cursor.fetchone()
        
        if avaliacao_existe:
            # ATUALIZA avaliação existente
            cursor.execute("""
                UPDATE avaliacoes
                SET nota = ?, comentario = ?, data_avaliacao = GETDATE()
                WHERE usuario_id = ? AND midia_id = ?
            """, (nota, comentario, request.user_id, midia_id))
            
            mensagem = "Avaliação atualizada!"
        else:
            # CRIA nova avaliação
            cursor.execute("""
                INSERT INTO avaliacoes (usuario_id, midia_id, nota, comentario)
                VALUES (?, ?, ?, ?)
            """, (request.user_id, midia_id, nota, comentario))
            
            mensagem = "Avaliação criada!"
        
        conn.commit()
        conn.close()
        
        print(f"[AVALIACOES] ✅ Avaliação registrada: mídia {midia_id}, nota {nota}")
        
        return jsonify({
            "success": True,
            "message": mensagem
        }), 201 if not avaliacao_existe else 200
        
    except ValueError:
        return jsonify({
            "success": False,
            "error": "Nota deve ser um número"
        }), 400
    except Exception as e:
        print(f"[AVALIACOES] ❌ Erro: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro ao salvar avaliação: {str(e)}"
        }), 500


@app.route('/api/avaliacoes/minhas', methods=['GET'])
@require_auth
def minhas_avaliacoes():
    """Listar avaliações do usuário logado"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT a.id, a.nota, a.comentario, a.data_avaliacao,
                   m.id, m.titulo, m.tipo, m.genero, m.ano_lancamento, m.imagem_url
            FROM avaliacoes a
            JOIN midias m ON a.midia_id = m.id
            WHERE a.usuario_id = ?
            ORDER BY a.data_avaliacao DESC
        """, (request.user_id,))
        
        avaliacoes = []
        for row in cursor.fetchall():
            avaliacoes.append({
                "id": row[0],
                "nota": float(row[1]),
                "comentario": row[2],
                "data": str(row[3]),
                "midia": {
                    "id": row[4],
                    "titulo": row[5],
                    "tipo": row[6],
                    "genero": row[7],
                    "ano": row[8],
                    "imagem": row[9]
                }
            })
        
        conn.close()
        
        return jsonify({
            "success": True,
            "avaliacoes": avaliacoes
        }), 200
        
    except Exception as e:
        print(f"[AVALIACOES] ❌ Erro ao listar: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro ao listar avaliações: {str(e)}"
        }), 500


@app.route('/api/midias/<int:midia_id>/avaliacoes', methods=['GET'])
def avaliacoes_midia(midia_id):
    """Listar todas as avaliações de uma mídia específica (rota pública)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verifica se a mídia existe
        cursor.execute("SELECT titulo, tipo FROM midias WHERE id = ?", (midia_id,))
        midia = cursor.fetchone()
        
        if not midia:
            conn.close()
            return jsonify({
                "success": False,
                "error": "Mídia não encontrada"
            }), 404
        
        # Busca avaliações
        cursor.execute("""
            SELECT a.id, a.nota, a.comentario, a.data_avaliacao,
                   u.nome
            FROM avaliacoes a
            JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.midia_id = ?
            ORDER BY a.data_avaliacao DESC
        """, (midia_id,))
        
        avaliacoes = []
        soma_notas = 0
        
        for row in cursor.fetchall():
            nota = float(row[1])
            soma_notas += nota
            
            avaliacoes.append({
                "id": row[0],
                "nota": nota,
                "comentario": row[2],
                "data": str(row[3]),
                "usuario": row[4]
            })
        
        media = soma_notas / len(avaliacoes) if avaliacoes else 0
        
        conn.close()
        
        return jsonify({
            "success": True,
            "midia": {
                "titulo": midia[0],
                "tipo": midia[1]
            },
            "total": len(avaliacoes),
            "media": round(media, 1),
            "avaliacoes": avaliacoes
        }), 200
        
    except Exception as e:
        print(f"[AVALIACOES] ❌ Erro: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Erro ao buscar avaliações: {str(e)}"
        }), 500


# ========================================
# ROTA DE TESTE
# ========================================

@app.route('/api/auth/test-db', methods=['GET'])
def test_database():
    """Testa conexão com o banco de dados"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Conexão com banco de dados OK!",
            "total_usuarios": count,
            "auth_mode": "Windows Authentication" if USE_WINDOWS_AUTH else "SQL Authentication"
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
    print(f"🔐 Auth Mode: {'Windows Authentication' if USE_WINDOWS_AUTH else 'SQL Authentication'}")
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