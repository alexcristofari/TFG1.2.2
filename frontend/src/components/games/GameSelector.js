// frontend/src/components/games/GameSelector.js (v3.0 - Minimal Clean Design)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SelectorStyles = () => (
  <style>{`
    .game-selector-minimal {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      margin: 2rem 0 4rem 0;
    }

    .game-selector-chips {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      min-height: 3rem;
      align-items: center;
    }

    .game-chip {
      background-color: rgba(42, 71, 94, 0.2);
      border: 1px solid rgba(42, 71, 94, 0.5);
      color: #f5f5f5;
      padding: 0.5rem 1.25rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 400;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    .game-chip:hover {
      background-color: rgba(42, 71, 94, 0.3);
      border-color: #2a475e;
    }

    .game-selector-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
    }

    .game-genre-select {
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

    .game-genre-select:hover {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .game-genre-select:focus {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: #2a475e;
      box-shadow: 0 0 0 3px rgba(42, 71, 94, 0.1);
    }

    .game-genre-select option {
      background-color: #1a1a1a;
      color: #f5f5f5;
    }

    .game-recommend-btn-minimal {
      background: linear-gradient(135deg, #2a475e, #1a3a4d);
      border: 1px solid rgba(42, 71, 94, 0.5);
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

    .game-recommend-btn-minimal:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(42, 71, 94, 0.3);
      background: linear-gradient(135deg, #1a3a4d, #2a475e);
    }

    .game-recommend-btn-minimal:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }

    .game-selector-hint {
      font-size: 0.8rem;
      color: #a0a0a0;
      text-align: center;
      letter-spacing: 0.5px;
    }
  `}</style>
);

function GameSelector({ selectedGames, onRecommend, genres = [], onGenreChange }) {
  const canRecommend = selectedGames.length >= 3;
  const remaining = Math.max(0, 3 - selectedGames.length);

  return (
    <>
      <SelectorStyles />
      <motion.div
        className="game-selector-minimal"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="game-selector-chips">
          <AnimatePresence>
            {selectedGames.length === 0 ? (
              <motion.p
                className="game-selector-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                selecione jogos clicando nas imagens abaixo
              </motion.p>
            ) : (
              selectedGames.map((game) => (
                <motion.div
                  key={game.appid}
                  className="game-chip"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  {game.name}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="game-selector-controls">
          <select
            className="game-genre-select"
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
            className="game-recommend-btn-minimal"
            disabled={!canRecommend}
            onClick={onRecommend}
            data-testid="recommend-btn"
          >
            {canRecommend
              ? 'gerar recomendações'
              : `selecione mais ${remaining} ${remaining === 1 ? 'jogo' : 'jogos'}`}
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default GameSelector;