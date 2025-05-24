import React from 'react';
import styled from 'styled-components';
import { Container, Card } from '../styles/components.ts';

const AuthContainer = styled(Container)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
`;

const AuthCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  margin: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: var(--primary);
    font-size: 2rem;
    font-weight: 700;
  }
  
  p {
    color: var(--text-light);
    margin-top: 0.5rem;
  }
`;

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <AuthContainer>
      <AuthCard>
        <Logo>
          <h1>SafeClinic</h1>
          <p>{subtitle}</p>
        </Logo>
        {children}
      </AuthCard>
    </AuthContainer>
  );
};

export default AuthLayout; 