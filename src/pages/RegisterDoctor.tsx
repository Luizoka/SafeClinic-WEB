import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerDoctor } from '../services/authService.ts';
import '../styles/auth.css';

export default function RegisterDoctor() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    crm: '',
    specialty: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      await registerDoctor({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        crm: formData.crm,
        specialty: formData.specialty
      });
      navigate('/login/medico');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container doctor-theme">
      <div className="auth-card">
        <h2 className="auth-title">Registro de Médico</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            className="auth-input"
            type="text"
            name="name"
            placeholder="Nome completo"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            type="text"
            name="crm"
            placeholder="CRM"
            value={formData.crm}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            type="text"
            name="specialty"
            placeholder="Especialidade"
            value={formData.specialty}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            type="password"
            name="confirmPassword"
            placeholder="Confirmar senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" className="auth-button">Registrar</button>
          {error && <p className="auth-error">{error}</p>}
        </form>
        <p className="auth-link">
          Já tem conta? <Link to="/login/medico">Faça login</Link>
        </p>
      </div>
    </div>
  );
}
