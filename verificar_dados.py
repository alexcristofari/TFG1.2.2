import pyodbc

SQL_SERVER = r"localhost\SQLEXPRESS"
SQL_DATABASE = "RecomendadorMultimidia"
SQL_DRIVER = "ODBC Driver 17 for SQL Server"

CONNECTION_STRING = (
    f"DRIVER={{{SQL_DRIVER}}};"
    f"SERVER={SQL_SERVER};"
    f"DATABASE={SQL_DATABASE};"
    f"Trusted_Connection=yes;"
)

conn = pyodbc.connect(CONNECTION_STRING)
cursor = conn.cursor()

print("\n" + "="*60)
print("📊 VERIFICANDO DADOS NO BANCO")
print("="*60)

# Total por tipo
cursor.execute("""
    SELECT tipo, COUNT(*) as total
    FROM midias
    GROUP BY tipo
    ORDER BY tipo
""")
print("\n✅ Total de registros por tipo:")
for row in cursor.fetchall():
    print(f"   {row[0]:10s}: {row[1]:6d} registros")

# Primeiros 5 jogos
cursor.execute("""
    SELECT TOP 5 m.titulo, m.genero, m.ano_lancamento, d.desenvolvedor
    FROM midias m
    LEFT JOIN midia_detalhes d ON m.id = d.midia_id
    WHERE m.tipo = 'jogo'
    ORDER BY m.id DESC
""")
print("\n🎮 Últimos 5 jogos migrados:")
for row in cursor.fetchall():
    print(f"   • {row[0]} ({row[2]}) - {row[3]}")

# Buscar jogo específico
print("\n🔍 Buscando 'Counter-Strike'...")
cursor.execute("""
    SELECT m.titulo, m.genero, m.ano_lancamento, m.descricao, d.desenvolvedor
    FROM midias m
    LEFT JOIN midia_detalhes d ON m.id = d.midia_id
    WHERE m.titulo LIKE '%Counter-Strike%'
""")
for row in cursor.fetchall():
    print(f"\n   📌 {row[0]}")
    print(f"      Gênero: {row[1]}")
    print(f"      Ano: {row[2]}")
    print(f"      Dev: {row[4]}")
    print(f"      Descrição: {row[3][:100]}...")

conn.close()
print("\n" + "="*60)