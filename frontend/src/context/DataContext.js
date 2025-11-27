// frontend/src/context/DataContext.js (v2.0 - COM SUPORTE A LISTAS)
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [gamesData, setGamesData] = useState({ iconic: [], explore: [], genres: [] });
  const [musicData, setMusicData] = useState({ iconic: [], explore: [], genres: [] });
  const [moviesData, setMoviesData] = useState({ popular: [], acclaimed: [], genres: [] });
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Iniciando...');
  
  // Estado para listas do usuário
  const [lists, setLists] = useState([]);

  useEffect(() => {
    async function fetchAllData() {
      // --- MODO DEPURACAO: Lista de URLs a serem buscadas ---
      const urlsToFetch = [
        { key: 'games', url: '/api/games/discover' },
        { key: 'gamesGenres', url: '/api/games/genres' },
        { key: 'music', url: '/api/music/discover' },
        { key: 'musicGenres', url: '/api/music/genres' },
        { key: 'movies', url: '/api/movies/discover' },
        { key: 'moviesGenres', url: '/api/movies/genres' },
      ];

      console.log(\"--- INICIANDO DEPURACAO DE REDE (FRONTEND) ---\");
      console.log(\"Tentando buscar as seguintes URLs:\", urlsToFetch.map(u => u.url));
      
      try {
        const promises = urlsToFetch.map(item => {
          console.log(`[FRONTEND] Criando promise para: ${item.url}`);
          return axios.get(item.url);
        });

        setLoadingStatus('Aquecendo sistemas...');
        const responses = await Promise.all(promises);
        console.log(\"[FRONTEND] Todas as promises foram resolvidas com sucesso!\");

        // Mapeia as respostas de volta para os dados
        const dataMap = responses.reduce((acc, response, index) => {
          const key = urlsToFetch[index].key;
          acc[key] = response.data;
          return acc;
        }, {});

        setGamesData({
          iconic: dataMap.games.iconic_games || [],
          explore: dataMap.games.explore_games || [],
          genres: dataMap.gamesGenres || [],
        });
        setMusicData({
          iconic: dataMap.music.iconic_tracks || [],
          explore: dataMap.music.explore_tracks || [],
          genres: dataMap.musicGenres || [],
        });
        setMoviesData({
          popular: dataMap.movies.popular_releases || [],
          acclaimed: dataMap.movies.critically_acclaimed || [],
          genres: dataMap.moviesGenres || [],
        });

        setLoadingStatus('Tudo pronto!');
        setIsLoading(false);

      } catch (error) {
        console.error(\"--- FALHA CRÍTICA NA REDE (FRONTEND) ---\", error);
        // --- MODO DEPURACAO: Mostra a URL exata que falhou ---
        if (error.response) {
          const failedUrl = error.config.url;
          console.error(`[FRONTEND] A URL que falhou foi: http://localhost:5000${failedUrl}` );
          console.error(`[FRONTEND] Status da falha: ${error.response.status}`);
          setLoadingStatus(`Erro ${error.response.status} ao buscar ${failedUrl}. Verifique os terminais.`);
        } else {
          setLoadingStatus(`Erro de conexão: ${error.message}. O API Gateway está rodando na porta 5000?`);
        }
      }
    }

    fetchAllData();
  }, []);

  // ===== FUNÇÕES DE LISTAS =====
  
  // Carregar todas as listas do usuário
  const loadLists = async (token) => {
    try {
      const response = await axios.get('/api/listas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLists(response.data);
      return response.data;
    } catch (error) {
      console.error('[DataContext] Erro ao carregar listas:', error);
      throw error;
    }
  };

  // Criar nova lista
  const createList = async (listData, token) => {
    try {
      const response = await axios.post('/api/listas', listData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadLists(token); // Recarrega as listas
      return response.data;
    } catch (error) {
      console.error('[DataContext] Erro ao criar lista:', error);
      throw error;
    }
  };

  // Obter detalhes de uma lista específica
  const getListDetails = async (listId, token) => {
    try {
      const response = await axios.get(`/api/listas/${listId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('[DataContext] Erro ao obter detalhes da lista:', error);
      throw error;
    }
  };

  // Atualizar lista
  const updateList = async (listId, listData, token) => {
    try {
      const response = await axios.put(`/api/listas/${listId}`, listData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadLists(token); // Recarrega as listas
      return response.data;
    } catch (error) {
      console.error('[DataContext] Erro ao atualizar lista:', error);
      throw error;
    }
  };

  // Deletar lista
  const deleteList = async (listId, token) => {
    try {
      await axios.delete(`/api/listas/${listId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadLists(token); // Recarrega as listas
    } catch (error) {
      console.error('[DataContext] Erro ao deletar lista:', error);
      throw error;
    }
  };

  // Adicionar mídia à lista
  const addMediaToList = async (listId, midiaId, token) => {
    try {
      const response = await axios.post(
        `/api/listas/${listId}/itens`,
        { midia_id: midiaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadLists(token); // Recarrega as listas
      return response.data;
    } catch (error) {
      console.error('[DataContext] Erro ao adicionar mídia à lista:', error);
      throw error;
    }
  };

  // Remover mídia da lista
  const removeMediaFromList = async (listId, itemId, token) => {
    try {
      await axios.delete(`/api/listas/${listId}/itens/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadLists(token); // Recarrega as listas
    } catch (error) {
      console.error('[DataContext] Erro ao remover mídia da lista:', error);
      throw error;
    }
  };

  const value = { 
    gamesData, 
    musicData, 
    moviesData, 
    isLoading, 
    loadingStatus,
    lists,
    loadLists,
    createList,
    getListDetails,
    updateList,
    deleteList,
    addMediaToList,
    removeMediaFromList
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}