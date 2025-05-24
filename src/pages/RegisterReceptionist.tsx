import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerReceptionist } from '../services/authService.ts';
import '../styles/auth.css';

// Função para aplicar máscara de CPF
function maskCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Função para aplicar máscara de telefone (formato brasileiro)
function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

export default function RegisterReceptionist() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cpf: '',
    phone: '',
    work_shift: 'morning'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setFormData({ ...formData, cpf: maskCPF(value) });
    } else if (name === 'phone') {
      setFormData({ ...formData, phone: maskPhone(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      await registerReceptionist({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        cpf: formData.cpf,
        phone: formData.phone,
        work_shift: formData.work_shift
      });
      setSuccess('Recepcionista registrado com sucesso!');
      setTimeout(() => navigate('/login/recepcionista'), 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container receptionist-theme">
      <div className="auth-card">
        <h2 className="auth-title">Registro de Recepcionista</h2>
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
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleChange}
            required
          />
          <input
            className="auth-input"
            type="text"
            name="phone"
            placeholder="Telefone"
            value={formData.phone}
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
          <select
            className="auth-input"
            name="work_shift"
            value={formData.work_shift}
            onChange={handleChange}
            required
          >
            <option value="morning">Manhã</option>
            <option value="afternoon">Tarde</option>
            <option value="night">Noite</option>
          </select>
          <button type="submit" className="auth-button">Registrar</button>
          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}
        </form>
        <p className="auth-link">
          Já tem conta? <Link to="/login/recepcionista">Faça login</Link>
        </p>
        <p className="auth-link">
          Registrar outros usuários:&nbsp;
          <Link to="/registro/medico">Registrar Médico</Link> |{' '}
          <Link to="/registro/paciente">Registrar Paciente</Link>
        </p>
      </div>
    </div>
  );
}
