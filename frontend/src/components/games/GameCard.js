// frontend/src/components/games/GameCard.js (v5.0 - Padrão Steam Minimalista)
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CardStyles = () => (
  <style>{`
    .game-card-minimal {
      position: relative;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      background-color: #15202d;
      display: flex;
      flex-direction: column;
    }

    .game-card-minimal:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
    }

    .game-card-image-wrapper {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      overflow: hidden;
    }

    .game-card-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .game-card-minimal:hover .game-card-image {
      transform: scale(1.08);
    }

    .game-card-skeleton {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        #15202d 25%,
        #1e3548 50%,
        #15202d 75%
      );
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
    }

    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .game-card-info {
      padding: 1rem;
      background-color: #15202d;
    }

    .game-card-title {
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

    .game-card-genre {
      position: absolute;
      top: 8px;
      left: 8px;
      background-color: rgba(10, 14, 18, 0.8);
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

    .game-card-score {
      position: absolute;
      top: 8px;
      right: 8px;
      background: linear-gradient(135deg, rgba(74, 159, 216, 0.95), rgba(30, 53, 72, 0.95));
      color: #ffffff;
      padding: 0.3rem 0.6rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.3px;
      z-index: 5;
    }

    .game-card-selected {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 3px solid #4a9fd8;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(74, 159, 216, 0.6), inset 0 0 20px rgba(74, 159, 216, 0.2);
      pointer-events: none;
      z-index: 6;
    }

    .game-card-checkmark {
      position: absolute;
      top: 8px;
      left: 8px;
      background-color: #4a9fd8;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(74, 159, 216, 0.5);
      z-index: 10;
    }

    .game-card-checkmark svg {
      width: 16px;
      height: 16px;
      fill: #ffffff;
    }
  `}</style>
);

function GameCard({ game, onClick, isSelected }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const score = game.display_score ? `${Math.round(game.display_score)}%` : null;
  const genres = Array.isArray(game.genres) ? game.genres[0] : game.genres;

  return (
    <>
      <CardStyles />
      <motion.div
        className="game-card-minimal"
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="game-card-image-wrapper">
          {!imageLoaded && game.header_image && (
            <div className="game-card-skeleton" />
          )}

          {game.header_image && (
            <img
              src={game.header_image}
              alt={game.name}
              className="game-card-image"
              onLoad={() => setImageLoaded(true)}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          )}

          {genres && !isSelected && (
            <div className="game-card-genre">{genres}</div>
          )}

          {score && (
            <div className="game-card-score">{score}</div>
          )}

          {isSelected && (
            <>
              <motion.div
                className="game-card-selected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="game-card-checkmark"
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

        <div className="game-card-info">
          <h3 className="game-card-title">{game.name}</h3>
        </div>
      </motion.div>
    </>
  );
}

export default GameCard;

