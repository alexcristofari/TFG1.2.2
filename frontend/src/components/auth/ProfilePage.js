import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  const containerStyle = {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#1e2837',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    color: '#c7d5e0',
    marginTop: '50px',
    textAlign: 'center'
  };

  const titleStyle = {
    color: '#66c0f4',
    marginBottom: '30px',
    fontSize: '2.5rem',
    fontWeight: 300
  };

  const infoStyle = {
    textAlign: 'left',
    margin: '20px 0',
    fontSize: '1.1rem',
    borderBottom: '1px solid #3a475a',
    paddingBottom: '10px'
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#99a8b5',
    display: 'inline-block',
    width: '150px'
  };

  const valueStyle = {
    color: '#e0e0e0'
  };

  const buttonStyle = {
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '30px',
    transition: 'background-color 0.3s ease'
  };

  const handleLogout = () => {
    logout();
    onNavigate('home'); // Volta para a home após o logout
  };

  if (!user) {
    return (
      <div style={containerStyle}>
        <h2 style={titleStyle}>Perfil do Usuário</h2>
        <p>Você precisa estar logado para ver esta página.</p>
        <button 
          style={{...buttonStyle, backgroundColor: '#2980b9'}} 
          onClick={() => onNavigate('login')}
        >
          Fazer Login
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Perfil de {user.name}</h2>
      
      <div style={infoStyle}>
        <span style={labelStyle}>Nome:</span>
        <span style={valueStyle}>{user.name}</span>
      </div>
      
      <div style={infoStyle}>
        <span style={labelStyle}>Email:</span>
        <span style={valueStyle}>{user.email}</span>
      </div>
      
      <div style={infoStyle}>
        <span style={labelStyle}>ID do Usuário:</span>
        <span style={valueStyle}>{user.id}</span>
      </div>
      
      <div style={infoStyle}>
        <span style={labelStyle}>Data de Criação:</span>
        <span style={valueStyle}>{user.data_criacao || 'N/A'}</span>
      </div>
      
      <div style={infoStyle}>
        <span style={labelStyle}>Último Login:</span>
        <span style={valueStyle}>{user.ultimo_login || 'N/A'}</span>
      </div>

      <button 
        style={buttonStyle} 
        onClick={handleLogout}
      >
        Sair (Logout)
      </button>
    </div>
  );
};

export default ProfilePage;