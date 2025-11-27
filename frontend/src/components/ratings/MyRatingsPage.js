import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import RatingModal from './RatingModal';

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
  margin-bottom: 50px;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #fff 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin: 0;
`;

const RatingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
`;

const RatingCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(30, 30, 46, 0.8) 0%, rgba(42, 42, 62, 0.8) 100%);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(147, 51, 234, 0.3);
    border-color: #9333ea;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 15px;
`;

const MediaInfo = styled.div`
  flex: 1;
`;

const MediaTitle = styled.h3`
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 5px 0;
`;

const MediaType = styled.span`
  color: #9333ea;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const RatingBadge = styled.div`
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  color: white;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 20px;
  font-weight: 700;
  min-width: 60px;
  text-align: center;
`;

const Comment = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.6;
  margin: 15px 0;
  font-style: italic;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 15px;
`;

const Date = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
`;

const EditButton = styled(motion.button)`
  background: rgba(147, 51, 234, 0.2);
  color: #9333ea;
  border: 1px solid rgba(147, 51, 234, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(147, 51, 234, 0.3);
    transform: scale(1.02);
  }
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
  margin: 0;
`;

const Loading = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
`;

const MyRatingsPage = ({ onNavigate }) => {
  const { loadMyRatings } = useData();
  const { token } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMedia, setEditingMedia] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const data = await loadMyRatings(token);
      setRatings(data);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rating) => {
    setEditingMedia({
      id: rating.midia_id,
      titulo: rating.titulo,
      tipo: rating.tipo
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingMedia(null);
    fetchRatings();
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <Loading>Carregando suas avaliações...</Loading>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>Minhas Avaliações</Title>
          <Subtitle>Todas as suas opiniões em um só lugar</Subtitle>
        </Header>

        {ratings && ratings.length > 0 ? (
          <RatingsGrid>
            {ratings.map((rating, index) => (
              <RatingCard
                key={rating.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CardHeader>
                  <MediaInfo>
                    <MediaTitle>{rating.titulo}</MediaTitle>
                    <MediaType>{rating.tipo}</MediaType>
                  </MediaInfo>
                  <RatingBadge>{rating.nota}</RatingBadge>
                </CardHeader>

                {rating.comentario && (
                  <Comment>"{rating.comentario}"</Comment>
                )}

                <CardFooter>
                  <Date>{new Date(rating.data_avaliacao).toLocaleDateString('pt-BR')}</Date>
                  <EditButton
                    onClick={() => handleEdit(rating)}
                    whileTap={{ scale: 0.95 }}
                  >
                    Editar
                  </EditButton>
                </CardFooter>
              </RatingCard>
            ))}
          </RatingsGrid>
        ) : (
          <EmptyState>
            <EmptyIcon>⭐</EmptyIcon>
            <EmptyText>Você ainda não avaliou nenhuma mídia</EmptyText>
          </EmptyState>
        )}
      </Container>

      <RatingModal
        isOpen={showEditModal}
        onClose={handleCloseModal}
        media={editingMedia}
      />
    </PageContainer>
  );
};

export default MyRatingsPage;