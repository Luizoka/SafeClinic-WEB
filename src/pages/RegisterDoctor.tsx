import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { registerDoctor } from '../services/authService.ts';
import { getSpecialities } from '../services/receptionistService.ts';

// Função para aplicar máscara de CPF
function maskCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function RegisterDoctor() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    crm: '',
    speciality_id: '',
    password: ''
  });
  const [specialities, setSpecialities] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getSpecialities()
      .then(res => setSpecialities(res.data))
      .catch(() => setSpecialities([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Validação dos campos obrigatórios
    if (!form.name.trim()) {
      setError('Nome é obrigatório.');
      return;
    }
    if (!form.email.trim()) {
      setError('E-mail é obrigatório.');
      return;
    }
    if (!form.cpf.trim() || form.cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF é obrigatório e deve ter 11 dígitos. Exemplo: 123.456.789-00');
      return;
    }
    const crmRegex = /^[A-Z0-9]{4,10}$/i;
    if (!form.crm.trim() || !crmRegex.test(form.crm)) {
      setError('CRM deve ter de 4 a 10 caracteres, apenas letras e números. Exemplo: 1234SP');
      return;
    }
    if (!form.speciality_id) {
      setError('Especialidade é obrigatória.');
      return;
    }
    if (!form.password.trim() || form.password.length < 6) {
      setError('Senha é obrigatória e deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      await registerDoctor({
        ...form,
        cpf: form.cpf.replace(/\D/g, ''),
      });
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
        <input name="cpf" placeholder="CPF (ex: 123.456.789-00)" value={form.cpf} onChange={handleChange} required maxLength={14} />
        <input
          name="crm"
          placeholder="CRM (4 a 10 letras/números, ex: 1234SP)"
          value={form.crm}
          onChange={handleChange}
          required
          maxLength={10}
        />
        <select
          name="speciality_id"
          value={form.speciality_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecione a especialidade</option>
          {specialities.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input name="password" type="password" placeholder="Senha (mín. 6 caracteres)" value={form.password} onChange={handleChange} required />
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
