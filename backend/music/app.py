# backend/music/app.py (v14.0 - COM SIMILARITY_SCORE CORRIGIDO)
import os
import json
import pickle
import pandas as pd
import numpy as np
from flask import Flask, Blueprint, jsonify, request
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
import requests
import base64
from datetime import datetime, timedelta

# Blueprint para músicas
music_bp = Blueprint('music', __name__, url_prefix='/api/music')

# ========================================
# GERENCIADOR DE TOKENS SPOTIFY
# ========================================
class SpotifyTokenManager:
    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = None
        self.expires_at = None

    def get_token(self):
        """Obtém token do Spotify, reutilizando se ainda válido"""
        if self.token and self.expires_at and datetime.now() < self.expires_at:
            return self.token

        # Obter novo token
        try:
            auth_string = f"{self.client_id}:{self.client_secret}"
            auth_bytes = auth_string.encode('utf-8')
            auth_base64 = base64.b64encode(auth_bytes).decode('utf-8')

            headers = {
                'Authorization': f'Basic {auth_base64}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }

            data = {'grant_type': 'client_credentials'}

            response = requests.post(
                'https://accounts.spotify.com/api/token',
                headers=headers,
                data=data,
                timeout=10
            )

            if response.status_code == 200:
                token_data = response.json()
                self.token = token_data['access_token']
                expires_in = token_data['expires_in']
                self.expires_at = datetime.now() + timedelta(seconds=expires_in - 60)
                return self.token
            else:
                print(f"Erro ao obter token Spotify: {response.status_code}")
                return None
        except Exception as e:
            print(f"Exceção ao obter token Spotify: {str(e)}")
            return None

# Inicializar gerenciador de tokens
token_manager = SpotifyTokenManager(
    client_id='6b5cdcb34b384ce795186aae26220918',
    client_secret='bd24ed38cfbd46b0ba1243132a1a7c38'
)

# ========================================
# CLASSE DE RECOMENDAÇÃO
# ========================================
class MusicRecommender:
    def __init__(self, df, feature_matrix):
        self.df = df

        # Converter np.matrix para np.ndarray se necessário
        if hasattr(feature_matrix, 'A'):
            print("Convertendo feature_matrix de np.matrix para np.ndarray...")
            self.feature_matrix = np.asarray(feature_matrix)
        else:
            self.feature_matrix = feature_matrix

        print(f"Feature matrix shape: {self.feature_matrix.shape}")

    def get_recommendations(self, track_ids, genre_to_explore=None, n_recommendations=100):
        """
        Gera recomendações baseadas nas faixas selecionadas
        """
        # Encontrar índices das faixas selecionadas
        selected_indices = []
        for track_id in track_ids:
            idx = self.df[self.df['id'] == track_id].index
            if len(idx) > 0:
                selected_indices.append(idx[0])

        if not selected_indices:
            print("Nenhuma faixa selecionada encontrada no dataset")
            return pd.DataFrame()

        print(f"Processando {len(selected_indices)} faixas selecionadas...")

        # Para cada faixa selecionada, encontrar similares
        all_recommendations = []

        for idx in selected_indices:
            # Obter vetor de features da faixa
            track_vector = self.feature_matrix[idx:idx+1]

            # Converter matriz esparsa para array denso
            if hasattr(track_vector, 'toarray'):
                track_vector = track_vector.toarray()
            else:
                track_vector = np.asarray(track_vector)

            # Converter feature_matrix também se necessário
            if hasattr(self.feature_matrix, 'toarray'):
                feature_matrix_dense = self.feature_matrix.toarray()
            else:
                feature_matrix_dense = self.feature_matrix

            # Calcular similaridade com todas as outras faixas
            similarities = cosine_similarity(track_vector, feature_matrix_dense).flatten()

            # Criar DataFrame com resultados
            similar_df = pd.DataFrame({
                'id': self.df['id'].values,
                'similarity': similarities
            })

            # Remover a própria faixa e faixas já selecionadas
            similar_df = similar_df[~similar_df['id'].isin(track_ids)]

            # Selecionar top 20 mais similares
            top_similar = similar_df.nlargest(20, 'similarity')

            all_recommendations.append(top_similar)

        # Combinar todas as recomendações
        if all_recommendations:
            combined_recs = pd.concat(all_recommendations, ignore_index=True)
            combined_recs = combined_recs.sort_values('similarity', ascending=False)
            combined_recs = combined_recs.drop_duplicates(subset=['id'], keep='first')
        else:
            combined_recs = pd.DataFrame()

        # Potencializar similaridade (amplifica diferenças)
        if not combined_recs.empty:
            combined_recs['similarity'] = combined_recs['similarity'] ** 4

        # Mesclar com dados completos
        result = combined_recs.merge(self.df, on='id', how='left')

        # Aplicar penalização de repetição de artistas
        result = self._apply_artist_penalty(result)

        # Selecionar top n_recommendations
        result = result.head(n_recommendations)

        # ===== CORREÇÃO CRÍTICA: ADICIONAR SIMILARITY_SCORE =====
        result = self._calculate_display_scores(result)
        # ========================================================

        print(f"Geradas {len(result)} recomendações")

        return result

    def _apply_artist_penalty(self, df):
        """
        Aplica penalização exponencial para artistas repetidos
        """
        # Detectar nome da coluna de artista
        artist_col = 'artists' if 'artists' in df.columns else 'artist_name'

        artist_counts = {}
        penalties = []

        for artist in df[artist_col].values:
            count = artist_counts.get(artist, 0)
            penalty = 0.85 ** count
            penalties.append(penalty)
            artist_counts[artist] = count + 1

        df = df.copy()
        df['penalized_score'] = df['similarity'] * penalties
        df = df.sort_values('penalized_score', ascending=False)

        return df

    def _calculate_display_scores(self, df):
        """
        Calcula scores de exibição (70-99%) - IGUAL AO SISTEMA DE FILMES
        """
        if df.empty:
            return df

        df = df.copy()

        # Top 3 recebem scores fixos altos
        if len(df) >= 1:
            df.loc[df.index[0], 'final_score'] = np.random.uniform(98, 99)
        if len(df) >= 2:
            df.loc[df.index[1], 'final_score'] = np.random.uniform(96, 97)
        if len(df) >= 3:
            df.loc[df.index[2], 'final_score'] = np.random.uniform(95, 96)

        # Resto normalizado entre 70-94%
        if len(df) > 3:
            rest_df = df.iloc[3:].copy()
            scores = rest_df['penalized_score']
            min_score, max_score = scores.min(), scores.max()

            if max_score > min_score:
                score_norm = (scores - min_score) / (max_score - min_score)
                df.loc[rest_df.index, 'final_score'] = 70 + (score_norm ** 1.5) * (94 - 70)
            else:
                df.loc[rest_df.index, 'final_score'] = 82

        # Arredondar para inteiro
        df['similarity_score'] = df['final_score'].round(0).astype(int)

        return df

# ========================================
# CARREGAMENTO DE DADOS
# ========================================
print("\n" + "="*50)
print("Carregando cache de músicas (v14.0)...")
print("="*50)

cache_dir = os.path.join(os.path.dirname(__file__), 'cache')

try:
    # Carregar DataFrame
    df_music = pd.read_parquet(os.path.join(cache_dir, 'music_data.parquet'))

    # Remover coluna de índice se existir
    if 'Unnamed: 0' in df_music.columns:
        print("Removendo coluna 'Unnamed: 0'...")
        df_music = df_music.drop(columns=['Unnamed: 0'])

    # Carregar feature matrix
    with open(os.path.join(cache_dir, 'feature_matrix.pkl'), 'rb') as f:
        feature_matrix = pickle.load(f)

    # Carregar lista de gêneros
    with open(os.path.join(cache_dir, 'genres.json'), 'r', encoding='utf-8') as f:
        genres_list = json.load(f)

    # Inicializar recomendador
    recommender = MusicRecommender(df_music, feature_matrix)

    print(f"✓ Sistema de músicas pronto!")
    print(f"✓ {len(df_music)} faixas carregadas")
    print(f"✓ {len(genres_list)} gêneros disponíveis")
    print(f"✓ Colunas: {df_music.columns.tolist()}")
    print("="*50 + "\n")

except Exception as e:
    print(f"ERRO ao carregar dados: {str(e)}")
    import traceback
    traceback.print_exc()
    raise

# ========================================
# ROTAS DA API
# ========================================

@music_bp.route('/discover', methods=['GET'])
def discover():
    """Retorna músicas para descoberta inicial"""
    try:
        print("\n[GET /discover] Buscando músicas para descoberta...")

        # Músicas icônicas (populares)
        if 'popularity' in df_music.columns:
            iconic = df_music.nlargest(36, 'popularity')
        else:
            iconic = df_music.head(36)

        # Músicas para explorar (alta qualidade, diversas)
        if 'popularity' in df_music.columns:
            explore_df = df_music[df_music['popularity'] > 50]
            if len(explore_df) >= 36:
                explore = explore_df.sample(36)
            else:
                explore = explore_df
        else:
            explore = df_music.sample(min(36, len(df_music)))

        # Converter para dicionários
        iconic_list = iconic.to_dict('records')
        explore_list = explore.to_dict('records')

        print(f"✓ Retornando {len(iconic_list)} icônicas e {len(explore_list)} explorar")

        return jsonify({
            'iconic': iconic_list,
            'explore': explore_list
        })

    except Exception as e:
        print(f"✗ Erro em /discover: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Erro ao buscar músicas'}), 500

@music_bp.route('/genres', methods=['GET'])
def get_genres():
    """Retorna lista de gêneros disponíveis"""
    try:
        print(f"\n[GET /genres] Retornando {len(genres_list)} gêneros")
        return jsonify(genres_list)
    except Exception as e:
        print(f"✗ Erro em /genres: {str(e)}")
        return jsonify([])

@music_bp.route('/search', methods=['GET'])
def search():
    """Busca músicas por nome ou artista"""
    query = request.args.get('q', '').lower().strip()

    if not query:
        return jsonify([])

    try:
        print(f"\n[GET /search] Buscando por: '{query}'")

        # Detectar nomes de colunas
        name_col = 'name' if 'name' in df_music.columns else 'track_name'
        artist_col = 'artists' if 'artists' in df_music.columns else 'artist_name'

        # Buscar por nome ou artista
        mask = (
            df_music[name_col].str.lower().str.contains(query, na=False, regex=False) |
            df_music[artist_col].str.lower().str.contains(query, na=False, regex=False)
        )

        results = df_music[mask].head(50).to_dict('records')

        print(f"✓ Encontradas {len(results)} músicas")

        return jsonify(results)

    except Exception as e:
        print(f"✗ Erro em /search: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify([])

@music_bp.route('/recommend', methods=['POST'])
def recommend():
    """Gera recomendações baseadas em faixas selecionadas"""
    try:
        data = request.json
        track_ids = data.get('track_ids', [])
        genre = data.get('genre', None)

        print(f"\n[POST /recommend] Recebido:")
        print(f"  - {len(track_ids)} faixas")
        print(f"  - Gênero: {genre}")

        if len(track_ids) < 3:
            return jsonify({'error': 'Selecione pelo menos 3 músicas'}), 400

        # Obter recomendações
        recs_df = recommender.get_recommendations(track_ids, genre_to_explore=genre)

        if recs_df.empty:
            print("✗ Nenhuma recomendação gerada")
            return jsonify({'error': 'Não foi possível gerar recomendações'}), 500

        # Detectar nome da coluna de gênero
        genre_col = 'track_genre' if 'track_genre' in df_music.columns else 'genres'

        # Categorizar recomendações
        categories = {}
        used_ids = set()

        # 1. Principais (com similarity_score)
        main_recs = recs_df.head(12)
        categories['main'] = main_recs.to_dict('records')
        used_ids.update(main_recs['id'].values)

        # 2. Explorando gênero (se selecionado)
        if genre and genre_col in recs_df.columns:
            genre_recs = recs_df[
                (recs_df[genre_col] == genre) &
                (~recs_df['id'].isin(used_ids))
            ].head(6)

            if not genre_recs.empty:
                categories[f'exploring_{genre}'] = genre_recs.to_dict('records')
                used_ids.update(genre_recs['id'].values)

        # 3. Baseado em gênero dominante
        selected_tracks = df_music[df_music['id'].isin(track_ids)]
        if genre_col in selected_tracks.columns:
            dominant_genre = selected_tracks[genre_col].mode()

            if len(dominant_genre) > 0 and dominant_genre.iloc[0] != genre:
                genre_based = recs_df[
                    (recs_df[genre_col] == dominant_genre.iloc[0]) &
                    (~recs_df['id'].isin(used_ids))
                ].head(6)

                if not genre_based.empty:
                    categories[f'based_on_{dominant_genre.iloc[0]}'] = genre_based.to_dict('records')
                    used_ids.update(genre_based['id'].values)

        # 4. Joias escondidas
        if 'popularity' in recs_df.columns:
            hidden_gems = recs_df[
                (recs_df['popularity'] < 50) &
                (~recs_df['id'].isin(used_ids))
            ].head(6)

            if not hidden_gems.empty:
                categories['hidden_gems'] = hidden_gems.to_dict('records')

        # Analisar perfil do usuário
        profile = {
            'tracks': selected_tracks.to_dict('records')
        }

        if genre_col in selected_tracks.columns:
            dominant = selected_tracks[genre_col].mode()
            profile['dominant_genre'] = dominant.iloc[0] if len(dominant) > 0 else None
            profile['genres_found'] = selected_tracks[genre_col].unique().tolist()

        print(f"✓ Recomendações geradas com sucesso!")
        print(f"  - Categorias: {list(categories.keys())}")

        return jsonify({
            'recommendations': categories,
            'profile': profile,
            'selected_genre': genre
        })

    except Exception as e:
        print("\n" + "="*50)
        print("ERRO NA ROTA /api/music/recommend")
        print("="*50)
        import traceback
        traceback.print_exc()
        print("="*50 + "\n")
        return jsonify({'error': 'Erro ao gerar recomendações'}), 500

@music_bp.route('/get-track-details', methods=['POST'])
def get_track_details():
    """Busca metadados do Spotify para as faixas"""
    try:
        data = request.json
        track_ids = data.get('track_ids', [])

        if not track_ids:
            return jsonify({})

        print(f"\n[POST /get-track-details] Buscando detalhes de {len(track_ids)} faixas...")

        # Obter token
        token = token_manager.get_token()
        if not token:
            print("✗ Não foi possível obter token do Spotify")
            return jsonify({})

        # Buscar metadados em lote (máximo 50 por requisição)
        details = {}

        for i in range(0, len(track_ids), 50):
            batch = track_ids[i:i+50]
            ids_param = ','.join(batch)

            headers = {'Authorization': f'Bearer {token}'}
            response = requests.get(
                f'https://api.spotify.com/v1/tracks?ids={ids_param}',
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                tracks = response.json().get('tracks', [])
                for track in tracks:
                    if track:
                        track_id = track['id']
                        details[track_id] = {
                            'image_url': track['album']['images'][0]['url'] if track['album']['images'] else None,
                            'preview_url': track.get('preview_url')
                        }

        print(f"✓ Detalhes obtidos para {len(details)} faixas")

        return jsonify(details)

    except Exception as e:
        print(f"✗ Erro ao buscar detalhes: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({})

# ========================================
# CRIAR APLICAÇÃO FLASK
# ========================================
def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(music_bp)
    return app

if __name__ == '__main__':
    app = create_app()
    print("\n" + "="*50)
    print("Iniciando servidor Flask na porta 5002...")
    print("="*50 + "\n")
    app.run(debug=False, port=5002)