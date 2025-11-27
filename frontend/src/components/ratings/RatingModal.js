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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
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

const RatingSection = styled.div`
  margin-bottom: 25px;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 600;
  display: block;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Slider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 5px;
  background: linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%);
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    border: none;
  }
`;

const RatingValue = styled.div`
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  min-width: 50px;
  text-align: center;
`;

const TextArea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 18px;
  color: #fff;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #9333ea;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 25px;
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

const RatingModal = ({ isOpen, onClose, media }) => {
  const { createRating } = useData();
  const { token } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await createRating({
        midia_id: media.id,
        nota: rating,
        comentario: comment
      }, token);
      
      setMessage({ type: 'success', text: 'Avaliação salva com sucesso!' });
      
      setTimeout(() => {
        onClose();
        setRating(5);
        setComment('');
        setMessage(null);
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar avaliação' });
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
            <ModalTitle>Avaliar</ModalTitle>
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

          <RatingSection>
            <Label>Nota (0 a 10)</Label>
            <SliderContainer>
              <Slider
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
              />
              <RatingValue>{rating}</RatingValue>
            </SliderContainer>
          </RatingSection>

          <RatingSection>
            <Label>Comentário (Opcional)</Label>
            <TextArea
              placeholder="Escreva sua opinião sobre esta mídia..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
            />
          </RatingSection>

          <ButtonGroup>
            <Button onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              primary
              onClick={handleSubmit}
              disabled={loading}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? 'Salvando...' : 'Salvar Avaliação'}
            </Button>
          </ButtonGroup>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default RatingModal;