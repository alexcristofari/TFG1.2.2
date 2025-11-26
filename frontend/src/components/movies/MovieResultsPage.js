import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import MovieCard from './MovieCard';

const PageStyles = () => (
  <style>{`
    .movies-results-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0c0c0cff 0%, #161515ff 100%);
      padding: 2rem;
    }

    .movies-results-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .movies-results-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .movies-results-title {
      font-size: 3rem;
      font-weight: 800;
      color: white;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .movies-profile-summary {
      background: rgba(8, 8, 8, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 3rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .movies-profile-title {
      font-size: 1.5rem;
      color: white;
      margin: 0 0 1rem 0;
      font-weight: 600;
    }

    .movies-profile-genres-label {
      color: rgba(255, 255, 255, 0.9);
      margin: 0 0 0.5rem 0;
      font-weight: 500;
    }

    .movies-profile-movies {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .movies-profile-movie-tag {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .movies-profile-highlights {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .movies-profile-highlight {
      background: linear-gradient(135deg, #c4132bff 0%, #d60c27ff 100%);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 4px 15px rgba(8, 0, 8, 0.4);
    }

    .movies-recommendation-section {
      margin-bottom: 4rem;
    }

    .movies-category-title {
      font-size: 2rem;
      color: white;
      margin: 0 0 1.5rem 0;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .movies-results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .movies-back-button {
      display: block;
      margin: 3rem auto 0;
      padding: 1rem 3rem;
      background: white;
      color: #0a0a0aff;
      border: none;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }

    .movies-back-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    @media (max-width: 768px) {
      .movies-results-title {
        font-size: 2rem;
      }

      .movies-category-title {
        font-size: 1.5rem;
      }

      .movies-results-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
      }
    }
  `}</style>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

function MovieResultsPage({ recommendations, profile, selectedGenre, onBack }) {
  const { main, genre_favorites, blockbusters, hidden_gems } = recommendations || {};
  const { movies, favorite_genre } = profile || {};

  const renderCategory = (title, moviesList) => {
    if (!moviesList || moviesList.length === 0) return null;
    return (
      <motion.section className="movies-recommendation-section" variants={itemVariants}>
        <h2 className="movies-category-title">{title}</h2>
        <div className="movies-results-grid">
          {moviesList.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
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
        className="movies-results-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="movies-results-content">
          <motion.header className="movies-results-header" variants={itemVariants}>
            <h1 className="movies-results-title">Suas Recomendações de Filmes</h1>
          </motion.header>

          {profile && (
            <motion.div className="movies-profile-summary" variants={itemVariants}>
              <h3 className="movies-profile-title">Seu Perfil de Filmes</h3>

              {movies && movies.length > 0 && (
                <>
                  <p className="movies-profile-genres-label">Filmes selecionados:</p>
                  <div className="movies-profile-movies">
                    {movies.map(movie => (
                      <span key={movie.id} className="movies-profile-movie-tag">
                        {movie.title}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <div className="movies-profile-highlights">
                {favorite_genre && (
                  <span className="movies-profile-highlight">
                    Gênero Dominante: {favorite_genre}
                  </span>
                )}
                {selectedGenre && (
                  <span className="movies-profile-highlight">
                    Explorando: {selectedGenre}
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {renderCategory("Recomendações Principais", main)}
          
          {selectedGenre && genre_favorites && genre_favorites.length > 0 && 
            renderCategory(`Explorando ${selectedGenre}`, genre_favorites)
          }
          
          {renderCategory("Blockbusters", blockbusters)}
          
          {renderCategory("Jóias Escondidas", hidden_gems)}

          <motion.button
            className="movies-back-button"
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

export default MovieResultsPage;