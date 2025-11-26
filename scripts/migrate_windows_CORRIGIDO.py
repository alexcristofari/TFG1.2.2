import os
import sys
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

def get_connection():
    try:
        conn = pyodbc.connect(CONNECTION_STRING)
        return conn
    except pyodbc.Error as e:
        print(f"Erro ao conectar: {e}")
        sys.exit(1)

def safe_str(value, max_len=500):
    if value is None or pd.isna(value) or value == '':
        return None
    if isinstance(value, (list, np.ndarray)):
        if len(value) == 0:
            return None
        return str(value)[:max_len]
    return str(value)[:max_len]

def safe_int(value):
    if pd.isna(value) or value is None:
        return None
    try:
        return int(value)
    except:
        return None

def safe_float(value):
    if pd.isna(value) or value is None:
        return None
    try:
        return float(value)
    except:
        return None

def safe_bigint(value):
    if pd.isna(value) or value is None:
        return None
    try:
        val = int(value)
        return val if val > 0 else None
    except:
        return None

def extract_year(date_str):
    if pd.isna(date_str) or not date_str:
        return None
    try:
        if '/' in str(date_str):
            parts = str(date_str).split('/')
            year = parts[-1]
        elif '-' in str(date_str):
            year = str(date_str).split('-')[0]
        else:
            year = str(date_str)
        year = ''.join(filter(str.isdigit, year))
        if year and len(year) == 4:
            return int(year)
    except:
        pass
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

def check_exists(cursor, api_id, tipo):
    cursor.execute("SELECT id FROM midias WHERE api_id = ? AND tipo = ?", (str(api_id), tipo))
    result = cursor.fetchone()
    return result[0] if result else None

def migrate_games():
    """Migra jogos para tabela jogo_detalhes"""
    print("\n" + "="*60)
    print("🎮 MIGRANDO JOGOS DA STEAM")
    print("="*60)
    
    try:
        parquet_path = r'backend\steam\cache\games_processed_df.parquet'
        df = pd.read_parquet(parquet_path)
        print(f"✅ Carregados {len(df)} jogos")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Verificar se a tabela jogo_detalhes existe
        try:
            cursor.execute("SELECT TOP 1 * FROM jogo_detalhes")
            print("✅ Tabela jogo_detalhes encontrada")
        except Exception as e:
            print(f"❌ ERRO: Tabela jogo_detalhes não existe ou está inacessível!")
            print(f"   Detalhes: {e}")
            print("\n💡 Você precisa criar a tabela jogo_detalhes primeiro!")
            return 0
        
        count = 0
        skipped = 0
        errors = 0
        detalhes_errors = 0
        
        for idx, row in df.iterrows():
            midia_id = None
            try:
                api_id = safe_str(row.get('appid', ''), 255)
                
                if not api_id:
                    skipped += 1
                    continue
                
                if check_exists(cursor, api_id, 'jogo'):
                    skipped += 1
                    continue
                
                year = extract_year(row.get('release_date'))
                genres = process_list_field(row.get('genres'), 'Desconhecido')
                developers = process_list_field(row.get('developers'), 'Desconhecido')
                publishers = process_list_field(row.get('publishers'), 'Desconhecido')
                categories = process_list_field(row.get('categories'), '')
                
                if not genres or genres == '':
                    genres = 'Desconhecido'
                
                # Inserir na tabela midias
                cursor.execute("""
                    INSERT INTO midias (titulo, tipo, genero, ano_lancamento, descricao, imagem_url, api_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    safe_str(row.get('name', 'Sem titulo'), 500),
                    'jogo',
                    safe_str(genres, 200),
                    year,
                    safe_str(row.get('short_description', ''), 2000),
                    safe_str(row.get('header_image', ''), 1000),
                    api_id
                ))
                
                midia_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
                
                # Inserir na tabela jogo_detalhes com tratamento separado
                try:
                    cursor.execute("""
                        INSERT INTO jogo_detalhes (midia_id, desenvolvedor, plataforma, publisher, quality, categories)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        midia_id,
                        safe_str(developers, 500),
                        'PC',
                        safe_str(publishers, 500),
                        safe_float(row.get('quality')),
                        safe_str(categories, 2000)
                    ))
                    
                except Exception as det_error:
                    detalhes_errors += 1
                    if detalhes_errors <= 5:
                        print(f"\n   ⚠ ERRO ao inserir em jogo_detalhes (linha {idx}):")
                        print(f"      midia_id: {midia_id}")
                        print(f"      desenvolvedor: {safe_str(developers, 500)}")
                        print(f"      publisher: {safe_str(publishers, 500)}")
                        print(f"      Erro: {det_error}")
                
                count += 1
                if count % 100 == 0:
                    conn.commit()
                    print(f"   ✓ {count} jogos migrados... (Erros em detalhes: {detalhes_errors})")
                    
            except Exception as e:
                errors += 1
                if errors <= 10:
                    print(f"   ⚠ Erro geral linha {idx}: {str(e)}")
                continue
        
        conn.commit()
        conn.close()
        
        print(f"\n✅ Migração concluída!")
        print(f"   Novos: {count} | Ignorados: {skipped} | Erros gerais: {errors}")
        print(f"   ⚠ Erros em jogo_detalhes: {detalhes_errors}")
        
        if detalhes_errors > 0:
            print("\n💡 IMPORTANTE: Os jogos foram salvos em 'midias', mas alguns detalhes")
            print("   não foram salvos em 'jogo_detalhes'. Verifique a estrutura da tabela!")
        
        return count
        
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        import traceback
        traceback.print_exc()
        return 0

