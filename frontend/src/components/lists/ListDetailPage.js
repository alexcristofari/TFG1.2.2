import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%);
  padding: 80px 20px 40px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  gap: 20px;
  flex-wrap: wrap;
`;

const TitleSection = styled.div`
  flex: 1;
  min-width: 300px;
`;

const BackButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-5px);
  }
`;

const Title = styled.h1`
  color: #fff;
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #fff 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.danger ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.danger ? '0 10px 30px rgba(239, 68, 68, 0.3)' : '0 10px 30px rgba(147, 51, 234, 0.3)'};
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px 30px;
  text-align: center;
`;

const StatValue = styled.div`
  color: #9333ea;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
`;

const MediaCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(30, 30, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(147, 51, 234, 0.3);
    border-color: #9333ea;
  }
`;

const MediaImage = styled.div`
  width: 100%;
  height: 180px;
  background: ${props => props.src ? `url(${props.src})` : 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)'};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 48px;
`;

const MediaTitle = styled.h3`
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MediaType = styled.div`
  color: #9333ea;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
`;

const RemoveButton = styled(motion.button)`
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.02);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.3;
`;

const EmptyText = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  margin: 0 0 30px 0;
`;

const EmptyButton = styled(motion.button)`
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(147, 51, 234, 0.3);
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
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
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 20px 0;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 18px;
  color: #fff;
  font-size: 16px;
  margin-bottom: 15px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #9333ea;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 18px;
  color: #fff;
  font-size: 16px;
  margin-bottom: 20px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #9333ea;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ModalButton = styled(motion.button)`
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
  }
`;

const ListDetailPage = ({ listaId, onNavigate }) => {
  const { getListDetails, updateList, deleteList, removeMediaFromList } = useData();
  const { token } = useAuth();

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    loadListDetails();
  }, [listaId]);

  const loadListDetails = async () => {
    setLoading(true);
    try {
      const data = await getListDetails(listaId, token);
      setList(data);
      setEditName(data.nome);
      setEditDescription(data.descricao || '');
    } catch (error) {
      console.error('Erro ao carregar detalhes da lista:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateList(listaId, { nome: editName, descricao: editDescription }, token);
      setShowEditModal(false);
      loadListDetails();
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta lista?')) {
      try {
        await deleteList(listaId, token);
        onNavigate('my-lists');
      } catch (error) {
        console.error('Erro ao deletar lista:', error);
      }
    }
  };

  const handleRemoveMedia = async (itemId) => {
    if (window.confirm('Remover esta mídia da lista?')) {
      try {
        await removeMediaFromList(listaId, itemId, token);
        loadListDetails();
      } catch (error) {
        console.error('Erro ao remover mídia:', error);
      }
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <Loading>Carregando...</Loading>
        </Container>
      </PageContainer>
    );
  }

  if (!list) {
    return (
      <PageContainer>
        <Container>
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyText>Lista não encontrada</EmptyText>
            <EmptyButton onClick={() => onNavigate('my-lists')}>
              Voltar para Minhas Listas
            </EmptyButton>
          </EmptyState>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <BackButton onClick={() => onNavigate('my-lists')} whileTap={{ scale: 0.95 }}>
          ← Voltar
        </BackButton>

        <Header>
          <TitleSection>
            <Title>{list.nome}</Title>
            {list.descricao && <Description>{list.descricao}</Description>}
          </TitleSection>

          <Actions>
            <ActionButton onClick={handleEdit} whileTap={{ scale: 0.95 }}>
              ✏️ Editar
            </ActionButton>
            <ActionButton danger onClick={handleDelete} whileTap={{ scale: 0.95 }}>
              🗑️ Excluir
            </ActionButton>
          </Actions>
        </Header>

        <Stats>
          <StatItem>
            <StatValue>{list.itens?.length || 0}</StatValue>
            <StatLabel>Mídias</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{new Date(list.criado_em).toLocaleDateString('pt-BR')}</StatValue>
            <StatLabel>Criado em</StatLabel>
          </StatItem>
        </Stats>

        {list.itens && list.itens.length > 0 ? (
          <MediaGrid>
            {list.itens.map((item) => (
              <MediaCard
                key={item.item_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <MediaImage src={item.imagem_url}>
                  {!item.imagem_url && '🎬'}
                </MediaImage>
                <MediaTitle>{item.titulo || item.nome}</MediaTitle>
                <MediaType>{item.tipo}</MediaType>
                <RemoveButton
                  onClick={() => handleRemoveMedia(item.item_id)}
                  whileTap={{ scale: 0.95 }}
                >
                  Remover
                </RemoveButton>
              </MediaCard>
            ))}
          </MediaGrid>
        ) : (
          <EmptyState>
            <EmptyIcon>📭</EmptyIcon>
            <EmptyText>Esta lista está vazia</EmptyText>
            <EmptyButton onClick={() => onNavigate('home')} whileTap={{ scale: 0.95 }}>
              Adicionar Mídias
            </EmptyButton>
          </EmptyState>
        )}
      </Container>

      <AnimatePresence>
        {showEditModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle>Editar Lista</ModalTitle>
              <Input
                type="text"
                placeholder="Nome da lista"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <TextArea
                placeholder="Descrição (opcional)"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <ModalActions>
                <ModalButton onClick={() => setShowEditModal(false)}>
                  Cancelar
                </ModalButton>
                <ModalButton primary onClick={handleSaveEdit} whileTap={{ scale: 0.95 }}>
                  Salvar
                </ModalButton>
              </ModalActions>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default ListDetailPage;