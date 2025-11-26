// frontend/src/components/music/MusicPage.js (v5.3 - Mais músicas pop)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import MusicCard from './MusicCard';
import MusicResultsPage from './MusicResultsPage';

// ===== CACHE DE IMAGENS =====
const CACHE_KEY = 'spotify_images_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

const getImageCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return {};
    }
    return data;
  } catch {
    return {};
  }
};

const saveImageCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: cache,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Cache storage failed:', e);
  }
};

const PageStyles = () => (
  <style>{`
    .music-minimal-container {
      min-height: 100vh;
      background-color: #0a0a0a;
      color: #f5f5f5;
      padding: 1rem 2rem 4rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .music-minimal-content {
      max-width: 1400px;
      width: 100%;
    }

    .music-top-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1.5rem;
      margin-top: 4.5rem;
      flex-wrap: wrap;
    }

    .music-search-box {
      position: relative;
      flex: 2;
      min-width: 300px;
    }

    .music-search-input {
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

    .music-search-input:focus {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: #0d7a3f;
      box-shadow: 0 0 0 3px rgba(13, 122, 63, 0.1);
      outline: none;
    }

    .music-search-input::placeholder {
      color: #a0a0a0;
    }

    .music-search-icon {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      fill: #a0a0a0;
    }

    .music-genre-select {
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

    .music-genre-select:hover {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .music-genre-select:focus {
      background-color: rgba(255, 255, 255, 0.08);
      border-color: #0d7a3f;
      outline: none;
    }

    .music-genre-select option {
      background-color: #1a1a1a;
      color: #f5f5f5;
    }

    .music-recommend-btn-compact {
      background: linear-gradient(135deg, #0d7a3f, #0a5c30);
      border: 1px solid rgba(13, 122, 63, 0.5);
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

    .music-recommend-btn-compact:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(13, 122, 63, 0.3);
    }

    .music-recommend-btn-compact:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }

    .music-selected-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2rem;
      min-height: 2rem;
    }

    .music-chip {
      background-color: rgba(13, 122, 63, 0.15);
      border: 1px solid rgba(13, 122, 63, 0.4);
      color: #f5f5f5;
      padding: 0.4rem 1rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 400;
      letter-spacing: 0.3px;
      transition: all 0.3s ease;
    }

    .music-chip:hover {
      background-color: rgba(13, 122, 63, 0.25);
      border-color: #0d7a3f;
    }

    .music-section {
      margin: 3rem auto 0 auto;
    }

    .music-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1.2rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1400px) {
      .music-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    @media (max-width: 1024px) {
      .music-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .music-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .music-grid {
        grid-template-columns: 1fr;
      }
    }

    .music-loading-screen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #000000;
      z-index: 100;
    }

    .music-loading-dots {
      display: flex;
      gap: 0.5rem;
    }

    .music-loading-dot {
      width: 12px;
      height: 12px;
      background-color: #0d7a3f;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .music-loading-dot:nth-child(1) { animation-delay: -0.32s; }
    .music-loading-dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .music-pagination {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .music-page-btn {
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

    .music-page-btn:hover:not(:disabled) {
      background-color: rgba(13, 122, 63, 0.2);
      border-color: #0d7a3f;
      transform: translateY(-2px);
    }

    .music-page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .music-page-indicator {
      display: flex;
      align-items: center;
      color: #a0a0a0;
      font-size: 0.85rem;
      padding: 0 0.8rem;
    }
  `}</style>
);

const LoadingScreen = () => (
  <div className="music-loading-screen">
    <div className="music-loading-dots">
      <div className="music-loading-dot"></div>
      <div className="music-loading-dot"></div>
      <div className="music-loading-dot"></div>
    </div>
  </div>
);

