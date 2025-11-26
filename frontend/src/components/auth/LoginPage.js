// frontend/src/components/auth/LoginPage.js (v2.0 - Com AuthContext)
import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// ... [MANTER TODOS OS ESTILOS IGUAIS - NÃO MUDOU NADA AQUI] ...
// (Copie todos os styled components do arquivo anterior)

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

const WelcomeMessage = styled(motion.div)`
  background-color: rgba(13, 122, 63, 0.15);
  border: 1px solid rgba(13, 122, 63, 0.3);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    color: #0d7a3f;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #a0a0a0;
    font-size: 0.95rem;
  }
`;

// ========================================
// COMPONENTE (MUDOU AQUI!)
// ========================================

function LoginPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    if (!formData.email || !formData.password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        // Usa o contexto para fazer login
        login(response.data.token, response.data.user);
        
        setSuccess(true);
        
        // Redirecionar para home após 2 segundos
        setTimeout(() => {
          onNavigate('home');
        }, 2000);
      }
    } catch (err) {
      console.error('Erro no login:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
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
        {success ? (
          <WelcomeMessage
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2>🎉 Bem-vindo de volta!</h2>
            <p>Redirecionando para home...</p>
          </WelcomeMessage>
        ) : (
          <>
            <Title>Entrar</Title>
            <Subtitle>Acesse sua conta do Recomendador Multimídia</Subtitle>
          </>
        )}

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </ErrorMessage>
        )}

        {!success && (
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                data-testid="login-email-input"
              />
            </InputGroup>

            <InputGroup>
              <Label htmlFor="password">Senha</Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Sua senha"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                data-testid="login-password-input"
              />
            </InputGroup>

            <Button 
              type="submit" 
              disabled={loading}
              data-testid="login-submit-btn"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
        )}

        {!success && (
          <>
            <LinkText>
              Não tem uma conta?{' '}
              <a onClick={() => onNavigate('register')}>
                Criar conta
              </a>
            </LinkText>

            <LinkText>
              <a onClick={() => onNavigate('home')}>
                ← Voltar para home
              </a>
            </LinkText>
          </>
        )}
      </FormCard>
    </PageContainer>
  );
}

export default LoginPage;