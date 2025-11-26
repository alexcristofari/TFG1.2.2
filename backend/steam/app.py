# backend/steam/app.py (v13.9 - Algoritmo de Recomendação Aprimorado)
import pandas as pd
import numpy as np
import pickle
from sklearn.metrics.pairwise import cosine_similarity
from thefuzz import process
from flask import Flask, request, jsonify
import json
import traceback
from collections import defaultdict
import os

# --- Funções e Classes (sem mudanças, exceto a rota 'recommend') ---

def sanitize_for_json(data):
    if isinstance(data, (list, tuple)): return [sanitize_for_json(item) for item in data]
    if isinstance(data, dict): return {key: sanitize_for_json(value) for key, value in data.items()}
    if isinstance(data, np.ndarray): return data.tolist()
    if isinstance(data, (np.int64, np.int32, np.int16)): return int(data)
    if isinstance(data, (np.float64, np.float32)): return float(data)
    if pd.isna(data): return None
    return data

def check_genre_in_item(genres_item, target_genre):
    if genres_item is None: return False
    if isinstance(genres_item, list): return target_genre in genres_item
    if not isinstance(genres_item, str): genres_item = str(genres_item)
    return target_genre in genres_item

class GameRecommender:
    def __init__(self):
        self.is_ready = False
        try:
            print("Carregando cache de jogos (v13.9)...")
            base_dir = os.path.dirname(__file__)
            CACHE_DIR = os.path.join(base_dir, 'cache')
            self.df = pd.read_parquet(os.path.join(CACHE_DIR, 'games_processed_df.parquet'))
            
            # Carrega as matrizes
            with open(os.path.join(CACHE_DIR, 'genres_matrix.pkl'), 'rb') as f: self.genres_matrix = pickle.load(f)
            with open(os.path.join(CACHE_DIR, 'categories_matrix.pkl'), 'rb') as f: self.categories_matrix = pickle.load(f)
            with open(os.path.join(CACHE_DIR, 'description_matrix.pkl'), 'rb') as f: self.description_matrix = pickle.load(f)
            with open(os.path.join(CACHE_DIR, 'developers_matrix.pkl'), 'rb') as f: self.developers_matrix = pickle.load(f)
            with open(os.path.join(CACHE_DIR, 'games_genres.json'), 'r', encoding='utf-8') as f: self.genres = json.load(f)
            
            # Converte para np.ndarray se necessário
            if not isinstance(self.genres_matrix, np.ndarray): self.genres_matrix = self.genres_matrix.toarray()
            if not isinstance(self.categories_matrix, np.ndarray): self.categories_matrix = self.categories_matrix.toarray()
            if not isinstance(self.description_matrix, np.ndarray): self.description_matrix = self.description_matrix.toarray()
            if not isinstance(self.developers_matrix, np.ndarray): self.developers_matrix = self.developers_matrix.toarray()

            weights = {'genres': 4.0, 'categories': 3.0, 'description': 1.0, 'developers': 1.0}
            self.feature_matrix = (
                self.genres_matrix * weights['genres'] + self.categories_matrix * weights['categories'] +
                self.description_matrix * weights['description'] + self.developers_matrix * weights['developers']
            )
            self.df['release_year'] = pd.to_datetime(self.df['release_date'], errors='coerce', format='%d/%b./%Y', dayfirst=True).dt.year
            self.is_ready = True
            print(f">>> Sistema de jogos pronto. {len(self.df)} jogos e {len(self.genres)} gêneros carregados. <<<")
        except Exception as e:
            print(f"\n--- ERRO CRÍTICO AO CARREGAR CACHE DE JOGOS: {e} ---")
            traceback.print_exc()

    def get_df_as_records(self, df_to_convert):
        if df_to_convert is None or df_to_convert.empty: return []
        records = df_to_convert.to_dict('records')
        return sanitize_for_json(records)

    def search_games(self, query, limit=30):
        if not self.is_ready or not query: return []
        choices = self.df['name']
        results = process.extractBests(query, choices, score_cutoff=60, limit=limit)
        if not results: return []
        result_indices = [r[2] for r in results]
        return self.get_df_as_records(self.df.iloc[result_indices])

    def discover_games(self):
        if not self.is_ready: return {}, {}
        iconic_appids = [570, 730, 271590, 1091500, 292030, 1245620, 620, 413150]
        iconic_games = self.df[self.df['appid'].isin(iconic_appids)]
        explore_df = self.df[
            (self.df['quality'] > 0.92) &
            (~self.df['genres'].apply(lambda g: check_genre_in_item(g, 'Ação') or check_genre_in_item(g, 'Aventura') or check_genre_in_item(g, 'RPG') or check_genre_in_item(g, 'Estratégia')))
        ].sample(n=29, random_state=42)
        return self.get_df_as_records(iconic_games), self.get_df_as_records(explore_df)

    def get_recommendations(self, selected_game_ids, genre_to_explore=None):
        if not self.is_ready or not selected_game_ids: return pd.DataFrame()
        
        selected_indices = self.df.index[self.df['appid'].isin(selected_game_ids)].tolist()
        if not selected_indices: return pd.DataFrame()

        profile_vector = np.mean(self.feature_matrix[selected_indices], axis=0).reshape(1, -1)
        similarities = cosine_similarity(profile_vector, self.feature_matrix).flatten()

        recs_df = self.df.copy()
        recs_df['similarity'] = similarities
        
        # --- LÓGICA DE PONTUAÇÃO HÍBRIDA APRIMORADA ---
        # A similaridade agora tem um peso muito maior
        recs_df['hybrid_score'] = (recs_df['similarity'] ** 2) * (recs_df['quality'] * 0.5 + 0.5)

        # Boost para o gênero explorado
        if genre_to_explore:
            genre_mask = recs_df['genres'].apply(lambda g: check_genre_in_item(g, genre_to_explore))
            recs_df.loc[genre_mask, 'hybrid_score'] *= 1.2 # Boost de 20%

        # Penalidade para diversificar desenvolvedores
        developer_penalty_factor = 0.85
        developer_counts = defaultdict(int)
        penalized_scores = []
        
        # Remove os jogos de entrada e ordena pelo score híbrido
        final_df = recs_df[~recs_df['appid'].isin(selected_game_ids)].sort_values('hybrid_score', ascending=False)

        for _, row in final_df.iterrows():
            developers_list = row['developers']
            developer = developers_list[0] if isinstance(developers_list, list) and developers_list else 'N/A'
            penalty = developer_penalty_factor ** developer_counts[developer]
            penalized_scores.append(row['hybrid_score'] * penalty)
            developer_counts[developer] += 1
            
        final_df['penalized_score'] = penalized_scores
        final_df = final_df.sort_values('penalized_score', ascending=False)

        # --- LÓGICA DE DISPLAY SCORE (PORCENTAGEM) ---
        top_score_display, end_score_display = 99.0, 85.0
        if not final_df.empty:
            scores = final_df['penalized_score']
            max_score, min_score = scores.max(), scores.min()
            if max_score > min_score:
                final_df['display_score'] = end_score_display + ((scores - min_score) / (max_score - min_score)) * (top_score_display - end_score_display)
            else:
                final_df['display_score'] = top_score_display
        
        return final_df

