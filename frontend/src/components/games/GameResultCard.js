// frontend/src/components/games/GameResultCard.js (v3.0 - Final)
import React from 'react';

// Componente de Estilos para o Card de Resultado
const ResultCardStyles = () => (
  <style>{`
    .result-card-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .result-card-container {
      background-color: #1b2838;
      border-radius: 4px;
      overflow: hidden;
      transition: all 0.2s;
      border: 2px solid transparent;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative; /* Essencial para o score */
    }

    .result-card-container:hover {
      transform: scale(1.03);
      border-color: #66c0f4;
    }

    .result-card-image {
      width: 100%;
      display: block;
      aspect-ratio: 292 / 136;
      object-fit: cover;
      background-color: #2a475e;
    }

    .result-card-info {
      padding: 1rem;
      text-align: left;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .result-card-title {
      font-size: 1.1rem;
      color: #ffffff;
      margin-bottom: 0.25rem;
      font-weight: bold;
    }

    .result-card-genres {
      font-size: 0.9rem;
      color: #c7d5e0;
      opacity: 0.8;
      margin-top: auto;
    }

    /* O estilo que faltava! */
    .result-card-score {
      position: absolute;
      top: 8px;
      right: 8px;
      background-color: rgba(27, 40, 56, 0.8);
      backdrop-filter: blur(5px);
      color: #66c0f4;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: 700;
      z-index: 2;
      border: 1px solid rgba(102, 192, 244, 0.3);
    }
  `}</style>
);


function GameResultCard({ game }) {
  const score = game.similarity_score || 'N/A';
  // O backend agora envia 'genres' como uma string simples
  const genresText = game.genres || '';

  return (
    <>
      <ResultCardStyles />
      <a href={`https://store.steampowered.com/app/${game.appid}`} target="_blank" rel="noopener noreferrer" className="result-card-link">
        <div className="result-card-container">
          <div className="result-card-score">{score}%</div>
          <img src={game.header_image} alt={game.name} className="result-card-image" />
          <div className="result-card-info">
            <strong className="result-card-title">{game.name}</strong>
            <span className="result-card-genres">{genresText}</span>
          </div>
        </div>
      </a>
    </>
   );
}

export default GameResultCard;
