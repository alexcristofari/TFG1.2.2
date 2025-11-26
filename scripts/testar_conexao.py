import os
import sys
import pyodbc
from dotenv import load_dotenv

load_dotenv('api-gateway/.env')

print("=" * 60)
print("TESTANDO CONEXAO COM SQL SERVER")
print("=" * 60)
print()

SQL_SERVER = os.getenv("SQL_SERVER", "localhost\\SQLEXPRESS")
SQL_DATABASE = os.getenv("SQL_DATABASE", "RecomendadorMultimidia")
SQL_DRIVER = os.getenv("SQL_DRIVER", "ODBC Driver 17 for SQL Server")
USE_WINDOWS_AUTH = os.getenv("USE_WINDOWS_AUTH", "true").lower() == "true"

print("Configuracoes:")
print(f"   Servidor: {SQL_SERVER}")
print(f"   Banco: {SQL_DATABASE}")
print(f"   Driver: {SQL_DRIVER}")
print(f"   Windows Auth: {USE_WINDOWS_AUTH}")
print()

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

print("Tentando conectar...")
print()

try:
    conn = pyodbc.connect(CONNECTION_STRING)
    cursor = conn.cursor()
    
    print("CONEXAO OK!")
    print()
    
    cursor.execute("""
        SELECT TABLE_NAME, 
               (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) as Colunas
        FROM INFORMATION_SCHEMA.TABLES t
        WHERE TABLE_TYPE = 'BASE TABLE'
          AND TABLE_NAME IN ('usuarios', 'midias', 'midia_detalhes', 'listas', 'lista_itens', 'avaliacoes')
        ORDER BY TABLE_NAME
    """)
    
    print("Tabelas encontradas:")
    for row in cursor.fetchall():
        print(f"   {row[0]} ({row[1]} colunas)")
    
    print()
    print("Registros por tabela:")
    
    tabelas = ['usuarios', 'midias', 'midia_detalhes', 'listas', 'lista_itens', 'avaliacoes']
    for tabela in tabelas:
        cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
        count = cursor.fetchone()[0]
        print(f"   {tabela}: {count} registros")
    
    conn.close()
    
    print()
    print("=" * 60)
    print("TESTE OK! A API pode conectar ao banco!")
    print("=" * 60)
    
except pyodbc.Error as e:
    print("ERRO AO CONECTAR!")
    print(f"Detalhes: {e}")
    print()
    print("SOLUCOES:")
    print("1. Verifique se SQL Server esta rodando")
    print("2. Tente outro driver:")
    print("   - SQL Server")
    print("   - ODBC Driver 18 for SQL Server")
    print()
    print("3. Execute 'odbcad32' no CMD para ver drivers disponiveis")
    sys.exit(1)

except Exception as e:
    print("ERRO INESPERADO!")
    print(f"Detalhes: {e}")
    sys.exit(1)