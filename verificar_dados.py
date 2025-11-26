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

# Verificar contagem de detalhes em todas as tabelas
print("\n📋 Detalhes por tabela:")
cursor.execute("SELECT COUNT(*) FROM jogo_detalhes")
print(f"   jogo_detalhes:   {cursor.fetchone()[0]:6d}")

cursor.execute("SELECT COUNT(*) FROM musica_detalhes")
print(f"   musica_detalhes: {cursor.fetchone()[0]:6d}")

cursor.execute("SELECT COUNT(*) FROM filme_detalhes")
print(f"   filme_detalhes:  {cursor.fetchone()[0]:6d}")

# Primeiros 5 jogos - CORRIGIDO para usar jogo_detalhes
cursor.execute("""
    SELECT TOP 5 m.titulo, m.genero, m.ano_lancamento, j.desenvolvedor
    FROM midias m
    LEFT JOIN jogo_detalhes j ON m.id = j.midia_id
    WHERE m.tipo = 'jogo'
    ORDER BY m.id DESC
""")
print("\n🎮 Últimos 5 jogos migrados:")
for row in cursor.fetchall():
    titulo = row[0] if row[0] else "Sem título"
    ano = row[2] if row[2] else "N/A"
    dev = row[3] if row[3] else "Desconhecido"
    print(f"   • {titulo} ({ano}) - {dev}")

# Primeiras 5 músicas
cursor.execute("""
    SELECT TOP 5 m.titulo, m.genero, mu.artista, mu.album
    FROM midias m
    LEFT JOIN musica_detalhes mu ON m.id = mu.midia_id
    WHERE m.tipo = 'musica'
    ORDER BY m.id DESC
""")
print("\n🎵 Últimas 5 músicas migradas:")
for row in cursor.fetchall():
    titulo = row[0] if row[0] else "Sem título"
    genero = row[1] if row[1] else "N/A"
    artista = row[2] if row[2] else "Desconhecido"
    print(f"   • {titulo} - {artista} (Gênero: {genero})")

# Primeiros 5 filmes
cursor.execute("""
    SELECT TOP 5 m.titulo, m.genero, m.ano_lancamento, f.vote_average
    FROM midias m
    LEFT JOIN filme_detalhes f ON m.id = f.midia_id
    WHERE m.tipo = 'filme'
    ORDER BY m.id DESC
""")
print("\n🎬 Últimos 5 filmes migrados:")
for row in cursor.fetchall():
    titulo = row[0] if row[0] else "Sem título"
    ano = row[2] if row[2] else "N/A"
    nota = f"{row[3]:.1f}" if row[3] else "N/A"
    print(f"   • {titulo} ({ano}) - Nota: {nota}")

# Buscar jogo específico - CORRIGIDO para usar jogo_detalhes
print("\n🔍 Buscando 'Counter-Strike'...")
cursor.execute("""
    SELECT m.titulo, m.genero, m.ano_lancamento, m.descricao, j.desenvolvedor, j.publisher
    FROM midias m
    LEFT JOIN jogo_detalhes j ON m.id = j.midia_id
    WHERE m.titulo LIKE '%Counter-Strike%'
""")
results = cursor.fetchall()
if results:
    for row in results:
        print(f"\n   📌 {row[0]}")
        print(f"      Gênero: {row[1]}")
        print(f"      Ano: {row[2]}")
        print(f"      Desenvolvedor: {row[4]}")
        print(f"      Publisher: {row[5]}")
        if row[3]:
            print(f"      Descrição: {row[3][:100]}...")
else:
    print("   ⚠ Counter-Strike não encontrado")

# Teste de integridade - verificar se todos os jogos têm detalhes
cursor.execute("""
    SELECT COUNT(*) FROM midias m
    LEFT JOIN jogo_detalhes j ON m.id = j.midia_id
    WHERE m.tipo = 'jogo' AND j.id IS NULL
""")
jogos_sem_detalhes = cursor.fetchone()[0]

cursor.execute("""
    SELECT COUNT(*) FROM midias m
    LEFT JOIN musica_detalhes mu ON m.id = mu.midia_id
    WHERE m.tipo = 'musica' AND mu.id IS NULL
""")
musicas_sem_detalhes = cursor.fetchone()[0]

cursor.execute("""
    SELECT COUNT(*) FROM midias m
    LEFT JOIN filme_detalhes f ON m.id = f.midia_id
    WHERE m.tipo = 'filme' AND f.id IS NULL
""")
filmes_sem_detalhes = cursor.fetchone()[0]

print("\n🔍 Integridade dos dados:")
print(f"   Jogos sem detalhes:   {jogos_sem_detalhes}")
print(f"   Músicas sem detalhes: {musicas_sem_detalhes}")
print(f"   Filmes sem detalhes:  {filmes_sem_detalhes}")

if jogos_sem_detalhes == 0 and musicas_sem_detalhes == 0 and filmes_sem_detalhes == 0:
    print("\n✅ Todos os registros têm detalhes associados!")
else:
    print("\n⚠ Alguns registros estão sem detalhes")

conn.close()
print("\n" + "="*60)
print("✨ Verificação concluída!")
print("="*60)