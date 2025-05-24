import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

export const Button = styled.button`
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-light);
  }

  &.secondary {
    background: var(--secondary);
    
    &:hover {
      filter: brightness(0.9);
    }
  }

  &.outline {
    background: transparent;
    border: 2px solid var(--primary);
    color: var(--primary);

    &:hover {
      background: var(--primary);
      color: var(--white);
    }
  }
`;

export const Card = styled.div`
  background: var(--white);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

export const Title = styled.h1`
  font-size: 2rem;
  color: var(--text);
  margin-bottom: 1.5rem;
`;

export const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: 1rem;
`;

export const Text = styled.p`
  color: var(--text-light);
  line-height: 1.6;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

export const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Badge = styled.span`
  background: var(--primary-light);
  color: var(--white);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;

  &.success {
    background: var(--success);
  }

  &.error {
    background: var(--error);
  }

  &.warning {
    background: var(--warning);
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  color: var(--text);
  font-weight: 500;
`;

export const ErrorMessage = styled.p`
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
`; 