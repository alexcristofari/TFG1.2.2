// frontend/src/components/lists/ListDetailPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000';

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
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #0d7a3f;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  ${props => props.variant === 'primary' ? `
    background: #0d7a3f;
    color: white;
    &:hover { background: #0f8f4a; }
  ` : props.variant === 'danger' ? `
    background: #8b0000;
    color: white;
    &:hover { background: #a00000; }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: #f5f5f5;
    &:hover { background: rgba(255, 255, 255, 0.15); }
  `}
`;

const Description = styled.p`
  font-size: 1rem;
  color: #a0a0a0;
  line-height: 1.6;
`;

const MediaGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
`;

const MediaCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(13, 122, 63, 0.5);
    transform: translateY(-4px);
  }
`;

const MediaImage = styled.div`
  width: 100%;
  height: 180px;
  background: ${props => props.src ? `url(${props.src})` : '#2a2a3e'} center/cover;
  background-size: cover;
  background-position: center;
`;

const MediaInfo = styled.div`
  padding: 16px;
`;

const MediaTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MediaMeta = styled.div`
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 12px;
`;

const RemoveButton = styled.button`
  width: 100%;
  padding: 8px;
  background: rgba(139, 0, 0, 0.2);
  border: 1px solid rgba(139, 0, 0, 0.4);
  border-radius: 6px;
  color: #ff6b6b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(139, 0, 0, 0.4);
    color: #ff4444;
  }
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

const ModalButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #0d7a3f;
  font-size: 1.2rem;
`;

function ListDetailPage({ listaId, onNavigate }) {
  const { token, isAuthenticated } = useAuth();
  const [lista, setLista] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editData, setEditData] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }
    fetchListaDetalhes();
  }, [listaId]);

  const fetchListaDetalhes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/listas/${listaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setLista(data.lista);
        setEditData({ nome: data.lista.nome, descricao: data.lista.descricao });
      }
    } catch (error) {
      console.error('Erro ao buscar lista:', error);
    } finally {
      setLoading(false);
    }
  };

  const removerItem = async (itemId) => {
    try {
      const response = await fetch(`${API_URL}/api/listas/${listaId}/itens/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchListaDetalhes();
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const editarLista = async () => {
    try {
      const response = await fetch(`${API_URL}/api/listas/${listaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowEditModal(false);
        fetchListaDetalhes();
      }
    } catch (error) {
      console.error('Erro ao editar lista:', error);
    }
  };

  const deletarLista = async () => {
    try {
      const response = await fetch(`${API_URL}/api/listas/${listaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        onNavigate('my-lists');
      }
    } catch (error) {
      console.error('Erro ao deletar lista:', error);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>Carregando detalhes...</LoadingState>
      </PageContainer>
    );
  }

  if (!lista) {
    return (
      <PageContainer>
        <EmptyState>
          <h3>Lista não encontrada</h3>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <TitleRow>
          <Title>{lista.nome}</Title>
          <ButtonGroup>
            <Button variant="secondary" onClick={() => onNavigate('my-lists')}>
              ← Voltar
            </Button>
            <Button variant="primary" onClick={() => setShowEditModal(true)}>
              ✏️ Editar
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              🗑️ Deletar
            </Button>
          </ButtonGroup>
        </TitleRow>
        {lista.descricao && <Description>{lista.descricao}</Description>}
        <Description style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
          {lista.itens.length} {lista.itens.length === 1 ? 'item' : 'itens'} • 
          Criada em {new Date(lista.data_criacao).toLocaleDateString('pt-BR')}
        </Description>
      </Header>

      {lista.itens.length === 0 ? (
        <EmptyState>
          <h3>Lista vazia</h3>
          <p>Adicione mídias a esta lista navegando pelos jogos, músicas ou filmes!</p>
        </EmptyState>
      ) : (
        <MediaGrid>
          {lista.itens.map((item) => (
            <MediaCard
              key={item.item_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MediaImage src={item.imagem} />
              <MediaInfo>
                <MediaTitle>{item.titulo}</MediaTitle>
                <MediaMeta>
                  {item.tipo} • {item.genero} • {item.ano}
                </MediaMeta>
                <RemoveButton onClick={() => removerItem(item.item_id)}>
                  Remover da lista
                </RemoveButton>
              </MediaInfo>
            </MediaCard>
          ))}
        </MediaGrid>
      )}

      {/* Modal de Edição */}
      <AnimatePresence>
        {showEditModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle>Editar Lista</ModalTitle>
              
              <Input
                type="text"
                placeholder="Nome da lista"
                value={editData.nome}
                onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
              />
              
              <TextArea
                placeholder="Descrição (opcional)"
                value={editData.descricao}
                onChange={(e) => setEditData({ ...editData, descricao: e.target.value })}
              />
              
              <ModalButtonGroup>
                <Button onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={editarLista}>
                  Salvar Alterações
                </Button>
              </ModalButtonGroup>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Delete */}
      <AnimatePresence>
        {showDeleteModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle>Confirmar Exclusão</ModalTitle>
              
              <p style={{ marginBottom: '24px', color: '#a0a0a0' }}>
                Tem certeza que deseja deletar a lista <strong>{lista.nome}</strong>? 
                Esta ação não pode ser desfeita.
              </p>
              
              <ModalButtonGroup>
                <Button onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </Button>
                <Button variant="danger" onClick={deletarLista}>
                  Sim, Deletar
                </Button>
              </ModalButtonGroup>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

export default ListDetailPage;