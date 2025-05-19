import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { registerDoctor } from '../services/authService.ts';

export default function RegisterDoctor() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    crm: '',
    speciality: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await registerDoctor(form);
      setSuccess('Médico registrado com sucesso!');
      setTimeout(() => {
        if (location.search.includes('admin=1')) {
          navigate('/painel/recepcionista');
        } else {
          navigate('/login/medico');
        }
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar médico.');
    }
  };

  return (
    <div>
      <h2>Registrar Médico</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
        <input name="crm" placeholder="CRM" value={form.crm} onChange={handleChange} required />
        <input name="speciality" placeholder="Especialidade" value={form.speciality} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Senha" value={form.password} onChange={handleChange} required />
        <button type="submit">Registrar</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
      <p>
        Já tem conta? <Link to="/login/medico">Login do Médico</Link>
      </p>
    </div>
  );
}