def migrate_music():
    """Migra músicas para tabela musica_detalhes"""
    print("\n" + "="*60)
    print("🎵 MIGRANDO MUSICAS DO SPOTIFY")
    print("="*60)
    
    try:
        csv_path = r'backend\music\cache\spotify_dataset.csv'
        df = pd.read_csv(csv_path)
        print(f"✅ Carregadas {len(df)} músicas")
        
        conn = get_connection()
        cursor = conn.cursor()
        count = 0
        skipped = 0
        errors = 0
        
        for idx, row in df.iterrows():
            try:
                api_id = safe_str(row.get('track_id', ''), 255)
                
                if not api_id:
                    skipped += 1
                    continue
                
                if check_exists(cursor, api_id, 'musica'):
                    skipped += 1
                    continue
                
                artists = safe_str(row.get('artists', 'Desconhecido'), 500)
                track_genre = safe_str(row.get('track_genre', 'Desconhecido'), 200)
                
                if not track_genre or track_genre == '':
                    track_genre = 'Desconhecido'
                
                # Insere na tabela midias
                cursor.execute("""
                    INSERT INTO midias (titulo, tipo, genero, ano_lancamento, descricao, imagem_url, api_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    safe_str(row.get('track_name', 'Sem titulo'), 500),
                    'musica',
                    track_genre,
                    None,
                    artists,
                    '',
                    api_id
                ))
                
                midia_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
                
                # Insere em musica_detalhes
                cursor.execute("""
                    INSERT INTO musica_detalhes (
                        midia_id, artista, album, duracao_ms,
                        popularity, explicit, danceability, energy, 
                        key_musical, loudness, mode_musical, speechiness,
                        acousticness, instrumentalness, liveness, valence,
                        tempo, time_signature
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    midia_id,
                    artists,
                    safe_str(row.get('album_name', 'Single'), 500),
                    safe_int(row.get('duration_ms')),
                    safe_int(row.get('popularity')),
                    1 if str(row.get('explicit', 'False')).lower() == 'true' else 0,
                    safe_float(row.get('danceability')),
                    safe_float(row.get('energy')),
                    safe_int(row.get('key')),
                    safe_float(row.get('loudness')),
                    safe_int(row.get('mode')),
                    safe_float(row.get('speechiness')),
                    safe_float(row.get('acousticness')),
                    safe_float(row.get('instrumentalness')),
                    safe_float(row.get('liveness')),
                    safe_float(row.get('valence')),
                    safe_float(row.get('tempo')),
                    safe_int(row.get('time_signature'))
                ))
                
                count += 1
                if count % 1000 == 0:
                    conn.commit()
                    print(f"   ✓ {count} músicas migradas...")
                    
            except Exception as e:
                errors += 1
                if errors <= 10:
                    print(f"   ⚠ Erro linha {idx}: {str(e)}")
                continue
        
        conn.commit()
        conn.close()
        
        print(f"\n✅ Migração concluída!")
        print(f"   Novos: {count} | Ignorados: {skipped} | Erros: {errors}")
        return count
        
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        import traceback
        traceback.print_exc()
        return 0

