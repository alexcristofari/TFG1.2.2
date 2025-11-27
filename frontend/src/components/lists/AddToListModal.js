// frontend/src/components/lists/AddToListModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000';

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: #1a1a2e;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: #0d7a3f;
`;

const MediaTitle = styled.p`
  font-size: 1rem;
  color: #a0a0a0;
  margin-bottom: 24px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f5f5f5;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #0d7a3f;
  }
  
  option {
    background: #1a1a2e;
    color: #f5f5f5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  ${props => props.primary ? `
    background: #0d7a3f;
    color: white;
    &:hover { background: #0f8f4a; }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: #f5f5f5;
    &:hover { background: rgba(255, 255, 255, 0.15); }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  
  ${props => props.type === 'success' ? `
    background: rgba(13, 122, 63, 0.2);
    border: 1px solid rgba(13, 122, 63, 0.4);
    color: #4ade80;
  ` : props.type === 'error' ? `
    background: rgba(139, 0, 0, 0.2);
    border: 1px solid rgba(139, 0, 0, 0.4);
    color: #ff6b6b;
  ` : ''}
`;

const CreateListButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  background: rgba(13, 122, 63, 0.2);
  border: 1px solid rgba(13, 122, 63, 0.4);
  border-radius: 8px;
  color: #0d7a3f;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(13, 122, 63, 0.3);
  }
`;

function AddToListModal({ isOpen, onClose, midiaId, tituloMidia }) {
  const { token } = useAuth();
  const [listas, setListas] = useState([]);
  const [selectedListaId, setSelectedListaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      fetchListas();
      setMessage({ type: '', text: '' });
    }
  }, [isOpen]);

  const fetchListas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/listas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setListas(data.listas);
        if (data.listas.length > 0) {
          setSelectedListaId(data.listas[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar listas:', error);
    }
  };

  const adicionarMidia = async () => {
    if (!selectedListaId) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_URL}/api/listas/${selectedListaId}/itens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ midia_id: midiaId })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Mídia adicionada com sucesso!' });
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao adicionar mídia' });
      }
    } catch (error) {
      console.error('Erro ao adicionar mídia:', error);
      setMessage({ type: 'error', text: 'Erro ao adicionar mídia à lista' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Modal
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalTitle>Adicionar à Lista</ModalTitle>
          <MediaTitle>"{tituloMidia}"</MediaTitle>

          {message.text && (
            <Message type={message.type}>
              {message.text}
            </Message>
          )}

          {listas.length === 0 ? (
            <>
              <p style={{ color: '#a0a0a0', marginBottom: '16px' }}>
                Você ainda não tem listas. Crie uma para começar!
              </p>
              <CreateListButton onClick={() => {
                onClose();
                // Navegação para criar lista (implementar conforme necessário)
              }}>
                + Criar Nova Lista
              </CreateListButton>
            </>
          ) : (
            <>
              <Select
                value={selectedListaId}
                onChange={(e) => setSelectedListaId(e.target.value)}
                disabled={loading}
              >
                {listas.map((lista) => (
                  <option key={lista.id} value={lista.id}>
                    {lista.nome} ({lista.total_itens} {lista.total_itens === 1 ? 'item' : 'itens'})
                  </option>
                ))}
              </Select>

              <ButtonGroup>
                <Button onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button primary onClick={adicionarMidia} disabled={loading || !selectedListaId}>
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </ButtonGroup>
            </>
          )}
        </ModalContent>
      </Modal>
    </AnimatePresence>
  );
}

export default AddToListModal;