function MusicPage() {
  const [view, setView] = useState('discover');
  const [recommendationResults, setRecommendationResults] = useState(null);
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(true);
  const [iconicTracks, setIconicTracks] = useState([]);
  const [exploreTracks, setExploreTracks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [imageCache, setImageCache] = useState(getImageCache());

  const TRACKS_PER_PAGE = 18; // Aumentado de 12 para 18 (6x3)

  // Processar todas as músicas sem filtro de gênero
  const allTracks = useMemo(() => {
    let primary = iconicTracks;
    
    // Ordenar por popularidade (maior primeiro)
    primary.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    const unique = primary.filter(
      (track, index, self) => index === self.findIndex((t) => t.id === track.id)
    );
    
    return unique.slice(0, 120); // Mostrar até 120 músicas
  }, [iconicTracks]);

  const totalPages = Math.ceil(allTracks.length / TRACKS_PER_PAGE);
  const currentTracks = allTracks.slice(
    currentPage * TRACKS_PER_PAGE,
    (currentPage + 1) * TRACKS_PER_PAGE
  );

  const fetchTrackDetailsBatch = useCallback(async (tracks) => {
    if (!tracks || tracks.length === 0) return [];

    const tracksNeedingFetch = tracks.filter(t => !imageCache[t.id]);
    
    if (tracksNeedingFetch.length === 0) {
      return tracks.map(t => ({
        ...t,
        image_url: imageCache[t.id]?.image_url,
        preview_url: imageCache[t.id]?.preview_url
      }));
    }

    try {
      const trackIds = tracksNeedingFetch.map(t => t.id);
      const response = await axios.post('/api/music/get-track-details', { track_ids: trackIds });
      
      const newCache = { ...imageCache };
      Object.keys(response.data).forEach(id => {
        newCache[id] = response.data[id];
      });
      setImageCache(newCache);
      saveImageCache(newCache);

      return tracks.map(track => ({
        ...track,
        image_url: newCache[track.id]?.image_url || imageCache[track.id]?.image_url,
        preview_url: newCache[track.id]?.preview_url || imageCache[track.id]?.preview_url
      }));
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      return tracks;
    }
  }, [imageCache]);

  useEffect(() => {
    Promise.all([
      axios.get('/api/music/discover'),
      axios.get('/api/music/genres')
    ]).then(async ([discoverRes, genresRes]) => {
      const iconic = discoverRes.data.iconic || [];
      const explore = discoverRes.data.explore || [];

      const [enrichedIconic, enrichedExplore] = await Promise.all([
        fetchTrackDetailsBatch(iconic),
        fetchTrackDetailsBatch(explore)
      ]);

      setIconicTracks(enrichedIconic);
      setExploreTracks(enrichedExplore);
      setGenres(genresRes.data || []);
      setIsDiscoverLoading(false);
    }).catch(error => {
      console.error('Erro ao carregar músicas:', error);
      setIsDiscoverLoading(false);
    });
  }, [fetchTrackDetailsBatch]);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages]);

  const debouncedSearch = useMemo(() => {
    let timer;
    return (query) => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const response = await axios.get(`/api/music/search?q=${query}`);
          const results = response.data || [];
          const enriched = await fetchTrackDetailsBatch(results);
          setSearchResults(enriched);
        } catch (error) {
          console.error('Erro na busca:', error);
        }
      }, 300);
    };
  }, [fetchTrackDetailsBatch]);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      setCurrentPage(0);
    } else {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  const handleCardClick = (track) => {
    setSelectedTracks((prev) =>
      prev.find((t) => t.id === track.id)
        ? prev.filter((t) => t.id !== track.id)
        : [...prev, track]
    );
  };

  const handleGetRecommendations = async () => {
    setIsRecommendLoading(true);
    const selectedIds = selectedTracks.map((t) => t.id);

    try {
      const response = await axios.post('/api/music/recommend', {
        track_ids: selectedIds,
        genre: selectedGenre
      });

      const allRecs = Object.values(response.data.recommendations).flat();
      const enriched = await fetchTrackDetailsBatch(allRecs);

      const enrichedRecs = {};
      Object.keys(response.data.recommendations).forEach(category => {
        enrichedRecs[category] = response.data.recommendations[category].map(track => {
          const found = enriched.find(e => e.id === track.id);
          return found || track;
        });
      });

      setRecommendationResults({
        ...response.data,
        recommendations: enrichedRecs
      });
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
    setSelectedTracks([]);
    setSearchQuery('');
    setSelectedGenre('');
    setCurrentPage(0);
  };

  const isSelected = (track) => !!selectedTracks.find((t) => t.id === track.id);
  const showDiscoverSections = searchQuery.length < 3;
  const canRecommend = selectedTracks.length >= 3;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  if (isDiscoverLoading || isRecommendLoading) return <LoadingScreen />;

  if (view === 'results') {
    return (
      <MusicResultsPage
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
      <div className="music-minimal-container">
        <div className="music-minimal-content">
          <div className="music-top-controls">
            <div className="music-search-box">
              <svg className="music-search-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="text"
                className="music-search-input"
                placeholder="buscar músicas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="music-genre-select"
              onChange={(e) => setSelectedGenre(e.target.value)}
              value={selectedGenre}
            >
              <option value="">gênero (opcional)</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <button
              className="music-recommend-btn-compact"
              disabled={!canRecommend}
              onClick={handleGetRecommendations}
            >
              {canRecommend ? 'gerar recomendações' : `selecione ${3 - selectedTracks.length}`}
            </button>
          </div>

          <AnimatePresence>
            {selectedTracks.length > 0 && (
              <motion.div
                className="music-selected-chips"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {selectedTracks.map((track) => (
                  <motion.div
                    key={track.id}
                    className="music-chip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                  >
                    {track.name}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.section
              className="music-section"
              key={showDiscoverSections ? 'discover' : 'search'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="music-grid">
                {(showDiscoverSections ? currentTracks : searchResults).map((track) => (
                  <MusicCard
                    key={track.id}
                    track={track}
                    onClick={() => handleCardClick(track)}
                    isSelected={isSelected(track)}
                  />
                ))}
              </div>

              {showDiscoverSections && totalPages > 1 && (
                <div className="music-pagination">
                  <button
                    className="music-page-btn"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                  >
                    ← Anterior
                  </button>
                  <div className="music-page-indicator">
                    {currentPage + 1} / {totalPages}
                  </div>
                  <button
                    className="music-page-btn"
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

export default MusicPage;