def migrate_movies():
    """Migra filmes para tabela filme_detalhes"""
    print("\n" + "="*60)
    print("🎬 MIGRANDO FILMES DO TMDB")
    print("="*60)
    
    try:
        csv_path = r'backend\movies\cache\TMDB_movie_dataset.csv'
        df = pd.read_csv(csv_path)
        print(f"✅ Carregados {len(df)} filmes")
        
        conn = get_connection()
        cursor = conn.cursor()
        count = 0
        skipped = 0
        errors = 0
        
        for idx, row in df.iterrows():
            try:
                api_id = safe_str(row.get('id', ''), 255)
                
                if not api_id:
                    skipped += 1
                    continue
                
                if check_exists(cursor, api_id, 'filme'):
                    skipped += 1
                    continue
                
                year = extract_year(row.get('release_date'))
                genres = safe_str(row.get('genres', 'Desconhecido'), 200)
                
                if not genres or genres == '' or genres == 'nan':
                    genres = 'Desconhecido'
                
                poster_path = row.get('poster_path', '')
                if poster_path and not pd.isna(poster_path) and str(poster_path) != 'nan':
                    if not str(poster_path).startswith('http'):
                        poster_path = f"https://image.tmdb.org/t/p/w500{poster_path}"
                else:
                    poster_path = ''
                
                backdrop_path = row.get('backdrop_path', '')
                if backdrop_path and not pd.isna(backdrop_path) and str(backdrop_path) != 'nan':
                    if not str(backdrop_path).startswith('http'):
                        backdrop_path = f"https://image.tmdb.org/t/p/original{backdrop_path}"
                else:
                    backdrop_path = ''
                
                # Insere na tabela midias
                cursor.execute("""
                    INSERT INTO midias (titulo, tipo, genero, ano_lancamento, descricao, imagem_url, api_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    safe_str(row.get('title', 'Sem titulo'), 500),
                    'filme',
                    genres,
                    year,
                    safe_str(row.get('overview', ''), 2000),
                    poster_path,
                    api_id
                ))
                
                midia_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
                
                # Insere em filme_detalhes
                cursor.execute("""
                    INSERT INTO filme_detalhes (
                        midia_id, diretor, elenco, duracao_minutos,
                        poster_path, backdrop_path, homepage, imdb_id,
                        vote_average, vote_count, popularity,
                        revenue, budget, runtime, adult, status,
                        original_language, original_title, tagline,
                        overview, production_companies, production_countries,
                        spoken_languages, keywords
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    midia_id,
                    'Desconhecido',
                    '',
                    safe_int(row.get('runtime')),
                    poster_path,
                    backdrop_path,
                    safe_str(row.get('homepage', ''), 1000),
                    safe_str(row.get('imdb_id', ''), 50),
                    safe_float(row.get('vote_average')),
                    safe_int(row.get('vote_count')),
                    safe_float(row.get('popularity')),
                    safe_bigint(row.get('revenue')),
                    safe_bigint(row.get('budget')),
                    safe_int(row.get('runtime')),
                    1 if str(row.get('adult', 'False')).lower() == 'true' else 0,
                    safe_str(row.get('status', ''), 50),
                    safe_str(row.get('original_language', ''), 50),
                    safe_str(row.get('original_title', ''), 500),
                    safe_str(row.get('tagline', ''), 1000),
                    safe_str(row.get('overview', ''), 5000),
                    safe_str(row.get('production_companies', ''), 2000),
                    safe_str(row.get('production_countries', ''), 500),
                    safe_str(row.get('spoken_languages', ''), 500),
                    safe_str(row.get('keywords', ''), 2000)
                ))
                
                count += 1
                if count % 500 == 0:
                    conn.commit()
                    print(f"   ✓ {count} filmes migrados...")
                    
            except Exception as e:
                errors += 1
                if errors <= 10:
                    print(f"   ⚠ Erro linha {idx}: {str(e)}")
                continue
        
        conn.commit()
        conn.close()
        
        print(f"\n✅ Migração concluída!")
        print(f"   Novos: {count} | Ignorados: {skipped} | Erros: {errors}")
        return count
        
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        import traceback
        traceback.print_exc()
        return 0

def verify_migration():
    """Verifica dados migrados"""
    print("\n" + "="*60)
    print("🔍 VERIFICANDO MIGRACAO")
    print("="*60)
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT tipo, COUNT(*) as total
            FROM midias
            GROUP BY tipo
        """)
        
        print("\n📊 Registros por tipo:")
        for row in cursor.fetchall():
            print(f"   {row[0]:10s}: {row[1]:6d}")
        
        print("\n📋 Detalhes por tipo:")
        
        cursor.execute("SELECT COUNT(*) FROM jogo_detalhes")
        print(f"   jogo_detalhes:   {cursor.fetchone()[0]:6d}")
        
        cursor.execute("SELECT COUNT(*) FROM musica_detalhes")
        print(f"   musica_detalhes: {cursor.fetchone()[0]:6d}")
        
        cursor.execute("SELECT COUNT(*) FROM filme_detalhes")
        print(f"   filme_detalhes:  {cursor.fetchone()[0]:6d}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 MIGRACAO COM TABELAS SEPARADAS")
    print("="*60)
    print(f"Servidor: {SQL_SERVER}")
    print(f"Banco: {SQL_DATABASE}")
    
    try:
        conn = get_connection()
        print("✅ Conexao OK!")
        conn.close()
    except:
        print("❌ Falha na conexao.")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("ESCOLHA O QUE MIGRAR:")
    print("="*60)
    print("1. Apenas JOGOS")
    print("2. Apenas MUSICAS")
    print("3. Apenas FILMES")
    print("4. TUDO")
    print("="*60)
    
    escolha = input("\nDigite sua escolha (1-4): ").strip()
    
    games_count = 0
    music_count = 0
    movies_count = 0
    
    if escolha == '1':
        games_count = migrate_games()
    elif escolha == '2':
        music_count = migrate_music()
    elif escolha == '3':
        movies_count = migrate_movies()
    elif escolha == '4':
        games_count = migrate_games()
        music_count = migrate_music()
        movies_count = migrate_movies()
    else:
        print("❌ Escolha invalida!")
        sys.exit(1)
    
    verify_migration()
    
    print(f"\n" + "="*60)
    print("📊 RESUMO FINAL:")
    print("="*60)
    print(f"   Jogos:   {games_count:6d}")
    print(f"   Musicas: {music_count:6d}")
    print(f"   Filmes:  {movies_count:6d}")
    print(f"   TOTAL:   {games_count + music_count + movies_count:6d}")
    print("="*60)