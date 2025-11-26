// frontend/src/components/games/ResultsPage.js (v3.0 - Preto Minimalista + Todas Categorias)
import React from 'react';
import { motion } from 'framer-motion';
import GameCard from './GameCard';

const PageStyles = () => (
  <style>{`
    .results-page-container {
      min-height: 100vh;
      background-color: #0a0a0a;
      color: #f5f5f5;
      padding: 2rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .results-content {
      max-width: 1400px;
      width: 100%;
    }

    .results-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .results-title {
      font-size: 2rem;
      font-weight: 600;
      color: #1B2838;
      letter-spacing: -0.02em;
      margin-bottom: 0;
      line-height: 1.2;
    }

    .profile-summary {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 1.25rem 1.5rem;
      border-radius: 12px;
      margin: 2rem 0 3rem 0;
    }

    .profile-compact {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .profile-label {
      font-size: 0.85rem;
      color: #888;
      margin-right: 0.5rem;
    }

    .profile-games {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .profile-game-tag {
      background-color: rgba(27, 40, 56, 0.3);
      border: 1px solid rgba(27, 40, 56, 0.5);
      color: #f5f5f5;
      padding: 0.35rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 400;
      letter-spacing: 0.2px;
    }

    .profile-highlight {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background-color: rgba(27, 40, 56, 0.25);
      border: 1px solid rgba(27, 40, 56, 0.4);
      color: #f5f5f5;
      padding: 0.35rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 400;
      letter-spacing: 0.2px;
    }

    .category-section {
      margin: 3rem 0;
    }

    .category-title {
      font-size: 1.4rem;
      font-weight: 500;
      color: #f5f5f5;
      margin-bottom: 1.5rem;
      padding-bottom: 0;
      border-bottom: none;
      letter-spacing: -0.01em;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    @media (max-width: 1200px) {
      .results-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .results-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;
      }

      .results-title {
        font-size: 2rem;
      }

      .category-title {
        font-size: 1.3rem;
      }
    }

    .back-button {
      background: linear-gradient(135deg, #1B2838, #2C3E50);
      border: none;
      color: #f5f5f5;
      padding: 0.85rem 2rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.3px;
      margin: 3rem auto 2rem;
      display: block;
    }

    .back-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(27, 40, 56, 0.4);
      background: linear-gradient(135deg, #2C3E50, #1B2838);
    }
  `}</style>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function ResultsPage({ recommendations, profile, onBack }) {
  // Pegando TODAS as categorias que o backend retorna
  const categories = recommendations || {};
  const { games, dominant_genre, selected_genre, all_genres } = profile || {};

  // Mapeamento de categorias em inglês para português
  const categoryTitles = {
    'main': 'Recomendações Principais',
    'genre_favorites': selected_genre ? `Explorando ${selected_genre}` : 'Favoritos do Gênero',
    'famous': 'Jogos Famosos',
    'hidden_gems': 'Jóias Escondidas'
  };

  const renderCategory = (categoryKey, gamesList) => {
    if (!gamesList || gamesList.length === 0) return null;
    const title = categoryTitles[categoryKey] || categoryKey;
    return (
      <motion.section className="category-section" variants={itemVariants}>
        <h2 className="category-title">{title}</h2>
        <div className="results-grid">
          {gamesList.map(game => (
            <GameCard key={game.appid} game={game} onClick={() => {}} isSelected={false} />
          ))}
        </div>
      </motion.section>
    );
  };

  return (
    <>
      <PageStyles />
      <motion.div
        className="results-page-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="results-content">
          <motion.header className="results-header" variants={itemVariants}>
            <h1 className="results-title">Suas Recomendações de Jogos</h1>
          </motion.header>

          {profile && (games || dominant_genre || selected_genre) && (
            <motion.div className="profile-summary" variants={itemVariants}>
              <div className="profile-compact">
                {games && games.length > 0 && (
                  <div className="profile-games">
                    <span className="profile-label">Baseado em:</span>
                    {games.map(game => (
                      <span key={game.appid} className="profile-game-tag">
                        {game.name}
                      </span>
                    ))}
                  </div>
                )}
                {dominant_genre && (
                  <span className="profile-highlight">
                     {dominant_genre}
                  </span>
                )}
                {selected_genre && (
                  <span className="profile-highlight">
                     Explorando: {selected_genre}
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* Renderizar TODAS as categorias dinamicamente */}
          {Object.keys(categories).map((categoryKey) => (
            renderCategory(categoryKey, categories[categoryKey])
          ))}

          <motion.button
            className="back-button"
            onClick={onBack}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="back-to-discover-btn"
          >
            Fazer Nova Recomendação
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

export default ResultsPage;