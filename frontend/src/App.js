// frontend/src/App.js (v8.1 - Com suporte a listas e ratings)
import React, { useState } from 'react';
import './App.css';

// Importa os componentes de página
import HomePage from './components/home/HomePage';
import GamesPage from './components/games/GamesPage';
import MusicPage from './components/music/MusicPage';
import MoviePage from './components/movies/MoviePage';
// Novos componentes de informação
import AboutSimilarity from './components/info/AboutSimilarity';
import ContactPage from './components/info/ContactPage';
// Componentes de autenticação
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
// Componente de Perfil (NOVO)
import ProfilePage from './components/auth/ProfilePage';
// Componentes de listas
import MyListsPage from './components/lists/MyListsPage';
import ListDetailPage from './components/lists/ListDetailPage';
// Componentes de ratings (NOVO)
import MyRatingsPage from './components/ratings/MyRatingsPage';

// Importa os Providers
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componente interno para ter acesso ao contexto
function AppContent() {
  const [activeSystem, setActiveSystem] = useState('home');
  const [selectedListaId, setSelectedListaId] = useState(null);
  // Estados para controlar a visibilidade dos modais
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  
  // Pega o estado de loading e o status do Contexto Global
  const { isLoading, loadingStatus } = useData();
  const { isAuthenticated, user } = useAuth();

  // Estilos do botão de voltar (PRETO MINIMALISTA)
  const backButtonStyle = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 1000,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    backdropFilter: 'blur(5px)',
    color: '#e0e0e0',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '50px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease'
  };

  const handleMouseOver = (e) => {
    e.currentTarget.style.backgroundColor = 'rgba(60, 60, 60, 0.9)';
    e.currentTarget.style.color = '#ffffff';
  };

  const handleMouseOut = (e) => {
    e.currentTarget.style.backgroundColor = 'rgba(20, 20, 20, 0.85)';
    e.currentTarget.style.color = '#e0e0e0';
  };

  const renderBackButton = () => (
    <button
      onClick={() => setActiveSystem('home')}
      style={backButtonStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      data-testid="back-button"
    >
      ‹ Voltar para Home
    </button>
  );

  // Se não estiver na home e os dados estiverem carregando, mostra tela de loading
  if (isLoading && activeSystem !== 'home' && activeSystem !== 'login' && activeSystem !== 'register') {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#121a25', color: '#c7d5e0', flexDirection: 'column'
      }}>
        <h1 style={{ color: '#66c0f4', fontWeight: 300, fontSize: '2.5rem' }}>Recomendador Multimídia</h1>
        <p style={{ fontSize: '1.2rem', marginTop: '-1rem' }}>{loadingStatus}</p>
      </div>
    );
  }

  // Renderiza o sistema ativo
  const renderActiveSystem = () => {
    switch (activeSystem) {
      case 'games':
        return (
          <>
            {renderBackButton()}
            <GamesPage onNavigate={setActiveSystem} />
          </>
        );
      case 'music':
        return (
          <>
            {renderBackButton()}
            <MusicPage onNavigate={setActiveSystem} />
          </>
        );
      case 'movies':
        return (
          <>
            {renderBackButton()}
            <MoviePage onNavigate={setActiveSystem} />
          </>
        );
      case 'my-lists':
        return (
          <>
            {renderBackButton()}
            <MyListsPage 
              onNavigate={setActiveSystem}
              onSelectList={(listaId) => {
                setSelectedListaId(listaId);
                setActiveSystem('list-detail');
              }}
            />
          </>
        );
      case 'list-detail':
        return (
          <>
            {renderBackButton()}
            <ListDetailPage 
              listaId={selectedListaId}
              onNavigate={setActiveSystem}
            />
          </>
        );
      case 'my-ratings': // NOVA ROTA
        return (
          <>
            {renderBackButton()}
            <MyRatingsPage />
          </>
        );
      case 'login':
        return <LoginPage onNavigate={setActiveSystem} />;
      case 'register':
        return <RegisterPage onNavigate={setActiveSystem} />;
      case 'profile': // NOVA ROTA
        return (
          <>
            {renderBackButton()}
            <ProfilePage onNavigate={setActiveSystem} />
          </>
        );
      case 'home':
      default:
        // Passa as funções para abrir os modais para a HomePage
        return (
          <HomePage 
            onSelectSystem={setActiveSystem}
            onOpenAbout={() => setShowAbout(true)}
            onOpenContact={() => setShowContact(true)}
          />
        );
    }
  };

  return (
    <div className="App">
      <main>
        {renderActiveSystem()}
      </main>
      
      {/* Renderiza os modais fora do switch, controlados pelos estados showAbout/showContact */}
      <AboutSimilarity isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <ContactPage isOpen={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}

// Componente App principal envolve o AppContent com os Providers
function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;