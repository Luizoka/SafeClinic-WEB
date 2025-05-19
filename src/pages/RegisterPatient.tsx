import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerPatient } from '../services/authService.ts';

// Função para aplicar máscara de CPF
function maskCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function RegisterPatient() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    birthDate: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setForm({ ...form, cpf: maskCPF(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await registerPatient(form);
      setSuccess('Paciente registrado com sucesso!');
      setTimeout(() => navigate('/login/paciente'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar paciente.');
    }
  };

  return (
    <div>
      <h2>Registrar Paciente</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
        <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} required maxLength={14} />
        <input name="birthDate" type="date" placeholder="Data de Nascimento" value={form.birthDate} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Senha" value={form.password} onChange={handleChange} required />
        <button type="submit">Registrar</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
      <p>
        Já tem conta? <Link to="/login/paciente">Login do Paciente</Link>
      </p>
    </div>
  );
}
