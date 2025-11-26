// frontend/src/components/games/GamesPage.js (v5.0 - Padrão Steam Minimalista)
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from './GameCard';
import ResultsPage from './ResultsPage';

const PageStyles = () => (
  <style>{`
    .games-minimal-container {
      min-height: 100vh;
      background-color: #0a0e12;
      color: #f5f5f5;
      padding: 1rem 2rem 4rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .games-minimal-content {
      max-width: 1400px;
      width: 100%;
    }

    .games-top-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1.5rem;
      margin-top: 4.5rem;
      flex-wrap: wrap;
    }

    .games-search-box {
      position: relative;
      flex: 2;
      min-width: 300px;
    }

    .games-search-input {
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

    .games-search-input:focus {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: #4a9fd8;
      box-shadow: 0 0 0 3px rgba(74, 159, 216, 0.1);
      outline: none;
    }

    .games-search-input::placeholder {
      color: #a0a0a0;
    }

    .games-search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      fill: #a0a0a0;
    }

    .games-genre-select {
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

    .games-genre-select:hover {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .games-genre-select:focus {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: #4a9fd8;
      outline: none;
    }

    .games-genre-select option {
      background-color: #15202d;
      color: #f5f5f5;
    }

    .games-recommend-btn-compact {
      background: linear-gradient(135deg, #4a9fd8, #1e3548);
      border: 1px solid rgba(74, 159, 216, 0.5);
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

    .games-recommend-btn-compact:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(74, 159, 216, 0.3);
    }

    .games-recommend-btn-compact:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }

    .games-selected-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2rem;
      min-height: 2rem;
    }

    .games-chip {
      background-color: rgba(74, 159, 216, 0.15);
      border: 1px solid rgba(74, 159, 216, 0.4);
      color: #f5f5f5;
      padding: 0.4rem 1rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 400;
      letter-spacing: 0.3px;
      transition: all 0.3s ease;
    }

    .games-chip:hover {
      background-color: rgba(74, 159, 216, 0.25);
      border-color: #4a9fd8;
    }

    .games-section {
      margin: 3rem auto 0 auto;
    }

    .games-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1.2rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1400px) {
      .games-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (max-width: 1024px) {
      .games-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .games-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .games-grid {
        grid-template-columns: 1fr;
      }
    }

    .games-loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0a0e12;
      z-index: 100;
    }

    .games-loading-dots {
      display: flex;
      gap: 0.5rem;
    }

    .games-loading-dot {
      width: 12px;
      height: 12px;
      background-color: #4a9fd8;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .games-loading-dot:nth-child(1) { animation-delay: -0.32s; }
    .games-loading-dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .games-pagination {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .games-page-btn {
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

    .games-page-btn:hover:not(:disabled) {
      background-color: rgba(74, 159, 216, 0.2);
      border-color: #4a9fd8;
      transform: translateY(-2px);
    }

    .games-page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .games-page-indicator {
      display: flex;
      align-items: center;
      color: #a0a0a0;
      font-size: 0.85rem;
      padding: 0 0.8rem;
    }
  `}</style>
);

const LoadingScreen = () => (
  <div className="games-loading-screen">
    <div className="games-loading-dots">
      <div className="games-loading-dot"></div>
      <div className="games-loading-dot"></div>
      <div className="games-loading-dot"></div>
    </div>
  </div>
);

function GamesPage() {
  const [view, setView] = useState('discover');
  const [recommendationResults, setRecommendationResults] = useState(null);
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(true);
  const [iconicGames, setIconicGames] = useState([]);
  const [exploreGames, setExploreGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const GAMES_PER_PAGE = 18; // 6x3 grid

  // Combina iconic e explore para ter mais jogos
  const allGames = useMemo(() => {
    const combined = [...iconicGames, ...exploreGames];
    // Remove duplicatas por appid
    const unique = combined.filter(
      (game, index, self) => index === self.findIndex((g) => g.appid === game.appid)
    );
    return unique.slice(0, 120); // Limita a 120 jogos como músicas
  }, [iconicGames, exploreGames]);

  const totalPages = Math.ceil(allGames.length / GAMES_PER_PAGE);
  const currentGames = allGames.slice(
    currentPage * GAMES_PER_PAGE,
    (currentPage + 1) * GAMES_PER_PAGE
  );

  useEffect(() => {
    Promise.all([
      axios.get('/api/games/discover'),
      axios.get('/api/games/genres')
    ]).then(([discoverRes, genresRes]) => {
      const iconic = discoverRes.data.iconic_games || [];
      const explore = discoverRes.data.explore_games || [];

      setIconicGames(iconic);
      setExploreGames(explore);
      setGenres(genresRes.data || []);
      setIsDiscoverLoading(false);
    }).catch(error => {
      console.error('Erro ao carregar jogos:', error);
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
          const response = await axios.get(`/api/games/search?q=${query}`);
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

  const handleCardClick = (game) => {
    setSelectedGames((prev) =>
      prev.find((g) => g.appid === game.appid)
        ? prev.filter((g) => g.appid !== game.appid)
        : [...prev, game]
    );
  };

  const handleGetRecommendations = async () => {
    setIsRecommendLoading(true);
    const selectedIds = selectedGames.map((g) => g.appid);

    try {
      const response = await axios.post('/api/games/recommend', {
        game_ids: selectedIds,
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
    setSelectedGames([]);
    setSearchQuery('');
    setSelectedGenre('');
    setCurrentPage(0);
  };

  const isSelected = (game) => !!selectedGames.find((g) => g.appid === game.appid);
  const showDiscoverSections = searchQuery.length < 3;
  const canRecommend = selectedGames.length >= 3;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  if (isDiscoverLoading || isRecommendLoading) return <LoadingScreen />;

  if (view === 'results') {
    return (
      <ResultsPage
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
      <div className="games-minimal-container">
        <div className="games-minimal-content">
          <div className="games-top-controls">
            <div className="games-search-box">
              <svg className="games-search-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="text"
                className="games-search-input"
                placeholder="buscar jogos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="games-genre-select"
              onChange={(e) => setSelectedGenre(e.target.value)}
              value={selectedGenre}
            >
              <option value="">gênero (opcional)</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <button
              className="games-recommend-btn-compact"
              disabled={!canRecommend}
              onClick={handleGetRecommendations}
            >
              {canRecommend ? 'gerar recomendações' : `selecione ${3 - selectedGames.length}`}
            </button>
          </div>

          <AnimatePresence>
            {selectedGames.length > 0 && (
              <motion.div
                className="games-selected-chips"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {selectedGames.map((game) => (
                  <motion.div
                    key={game.appid}
                    className="games-chip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                  >
                    {game.name}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.section
              className="games-section"
              key={showDiscoverSections ? 'discover' : 'search'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="games-grid">
                {(showDiscoverSections ? currentGames : searchResults).map((game) => (
                  <GameCard
                    key={game.appid}
                    game={game}
                    onClick={() => handleCardClick(game)}
                    isSelected={isSelected(game)}
                  />
                ))}
              </div>

              {showDiscoverSections && totalPages > 1 && (
                <div className="games-pagination">
                  <button
                    className="games-page-btn"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                  >
                    ← Anterior
                  </button>
                  <div className="games-page-indicator">
                    {currentPage + 1} / {totalPages}
                  </div>
                  <button
                    className="games-page-btn"
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

export default GamesPage;

