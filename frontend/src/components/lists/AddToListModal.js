import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(147, 51, 234, 0.5);
    border-radius: 10px;

    &:hover {
      background: rgba(147, 51, 234, 0.7);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ModalTitle = styled.h2`
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: rotate(90deg);
  }
`;

const MediaInfo = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const MediaTitle = styled.h3`
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 5px 0;
`;

const MediaType = styled.span`
  color: #9333ea;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
`;

const ListsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
`;

const ListItem = styled(motion.button)`
  background: ${props => props.selected ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)' : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${props => props.selected ? '#9333ea' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 15px 20px;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: ${props => props.selected ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateX(5px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CheckIcon = styled.span`
  font-size: 20px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
`;

const CreateListButton = styled(motion.button)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled(motion.button)`
  flex: 1;
  background: ${props => props.primary ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.primary ? '0 10px 30px rgba(147, 51, 234, 0.3)' : '0 5px 15px rgba(255, 255, 255, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled(motion.div)`
  padding: 12px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-weight: 500;
  text-align: center;
  background: ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.type === 'success' ? '#10b981' : '#ef4444'};
  border: 1px solid ${props => props.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
`;

const AddToListModal = ({ isOpen, onClose, media, onNavigate }) => {
  const { lists, addMediaToList } = useData();
  const { token } = useAuth();
  const [selectedListId, setSelectedListId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAddToList = async () => {
    if (!selectedListId) return;

    setLoading(true);
    setMessage(null);

    try {
      await addMediaToList(selectedListId, media.id, token);
      setMessage({ type: 'success', text: 'Mídia adicionada com sucesso!' });
      
      setTimeout(() => {
        onClose();
        setSelectedListId(null);
        setMessage(null);
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao adicionar mídia' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !media) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContent
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <ModalTitle>Adicionar à Lista</ModalTitle>
            <CloseButton onClick={onClose}>×</CloseButton>
          </ModalHeader>

          <MediaInfo>
            <MediaTitle>{media.titulo || media.nome}</MediaTitle>
            <MediaType>{media.tipo}</MediaType>
          </MediaInfo>

          {message && (
            <Message
              type={message.type}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {message.text}
            </Message>
          )}

          {lists && lists.length > 0 ? (
            <>
              <ListsContainer>
                {lists.map((list) => (
                  <ListItem
                    key={list.id}
                    selected={selectedListId === list.id}
                    onClick={() => setSelectedListId(list.id)}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                  >
                    <span>{list.nome}</span>
                    {selectedListId === list.id && <CheckIcon>✓</CheckIcon>}
                  </ListItem>
                ))}
              </ListsContainer>

              <ButtonGroup>
                <Button onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button
                  primary
                  onClick={handleAddToList}
                  disabled={!selectedListId || loading}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <>
              <EmptyMessage>
                Você ainda não tem listas. Crie uma para começar!
              </EmptyMessage>
              <CreateListButton
                onClick={() => {
                  onClose();
                  onNavigate('my-lists');
                }}
                whileTap={{ scale: 0.95 }}
              >
                + Criar Nova Lista
              </CreateListButton>
            </>
          )}
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default AddToListModal;