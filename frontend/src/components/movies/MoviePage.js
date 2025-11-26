// frontend/src/components/movies/MoviePage.js (v5.0 - Padrão Ouro Netflix)
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from './MovieCard';
import MovieResultsPage from './MovieResultsPage';

const PageStyles = () => (
  <style>{`
    .movies-minimal-container {
      min-height: 100vh;
      background-color: #0a0a0a;
      color: #f5f5f5;
      padding: 1rem 2rem 4rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .movies-minimal-content {
      max-width: 1400px;
      width: 100%;
    }

    .movies-top-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1.5rem;
      margin-top: 4.5rem;
      flex-wrap: wrap;
    }

    .movies-search-box {
      position: relative;
      flex: 2;
      min-width: 300px;
    }

    .movies-search-input {
      width: 100%;
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f5f5f5;
      padding: 0.85rem 0.85rem 0.85rem 2.5rem;
      font-size: 0.9rem;
      border-radius: 50px;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
    }

    .movies-search-input:focus {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: #E50914;
      box-shadow: 0 0 0 3px rgba(229, 9, 20, 0.1);
      outline: none;
    }

    .movies-search-input::placeholder {
      color: #a0a0a0;
    }

    .movies-search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      fill: #a0a0a0;
    }

    .movies-genre-select {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f5f5f5;
      padding: 0.85rem 1.2rem;
      border-radius: 50px;
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      flex: 1;
      min-width: 180px;
    }

    .movies-genre-select:hover {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .movies-genre-select:focus {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: #E50914;
      outline: none;
    }

    .movies-genre-select option {
      background-color: #1a1a1a;
      color: #f5f5f5;
    }

    .movies-recommend-btn-compact {
      background: linear-gradient(135deg, #E50914, #b40710);
      border: 1px solid rgba(229, 9, 20, 0.5);
      color: #f5f5f5;
      padding: 0.85rem 2rem;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }

    .movies-recommend-btn-compact:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(229, 9, 20, 0.3);
    }

    .movies-recommend-btn-compact:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }

    .movies-selected-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2rem;
      min-height: 2rem;
    }

    .movies-chip {
      background-color: rgba(229, 9, 20, 0.15);
      border: 1px solid rgba(229, 9, 20, 0.4);
      color: #f5f5f5;
      padding: 0.4rem 1rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 400;
      letter-spacing: 0.3px;
      transition: all 0.3s ease;
    }

    .movies-chip:hover {
      background-color: rgba(229, 9, 20, 0.25);
      border-color: #E50914;
    }

    .movies-section {
      margin: 3rem auto 0 auto;
    }

    .movies-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1.2rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1400px) {
      .movies-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (max-width: 1024px) {
      .movies-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .movies-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .movies-grid {
        grid-template-columns: 1fr;
      }
    }

    .movies-loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0a0a0a;
      z-index: 100;
    }

    .movies-loading-dots {
      display: flex;
      gap: 0.5rem;
    }

    .movies-loading-dot {
      width: 12px;
      height: 12px;
      background-color: #E50914;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .movies-loading-dot:nth-child(1) { animation-delay: -0.32s; }
    .movies-loading-dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .movies-pagination {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .movies-page-btn {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f5f5f5;
      padding: 0.65rem 1.3rem;
      border-radius: 50px;
      cursor: pointer;
      font-size: 0.85rem;
      font-family: 'Inter', sans-serif;
      transition: all 0.3s ease;
    }

    .movies-page-btn:hover:not(:disabled) {
      background-color: rgba(229, 9, 20, 0.2);
      border-color: #E50914;
      transform: translateY(-2px);
    }

    .movies-page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .movies-page-indicator {
      display: flex;
      align-items: center;
      color: #a0a0a0;
      font-size: 0.85rem;
      padding: 0 0.8rem;
    }
  `}</style>
);

const LoadingScreen = () => (
  <div className="movies-loading-screen">
    <div className="movies-loading-dots">
      <div className="movies-loading-dot"></div>
      <div className="movies-loading-dot"></div>
      <div className="movies-loading-dot"></div>
    </div>
  </div>
);

