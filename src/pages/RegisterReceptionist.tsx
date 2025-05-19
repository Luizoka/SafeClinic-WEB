import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerReceptionist } from '../services/authService.ts';

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
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
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
      setForm({ ...form, cpf: maskCPF(value) });
    } else if (name === 'phone') {
      setForm({ ...form, phone: maskPhone(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await registerReceptionist(form);
      setSuccess('Recepcionista registrado com sucesso!');
      setTimeout(() => navigate('/login/recepcionista'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar recepcionista.');
    }
  };

  return (
    <div>
      <h2>Registrar Recepcionista</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Senha" value={form.password} onChange={handleChange} required />
        <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} required maxLength={14} />
        <input name="phone" placeholder="Telefone" value={form.phone} onChange={handleChange} required maxLength={15} />
        <select name="work_shift" value={form.work_shift} onChange={handleChange} required>
          <option value="morning">Manhã</option>
          <option value="afternoon">Tarde</option>
          <option value="night">Noite</option>
        </select>
        <button type="submit">Registrar</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
      <p>
        Já tem conta? <Link to="/login/recepcionista">Login do Recepcionista</Link>
      </p>
      <p>
        Registrar outros usuários:&nbsp;
        <Link to="/registro/medico">Registrar Médico</Link> |{' '}
        <Link to="/registro/paciente">Registrar Paciente</Link>
      </p>
    </div>
  );
}
