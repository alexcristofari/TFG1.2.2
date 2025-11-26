// frontend/src/components/auth/RegisterPage.js (v2.0 - Com AuthContext)
import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// ========================================
// ESTILOS
// ========================================

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #0a0a0a;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const FormCard = styled(motion.div)`
  background-color: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  max-width: 450px;
  width: 100%;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-family: 'Inter', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  color: #f5f5f5;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #a0a0a0;
  text-align: center;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: #f5f5f5;
`;

const Input = styled.input`
  font-family: 'Inter', sans-serif;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  color: #f5f5f5;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #0d7a3f;
    background-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(13, 122, 63, 0.1);
  }

  &::placeholder {
    color: #666;
  }
`;

const Button = styled.button`
  font-family: 'Inter', sans-serif;
  background-color: #0d7a3f;
  color: #f5f5f5;
  border: none;
  border-radius: 10px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    background-color: #0f8f4a;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(13, 122, 63, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled(motion.div)`
  background-color: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 10px;
  padding: 1rem;
  color: #f87171;
  font-size: 0.9rem;
  text-align: center;
`;

const SuccessMessage = styled(motion.div)`
  background-color: rgba(13, 122, 63, 0.1);
  border: 1px solid rgba(13, 122, 63, 0.3);
  border-radius: 10px;
  padding: 1rem;
  color: #0d7a3f;
  font-size: 0.9rem;
  text-align: center;
`;

const LinkText = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #a0a0a0;
  text-align: center;
  margin-top: 1.5rem;

  a {
    color: #0d7a3f;
    text-decoration: none;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// ========================================
// COMPONENTE
// ========================================

function RegisterPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Usa o contexto de autenticação
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpar erros ao digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validações básicas
    if (!formData.name || !formData.email || !formData.password) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        // Usa o contexto para fazer login automático
        login(response.data.token, response.data.user);
        
        setSuccess(true);
        
        // Redirecionar para home após 2 segundos
        setTimeout(() => {
          onNavigate('home');
        }, 2000);
      }
    } catch (err) {
      console.error('Erro no cadastro:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>Criar Conta</Title>
        <Subtitle>Junte-se ao Recomendador Multimídia</Subtitle>

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </ErrorMessage>
        )}

        {success && (
          <SuccessMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Conta criada com sucesso! Redirecionando...
          </SuccessMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Seu nome"
              value={formData.name}
              onChange={handleChange}
              disabled={loading || success}
              data-testid="register-name-input"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading || success}
              data-testid="register-email-input"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Senha</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              disabled={loading || success}
              data-testid="register-password-input"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading || success}
              data-testid="register-confirm-password-input"
            />
          </InputGroup>

          <Button 
            type="submit" 
            disabled={loading || success}
            data-testid="register-submit-btn"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </Form>

        <LinkText>
          Já tem uma conta?{' '}
          <a onClick={() => onNavigate('login')}>
            Fazer login
          </a>
        </LinkText>

        <LinkText>
          <a onClick={() => onNavigate('home')}>
            ← Voltar para home
          </a>
        </LinkText>
      </FormCard>
    </PageContainer>
  );
}

export default RegisterPage;