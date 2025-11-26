// frontend/src/components/lists/MyListsPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000';

// Estilos
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  padding: 80px 40px 40px;
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #0d7a3f;
`;

const CreateButton = styled.button`
  background: #0d7a3f;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #0f8f4a;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(13, 122, 63, 0.3);
  }
`;

const ListsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const ListCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(13, 122, 63, 0.5);
    transform: translateY(-4px);
  }
`;

const ListTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #f5f5f5;
`;

const ListDescription = styled.p`
  font-size: 0.9rem;
  color: #a0a0a0;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const ListInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
`;

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
  margin-bottom: 24px;
  color: #0d7a3f;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f5f5f5;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #0d7a3f;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f5f5f5;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #0d7a3f;
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
    &:hover {
      background: #0f8f4a;
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: #f5f5f5;
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #a0a0a0;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 12px;
    color: #666;
  }
  
  p {
    font-size: 1rem;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #0d7a3f;
  font-size: 1.2rem;
`;

function MyListsPage({ onNavigate }) {
  const { token, isAuthenticated } = useAuth();
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [novaLista, setNovaLista] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }
    fetchListas();
  }, []);

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
      }
    } catch (error) {
      console.error('Erro ao buscar listas:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarLista = async () => {
    if (!novaLista.nome.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/listas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novaLista)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowModal(false);
        setNovaLista({ nome: '', descricao: '' });
        fetchListas();
      }
    } catch (error) {
      console.error('Erro ao criar lista:', error);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>Carregando listas...</LoadingState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Minhas Listas</Title>
        <CreateButton onClick={() => setShowModal(true)}>
          + Nova Lista
        </CreateButton>
      </Header>

      {listas.length === 0 ? (
        <EmptyState>
          <h3>Nenhuma lista criada</h3>
          <p>Crie sua primeira lista para organizar suas mídias favoritas!</p>
        </EmptyState>
      ) : (
        <ListsGrid>
          {listas.map((lista) => (
            <ListCard
              key={lista.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ListTitle>{lista.nome}</ListTitle>
              <ListDescription>
                {lista.descricao || 'Sem descrição'}
              </ListDescription>
              <ListInfo>
                <span>{lista.total_itens} {lista.total_itens === 1 ? 'item' : 'itens'}</span>
                <span>{new Date(lista.data_criacao).toLocaleDateString('pt-BR')}</span>
              </ListInfo>
            </ListCard>
          ))}
        </ListsGrid>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle>Criar Nova Lista</ModalTitle>
              
              <Input
                type="text"
                placeholder="Nome da lista"
                value={novaLista.nome}
                onChange={(e) => setNovaLista({ ...novaLista, nome: e.target.value })}
              />
              
              <TextArea
                placeholder="Descrição (opcional)"
                value={novaLista.descricao}
                onChange={(e) => setNovaLista({ ...novaLista, descricao: e.target.value })}
              />
              
              <ButtonGroup>
                <Button onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button primary onClick={criarLista}>
                  Criar Lista
                </Button>
              </ButtonGroup>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

export default MyListsPage;