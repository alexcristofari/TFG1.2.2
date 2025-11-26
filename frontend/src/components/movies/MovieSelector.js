// frontend/src/components/movies/MovieSelector.js (v4.0 - Minimal Clean Design)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SelectorStyles = () => (
  <style>{`
    .movie-selector-minimal {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      margin: 2rem 0 4rem 0;
    }

    .movie-selector-chips {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      min-height: 3rem;
      align-items: center;
    }

    .movie-chip {
      background-color: rgba(229, 9, 20, 0.2);
      border: 1px solid rgba(229, 9, 20, 0.5);
      color: #f5f5f5;
      padding: 0.5rem 1.25rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 400;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    .movie-chip:hover {
      background-color: rgba(229, 9, 20, 0.3);
      border-color: #E50914;
    }

    .movie-selector-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
    }

    .movie-genre-select {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f5f5f5;
      padding: 0.85rem 1.5rem;
      border-radius: 50px;
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 200px;
    }

    .movie-genre-select:hover {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .movie-genre-select:focus {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: #E50914;
      box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.1);
      outline: none;
    }

    .movie-genre-select option {
      background-color: #1a1a1a;
      color: #f5f5f5;
    }

    .movie-recommend-btn-minimal {
      background: linear-gradient(135deg, #E50914, #b40710);
      border: 1px solid rgba(229, 9, 20, 0.5);
      color: #f5f5f5;
      padding: 0.85rem 2.5rem;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.5px;
    }

    .movie-recommend-btn-minimal:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(229, 9, 20, 0.3);
      background: linear-gradient(135deg, #b40710, #E50914);
    }

    .movie-recommend-btn-minimal:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }

    .movie-selector-hint {
      font-size: 0.8rem;
      color: #a0a0a0;
      text-align: center;
      letter-spacing: 0.5px;
    }
  `}</style>
);

function MovieSelector({ selectedMovies, onRecommend, genres = [], onGenreChange }) {
  const canRecommend = selectedMovies.length >= 3;
  const remaining = Math.max(0, 3 - selectedMovies.length);

  return (
    <>
      <SelectorStyles />
      <motion.div
        className="movie-selector-minimal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="movie-selector-chips">
          <AnimatePresence>
            {selectedMovies.length === 0 ? (
              <motion.p
                className="movie-selector-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                selecione filmes clicando nos pôsteres abaixo
              </motion.p>
            ) : (
              selectedMovies.map((movie) => (
                <motion.div
                  key={movie.id}
                  className="movie-chip"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  {movie.title}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="movie-selector-controls">
          <select
            className="movie-genre-select"
            onChange={(e) => onGenreChange(e.target.value)}
            data-testid="genre-select"
          >
            <option value="">gênero preferido (opcional)</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          <button
            className="movie-recommend-btn-minimal"
            disabled={!canRecommend}
            onClick={onRecommend}
            data-testid="recommend-btn"
          >
            {canRecommend
              ? 'gerar recomendações'
              : `selecione mais ${remaining} ${remaining === 1 ? 'filme' : 'filmes'}`}
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default MovieSelector;
