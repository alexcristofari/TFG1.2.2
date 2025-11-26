// frontend/src/components/music/MusicResultsPage.js (v5.0 - Preto Minimalista + 4 Categorias)
import React from 'react';
import { motion } from 'framer-motion';
import MusicCard from './MusicCard';

const PageStyles = () => (
  <style>{`
    .music-results-container {
      min-height: 100vh;
      background-color: #0a0a0a;
      color: #f5f5f5;
      padding: 2rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .music-results-content {
      max-width: 1400px;
      width: 100%;
    }

    .music-results-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .music-results-title {
      font-size: 2rem;
      font-weight: 600;
      color: #1DB954;
      letter-spacing: -0.02em;
      margin-bottom: 0;
      line-height: 1.2;
    }

    .music-profile-summary {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 1.25rem 1.5rem;
      border-radius: 12px;
      margin: 2rem 0 3rem 0;
    }

    .music-profile-compact {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .music-profile-label {
      font-size: 0.85rem;
      color: #888;
      margin-right: 0.5rem;
    }

    .music-profile-tracks {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .music-profile-track-tag {
      background-color: rgba(29, 185, 84, 0.2);
      border: 1px solid rgba(29, 185, 84, 0.4);
      color: #f5f5f5;
      padding: 0.35rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 400;
      letter-spacing: 0.2px;
    }

    .music-profile-highlight {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background-color: rgba(29, 185, 84, 0.15);
      border: 1px solid rgba(29, 185, 84, 0.3);
      color: #f5f5f5;
      padding: 0.35rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 400;
      letter-spacing: 0.2px;
    }

    .music-category-section {
      margin: 3rem 0;
    }

    .music-category-title {
      font-size: 1.4rem;
      font-weight: 500;
      color: #f5f5f5;
      margin-bottom: 1.5rem;
      padding-bottom: 0;
      border-bottom: none;
      letter-spacing: -0.01em;
    }

    .music-results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    @media (max-width: 1200px) {
      .music-results-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .music-results-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;
      }

      .music-results-title {
        font-size: 2rem;
      }

      .music-category-title {
        font-size: 1.3rem;
      }
    }

    .music-back-button {
      background: linear-gradient(135deg, #1DB954, #148C40);
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

    .music-back-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(29, 185, 84, 0.4);
      background: linear-gradient(135deg, #148C40, #1DB954);
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

function MusicResultsPage({ recommendations, profile, onBack }) {
  const { main, hidden_gems, high_energy, genre_favorites } = recommendations || {};
  const { tracks, dominant_genre, selected_genre, genres_found } = profile || {};

  const renderCategory = (title, tracksList) => {
    if (!tracksList || tracksList.length === 0) return null;
    return (
      <motion.section className="music-category-section" variants={itemVariants}>
        <h2 className="music-category-title">{title}</h2>
        <div className="music-results-grid">
          {tracksList.map(track => (
            <MusicCard
              key={track.id}
              track={track}
              onClick={() => {}}
              isSelected={false}
            />
          ))}
        </div>
      </motion.section>
    );
  };

  return (
    <>
      <PageStyles />
      <motion.div
        className="music-results-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="music-results-content">
          <motion.header className="music-results-header" variants={itemVariants}>
            <h1 className="music-results-title">Suas Recomendações Musicais</h1>
          </motion.header>

          {profile && (tracks || dominant_genre || selected_genre) && (
            <motion.div className="music-profile-summary" variants={itemVariants}>
              <div className="music-profile-compact">
                {tracks && tracks.length > 0 && (
                  <div className="music-profile-tracks">
                    <span className="music-profile-label">Baseado em:</span>
                    {tracks.map(track => (
                      <span key={track.id} className="music-profile-track-tag">
                        {track.name || track.track_name}
                      </span>
                    ))}
                  </div>
                )}
                {dominant_genre && (
                  <span className="music-profile-highlight">
                    🎵 {dominant_genre}
                  </span>
                )}
                {selected_genre && (
                  <span className="music-profile-highlight">
                     Explorando: {selected_genre}
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {renderCategory("Recomendações Principais", main)}
          {renderCategory("Alta Energia", high_energy)}
          {renderCategory("Jóias Escondidas", hidden_gems)}
          {selected_genre && renderCategory(`Melhores de ${selected_genre}`, genre_favorites)}

          <motion.button
            className="music-back-button"
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

export default MusicResultsPage;