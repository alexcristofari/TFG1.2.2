// frontend/src/components/movies/MovieCard.js (v5.0 - Padrão Ouro Netflix)
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CardStyles = () => (
  <style>{`
    .movie-card-minimal {
      position: relative;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      background-color: #1a1a1a;
      display: flex;
      flex-direction: column;
    }

    .movie-card-minimal:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
    }

    .movie-card-image-wrapper {
      position: relative;
      width: 100%;
      padding-bottom: 150%;
      overflow: hidden;
    }

    .movie-card-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .movie-card-minimal:hover .movie-card-image {
      transform: scale(1.08);
    }

    .movie-card-skeleton {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        #1a1a1a 25%,
        #2a2a2a 50%,
        #1a1a1a 75%
      );
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
    }

    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .movie-card-info {
      padding: 1rem;
      background-color: #1a1a1a;
    }

    .movie-card-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #f5f5f5;
      margin: 0;
      letter-spacing: 0.2px;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      min-height: 2.4em;
    }

    .movie-card-genre {
      position: absolute;
      top: 8px;
      left: 8px;
      background-color: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(4px);
      color: #a0a0a0;
      padding: 0.3rem 0.6rem;
      border-radius: 50px;
      font-size: 0.7rem;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.1);
      text-transform: lowercase;
      z-index: 5;
    }

    .movie-card-score {
      position: absolute;
      top: 8px;
      right: 8px;
      background: linear-gradient(135deg, rgba(229, 9, 20, 0.95), rgba(180, 7, 16, 0.95));
      color: #ffffff;
      padding: 0.3rem 0.6rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.3px;
      z-index: 5;
    }

    .movie-card-selected {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 3px solid #E50914;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(229, 9, 20, 0.6), inset 0 0 20px rgba(229, 9, 20, 0.2);
      pointer-events: none;
      z-index: 6;
    }

    .movie-card-checkmark {
      position: absolute;
      top: 8px;
      left: 8px;
      background-color: #E50914;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(229, 9, 20, 0.5);
      z-index: 10;
    }

    .movie-card-checkmark svg {
      width: 16px;
      height: 16px;
      fill: #ffffff;
    }
  `}</style>
);

function MovieCard({ movie, onClick, isSelected }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const score = movie.similarity_score ? `${Math.round(movie.similarity_score)}%` : null;
  const genres = movie.genres_list && movie.genres_list.length > 0 ? movie.genres_list[0] : null;

  return (
    <>
      <CardStyles />
      <motion.div
        className="movie-card-minimal"
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="movie-card-image-wrapper">
          {!imageLoaded && movie.poster_url && (
            <div className="movie-card-skeleton" />
          )}

          {movie.poster_url && (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="movie-card-image"
              onLoad={() => setImageLoaded(true)}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          )}

          {genres && !isSelected && (
            <div className="movie-card-genre">{genres}</div>
          )}

          {score && (
            <div className="movie-card-score">{score}</div>
          )}

          {isSelected && (
            <>
              <motion.div
                className="movie-card-selected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="movie-card-checkmark"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </motion.div>
            </>
          )}
        </div>

        <div className="movie-card-info">
          <h3 className="movie-card-title">{movie.title}</h3>
        </div>
      </motion.div>
    </>
  );
}

export default MovieCard;
