import React from 'react';
import styled from 'styled-components';
import { Button, Input, Form, FormGroup, Label, ErrorMessage } from '../styles/components.ts';

const StyledInput = styled(Input)`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  
  &:focus {
    background: var(--white);
  }
`;

const SubmitButton = styled(Button)`
  margin-top: 1rem;
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
`;

const SwitchText = styled(ErrorMessage)`
  text-align: center;
  margin-top: 1.5rem;
`;

interface AuthFormProps {
  onSubmit: (e: React.FormEvent) => void;
  fields: {
    name: string;
    label: string;
    type: string;
    required?: boolean;
  }[];
  submitText: string;
  switchText?: string;
  switchAction?: () => void;
  switchButtonText?: string;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  fields,
  submitText,
  switchText,
  switchAction,
  switchButtonText,
  error
}) => {
  return (
    <Form onSubmit={onSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {fields.map((field) => (
        <FormGroup key={field.name}>
          <Label htmlFor={field.name}>{field.label}</Label>
          <StyledInput
            type={field.type}
            id={field.name}
            name={field.name}
            required={field.required}
          />
        </FormGroup>
      ))}

      <SubmitButton type="submit">
        {submitText}
      </SubmitButton>

      {switchText && switchAction && switchButtonText && (
        <SwitchText>
          {switchText}{' '}
          <Button
            className="outline"
            onClick={switchAction}
            type="button"
            style={{ padding: '0.5rem 1rem' }}
          >
            {switchButtonText}
          </Button>
        </SwitchText>
      )}
    </Form>
  );
};

export default AuthForm; 