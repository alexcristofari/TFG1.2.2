import pandas as pd
import pyodbc
import numpy as np
import json

SQL_SERVER = r"localhost\SQLEXPRESS"
SQL_DATABASE = "RecomendadorMultimidia"
SQL_DRIVER = "ODBC Driver 17 for SQL Server"

CONNECTION_STRING = (
    f"DRIVER={{{SQL_DRIVER}}};"
    f"SERVER={SQL_SERVER};"
    f"DATABASE={SQL_DATABASE};"
    f"Trusted_Connection=yes;"
)

def safe_str(value, max_len=500):
    if value is None or pd.isna(value) or value == '':
        return None
    if isinstance(value, (list, np.ndarray)):
        if len(value) == 0:
            return None
        return str(value)[:max_len]
    return str(value)[:max_len]

def safe_float(value):
    if pd.isna(value) or value is None:
        return None
    try:
        return float(value)
    except:
        return None

def process_list_field(value, default='Desconhecido'):
    if value is None:
        return default
    
    if isinstance(value, str) and value.strip():
        if value.startswith('['):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list) and len(parsed) > 0:
                    str_list = []
                    for item in parsed:
                        if isinstance(item, dict):
                            for v in item.values():
                                if v:
                                    str_list.append(str(v))
                                    break
                        else:
                            str_list.append(str(item))
                    return ', '.join(str_list) if str_list else default
            except:
                pass
        return value
    
    if isinstance(value, (list, np.ndarray)):
        if len(value) == 0:
            return default
        str_list = []
        for item in value:
            if isinstance(item, dict):
                for v in item.values():
                    if v:
                        str_list.append(str(v))
                        break
            else:
                str_list.append(str(item))
        return ', '.join(str_list) if str_list else default
    
    if pd.isna(value) or value == '':
        return default
    
    return str(value)

print("\n" + "="*60)
print("🔧 CORRIGINDO DETALHES DOS JOGOS")
print("="*60)

# Conectar ao banco
conn = pyodbc.connect(CONNECTION_STRING)
cursor = conn.cursor()

# Buscar jogos sem detalhes
print("\n📊 Buscando jogos sem detalhes...")
cursor.execute("""
    SELECT m.id, m.api_id, m.titulo
    FROM midias m
    LEFT JOIN jogo_detalhes j ON m.id = j.midia_id
    WHERE m.tipo = 'jogo' AND j.id IS NULL
""")

jogos_sem_detalhes = cursor.fetchall()
total_sem_detalhes = len(jogos_sem_detalhes)

print(f"   ⚠ Encontrados {total_sem_detalhes} jogos sem detalhes")

if total_sem_detalhes == 0:
    print("\n✅ Todos os jogos já têm detalhes!")
    conn.close()
    exit()

# Criar mapa de api_id -> midia_id
api_id_map = {}
for row in jogos_sem_detalhes:
    midia_id, api_id, titulo = row
    api_id_map[str(api_id)] = midia_id

print(f"\n📂 Carregando dados do parquet...")
parquet_path = r'backend\steam\cache\games_processed_df.parquet'
df = pd.read_parquet(parquet_path)
print(f"   ✅ Carregados {len(df)} jogos do arquivo")

# Inserir detalhes
print(f"\n💾 Inserindo detalhes...")
count_success = 0
count_errors = 0

for idx, row in df.iterrows():
    api_id = str(row.get('appid', '')).strip()
    
    # Verificar se este jogo precisa de detalhes
    if api_id not in api_id_map:
        continue
    
    midia_id = api_id_map[api_id]
    
    try:
        developers = process_list_field(row.get('developers'), 'Desconhecido')
        publishers = process_list_field(row.get('publishers'), 'Desconhecido')
        categories = process_list_field(row.get('categories'), '')
        quality = safe_float(row.get('quality'))
        
        cursor.execute("""
            INSERT INTO jogo_detalhes (midia_id, desenvolvedor, plataforma, publisher, quality, categories)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            midia_id,
            safe_str(developers, 500),
            'PC',
            safe_str(publishers, 500),
            quality,
            safe_str(categories, 2000)
        ))
        
        count_success += 1
        
        if count_success % 100 == 0:
            conn.commit()
            print(f"   ✓ {count_success}/{total_sem_detalhes} detalhes inseridos...")
            
    except Exception as e:
        count_errors += 1
        if count_errors <= 10:
            print(f"\n   ⚠ ERRO ao inserir detalhes do jogo {api_id}:")
            print(f"      midia_id: {midia_id}")
            print(f"      Erro: {e}")

conn.commit()

# Verificação final
cursor.execute("SELECT COUNT(*) FROM jogo_detalhes")
total_detalhes = cursor.fetchone()[0]

conn.close()

print("\n" + "="*60)
print("✅ CORREÇÃO CONCLUÍDA!")
print("="*60)
print(f"   Detalhes inseridos: {count_success}")
print(f"   Erros: {count_errors}")
print(f"   Total em jogo_detalhes: {total_detalhes}")
print("="*60)