# --- Rotas da API ---

app = Flask(__name__)
recommender = GameRecommender()

@app.route('/api/games/discover', methods=['GET'])
def discover():
    if not recommender.is_ready: return jsonify({"error": "Serviço de jogos indisponível"}), 503
    iconic, explore = recommender.discover_games()
    return jsonify({"iconic_games": iconic, "explore_games": explore})

@app.route('/api/games/genres', methods=['GET'])
def get_genres():
    if not recommender.is_ready: return jsonify({"error": "Serviço de jogos indisponível"}), 503
    return jsonify(recommender.genres)

@app.route('/api/games/search', methods=['GET'])
def search():
    if not recommender.is_ready: return jsonify({"error": "Serviço de jogos indisponível"}), 503
    query = request.args.get('q', '')
    results = recommender.search_games(query)
    return jsonify(results)

@app.route('/api/games/recommend', methods=['POST'])
def recommend():
    try:
        if not recommender.is_ready: return jsonify({"error": "Serviço de jogos indisponível"}), 503
        data = request.get_json()
        game_ids = data.get('game_ids')
        genre = data.get('genre')

        if not game_ids or len(game_ids) < 3:
            return jsonify({"error": "São necessários pelo menos 3 jogos."}), 400

        recs_df = recommender.get_recommendations(game_ids, genre_to_explore=genre)
        if recs_df.empty:
            return jsonify({"recommendations": {}, "profile": {}})

        # --- LÓGICA DE CATEGORIZAÇÃO SEM REPETIÇÃO ---
        used_appids = set(game_ids)
        
        def get_unique_recs(df, num, exclude_ids):
            recs = df[~df['appid'].isin(exclude_ids)].head(num)
            exclude_ids.update(recs['appid'].tolist())
            return recs

        main_recs = get_unique_recs(recs_df, 12, used_appids)
        hidden_gems = get_unique_recs(recs_df[recs_df['quality'] < 0.88], 6, used_appids)
        
        genre_favorites = pd.DataFrame()
        if genre:
            genre_recs_df = recs_df[recs_df['genres'].apply(lambda g: check_genre_in_item(g, genre))]
            genre_favorites = get_unique_recs(genre_recs_df, 6, used_appids)

        recommendations = {
            "main": recommender.get_df_as_records(main_recs),
            "hidden_gems": recommender.get_df_as_records(hidden_gems),
            "genre_favorites": recommender.get_df_as_records(genre_favorites),
        }

        profile_df = recommender.df[recommender.df['appid'].isin(game_ids)]
        all_genres = [g for genres_list in profile_df['genres'] for g in genres_list if g]
        dominant_genre = pd.Series(all_genres).mode()[0] if all_genres else "Variado"
        
        profile = {
            "games": recommender.get_df_as_records(profile_df),
            "dominant_genre": dominant_genre,
            "selected_genre": genre or ""
        }

        return jsonify({"recommendations": recommendations, "profile": profile})
    except Exception as e:
        print("\n--- ERRO NA ROTA /api/games/recommend ---")
        traceback.print_exc()
        print("-----------------------------------------\n")
        return jsonify({"error": "Ocorreu um erro interno no servidor."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
