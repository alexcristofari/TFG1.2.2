import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #030305ff 0%, #07070aff 50%, #050607ff 100%);
  padding: 80px 20px 40px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 48px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #c7d5e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CreateButton = styled(motion.button)`
  background: rgba(20, 20, 20, 0.85);
  color: #e0e0e0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 15px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(60, 60, 60, 0.9);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }
`;

const ListsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
`;

const ListCard = styled(motion.div)`
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(30, 30, 30, 0.7);
  }
`;

const ListIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(40, 40, 40, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 20px;
`;

const ListTitle = styled.h3`
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 10px 0;
`;

const ListDescription = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 20px 0;
  min-height: 40px;
`;

const ListStats = styled.div`
  display: flex;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const StatValue = styled.span`
  color: #e0e0e0;
  font-size: 20px;
  font-weight: 700;
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 100px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 100px;
  margin-bottom: 30px;
  opacity: 0.3;
`;

const EmptyText = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 20px;
  margin: 0 0 40px 0;
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 30px 0;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 20px;
  color: #fff;
  font-size: 16px;
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px 20px;
  color: #fff;
  font-size: 16px;
  margin-bottom: 30px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 15px;
`;

const ModalButton = styled(motion.button)`
  flex: 1;
  background: ${props => props.primary ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.primary ? '#000' : '#fff'};
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.primary ? '#fff' : 'rgba(255, 255, 255, 0.15)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
`;

const MyListsPage = ({ onNavigate, onSelectList }) => {
  const { lists, loadLists, createList } = useData();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    try {
      await loadLists(token);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    setCreating(true);
    try {
      await createList({ nome: newListName, descricao: newListDescription }, token);
      setShowCreateModal(false);
      setNewListName('');
      setNewListDescription('');
      fetchLists();
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      alert('Erro ao criar lista. Tente novamente.');
    } finally {
      setCreating(false);
    }
  };

  const handleListClick = (listId) => {
    onSelectList(listId);
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <Loading>Carregando suas listas...</Loading>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>Minhas Listas</Title>
          <CreateButton
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>+</span>
            Nova Lista
          </CreateButton>
        </Header>

        {lists && lists.length > 0 ? (
          <ListsGrid>
            {lists.map((list, index) => (
              <ListCard
                key={list.id}
                onClick={() => handleListClick(list.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <ListIcon>📋</ListIcon>
                <ListTitle>{list.nome}</ListTitle>
                <ListDescription>
                  {list.descricao || 'Sem descrição'}
                </ListDescription>
                <ListStats>
                  <StatItem>
                    <StatValue>{list.total_itens || 0}</StatValue>
                    <StatLabel>Mídias</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{new Date(list.criado_em).toLocaleDateString('pt-BR')}</StatValue>
                    <StatLabel>Criado</StatLabel>
                  </StatItem>
                </ListStats>
              </ListCard>
            ))}
          </ListsGrid>
        ) : (
          <EmptyState>
            <EmptyIcon>📝</EmptyIcon>
            <EmptyText>Você ainda não tem listas</EmptyText>
            <CreateButton
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>+</span>
              Criar Primeira Lista
            </CreateButton>
          </EmptyState>
        )}
      </Container>

      <AnimatePresence>
        {showCreateModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !creating && setShowCreateModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle>Criar Nova Lista</ModalTitle>
              <Input
                type="text"
                placeholder="Nome da lista *"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                disabled={creating}
                autoFocus
              />
              <TextArea
                placeholder="Descrição (opcional)"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                disabled={creating}
              />
              <ModalActions>
                <ModalButton
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </ModalButton>
                <ModalButton
                  primary
                  onClick={handleCreateList}
                  disabled={!newListName.trim() || creating}
                  whileTap={{ scale: 0.95 }}
                >
                  {creating ? 'Criando...' : 'Criar Lista'}
                </ModalButton>
              </ModalActions>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default MyListsPage;