function MoviePage() {
  const [view, setView] = useState('discover');
  const [recommendationResults, setRecommendationResults] = useState(null);
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(true);
  const [popularReleases, setPopularReleases] = useState([]);
  const [criticallyAcclaimed, setCriticallyAcclaimed] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const MOVIES_PER_PAGE = 18;

  const allMovies = useMemo(() => {
    const combined = [...popularReleases, ...criticallyAcclaimed];
    const unique = combined.filter(
      (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
    );
    return unique.slice(0, 120);
  }, [popularReleases, criticallyAcclaimed]);

  const totalPages = Math.ceil(allMovies.length / MOVIES_PER_PAGE);
  const currentMovies = allMovies.slice(
    currentPage * MOVIES_PER_PAGE,
    (currentPage + 1) * MOVIES_PER_PAGE
  );

  useEffect(() => {
    Promise.all([
      axios.get('/api/movies/discover'),
      axios.get('/api/movies/genres')
    ]).then(([discoverRes, genresRes]) => {
      setPopularReleases(discoverRes.data.popular_releases || []);
      setCriticallyAcclaimed(discoverRes.data.critically_acclaimed || []);
      setGenres(genresRes.data || []);
      setIsDiscoverLoading(false);
    }).catch(error => {
      console.error('Erro ao carregar filmes:', error);
      setIsDiscoverLoading(false);
    });
  }, []);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const debouncedSearch = useMemo(() => {
    let timer;
    return (query) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const response = await axios.get(`/api/movies/search?q=${query}`);
          setSearchResults(response.data || []);
        } catch (error) {
          console.error('Erro na busca:', error);
        }
      }, 300);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      setCurrentPage(0);
    } else {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  const handleCardClick = (movie) => {
    setSelectedMovies((prev) =>
      prev.find((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, movie]
    );
  };

  const handleGetRecommendations = async () => {
    setIsRecommendLoading(true);
    const selectedIds = selectedMovies.map((m) => m.id);

    try {
      const response = await axios.post('/api/movies/recommend', {
        movie_ids: selectedIds,
        genre: selectedGenre
      });

      setRecommendationResults(response.data);
      setView('results');
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      alert('Erro ao gerar recomendações');
    } finally {
      setIsRecommendLoading(false);
    }
  };

  const handleReset = () => {
    setView('discover');
    setRecommendationResults(null);
    setSelectedMovies([]);
    setSearchQuery('');
    setSelectedGenre('');
    setCurrentPage(0);
  };

  const isSelected = (movie) => !!selectedMovies.find((m) => m.id === movie.id);
  const showDiscoverSections = searchQuery.length < 3;
  const canRecommend = selectedMovies.length >= 3;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  if (isDiscoverLoading || isRecommendLoading) return <LoadingScreen />;

  if (view === 'results') {
    return (
      <MovieResultsPage
        recommendations={recommendationResults.recommendations}
        profile={recommendationResults.profile}
        selectedGenre={selectedGenre}
        onBack={handleReset}
      />
    );
  }

  return (
    <>
      <PageStyles />
      <div className="movies-minimal-container">
        <div className="movies-minimal-content">
          <div className="movies-top-controls">
            <div className="movies-search-box">
              <svg className="movies-search-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="text"
                className="movies-search-input"
                placeholder="buscar filmes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="movies-genre-select"
              onChange={(e) => setSelectedGenre(e.target.value)}
              value={selectedGenre}
            >
              <option value="">gênero (opcional)</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <button
              className="movies-recommend-btn-compact"
              disabled={!canRecommend}
              onClick={handleGetRecommendations}
            >
              {canRecommend ? 'gerar recomendações' : `selecione ${3 - selectedMovies.length}`}
            </button>
          </div>

          <AnimatePresence>
            {selectedMovies.length > 0 && (
              <motion.div
                className="movies-selected-chips"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {selectedMovies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    className="movies-chip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                  >
                    {movie.title}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.section
              className="movies-section"
              key={showDiscoverSections ? 'discover' : 'search'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="movies-grid">
                {(showDiscoverSections ? currentMovies : searchResults).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={() => handleCardClick(movie)}
                    isSelected={isSelected(movie)}
                  />
                ))}
              </div>

              {showDiscoverSections && totalPages > 1 && (
                <div className="movies-pagination">
                  <button
                    className="movies-page-btn"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                  >
                    ← Anterior
                  </button>
                  <div className="movies-page-indicator">
                    {currentPage + 1} / {totalPages}
                  </div>
                  <button
                    className="movies-page-btn"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                  >
                    Próximo →
                  </button>
                </div>
              )}
            </motion.section>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default MoviePage;
