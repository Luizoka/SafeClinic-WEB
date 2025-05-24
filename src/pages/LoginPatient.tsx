import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService.ts';
import '../styles/auth.css';

export default function LoginPatient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { user } = await login(email, password);
      if (user.role === 'patient') {
        navigate('/painel/paciente');
      } else {
        setError('Acesso permitido apenas para pacientes.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container patient-theme">
      <div className="auth-card">
        <h2 className="auth-title">Login Paciente</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            className="auth-input"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">Entrar</button>
          {error && <p className="auth-error">{error}</p>}
        </form>
        <p className="auth-link">
          Não tem conta? <Link to="/registro/paciente">Registre-se</Link>
        </p>
      </div>
    </div>
  );
}