import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getPatients,
  getDoctors,
  getAppointmentsPaginated,
  getDoctorsBySpeciality,
  createAppointment
} from '../services/receptionistService.ts';
import '../styles/receptionistDashboard.css';

export default function ReceptionistDashboard() {
  const [tab, setTab] = useState<'patients' | 'doctors' | 'appointments'>('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    doctor_id: '',
    patient_id: '',
    date: '',
    time: '',
    notes: ''
  });
  const [specialityFilter, setSpecialityFilter] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  useEffect(() => {
    setError('');
    setLoading(true);
    if (tab === 'patients') {
      getPatients()
        .then(res => {
          console.log('API pacientes:', res.data);
          // Corrigido para pegar o array correto
          const arr = Array.isArray(res.data.patients) ? res.data.patients : [];
          setPatients(arr);
        })
        .catch(() => setError('Erro ao carregar pacientes.'))
        .finally(() => setLoading(false));
    } else if (tab === 'doctors') {
      getDoctors()
        .then(res => {
          console.log('API médicos:', res.data);
          const arr = Array.isArray(res.data.doctors) ? res.data.doctors : [];
          setDoctors(arr);
        })
        .catch(() => setError('Erro ao carregar médicos.'))
        .finally(() => setLoading(false));
    } else if (tab === 'appointments') {
      getAppointmentsPaginated()
        .then(res => {
          console.log('API consultas:', res.data);
          // Aqui o array está em res.data.data
          const arr = Array.isArray(res.data.data) ? res.data.data : [];
          setAppointments(arr);
        })
        .catch(() => setError('Erro ao carregar consultas.'))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  // Carregar médicos ao abrir o formulário de consulta, se necessário
  useEffect(() => {
    if (showAppointmentForm && doctors.length === 0) {
      getDoctors()
        .then(res => {
          const arr = Array.isArray(res.data.doctors) ? res.data.doctors : [];
          setDoctors(arr);
        })
        .catch(() => setDoctors([]));
    }
  }, [showAppointmentForm, doctors.length]);

  // Buscar médicos por especialidade ou listar todos ao abrir o formulário
  useEffect(() => {
    if (!showAppointmentForm) return; // Só atualiza quando o formulário está aberto
    if (specialityFilter.trim()) {
      getDoctorsBySpeciality(specialityFilter)
        .then(res => {
          const arr = Array.isArray(res.data.doctors) ? res.data.doctors : [];
          setFilteredDoctors(arr);
        })
        .catch(() => setFilteredDoctors([]));
    } else {
      setFilteredDoctors(doctors);
    }
  }, [specialityFilter, doctors, showAppointmentForm]);

  const handleAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAppointmentForm({ ...appointmentForm, [e.target.name]: e.target.value });
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      await createAppointment(appointmentForm);
      setCreateSuccess('Consulta criada com sucesso!');
      setTimeout(() => setCreateSuccess(''), 2000);
      setShowAppointmentForm(false);
      setAppointmentForm({
        doctor_id: '',
        patient_id: '',
        date: '',
        time: '',
        notes: ''
      });
      // Atualiza lista de consultas paginada
      getAppointmentsPaginated()
        .then(res => {
          const arr = Array.isArray(res.data.data) ? res.data.data : [];
          setAppointments(arr);
        });
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Erro ao criar consulta.');
      setTimeout(() => setCreateError(''), 3000);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Painel do Recepcionista</h2>
      </div>

      <div className="tab-container">
        <button 
          className={`tab-button ${tab === 'patients' ? 'active' : ''}`}
          onClick={() => setTab('patients')}
        >
          Pacientes
        </button>
        <button 
          className={`tab-button ${tab === 'doctors' ? 'active' : ''}`}
          onClick={() => setTab('doctors')}
        >
          Médicos
        </button>
        <button 
          className={`tab-button ${tab === 'appointments' ? 'active' : ''}`}
          onClick={() => setTab('appointments')}
        >
          Consultas
        </button>
      </div>

      <div className="action-bar">
        <Link to="/registro/paciente?admin=1" className="action-link">
          + Cadastrar novo paciente
        </Link>
        <Link to="/registro/medico?admin=1" className="action-link">
          + Cadastrar novo médico
        </Link>
        <button 
          className="action-button"
          onClick={() => setShowAppointmentForm(v => !v)}
        >
          {showAppointmentForm ? 'Cancelar' : '+ Criar nova consulta'}
        </button>
      </div>

      {showAppointmentForm && (
        <form onSubmit={handleCreateAppointment} className="appointment-form">
          <h4 className="form-title">Criar nova consulta</h4>
          
          <div className="form-group">
            <label className="form-label">
              Paciente
              <select
                className="form-select"
                name="patient_id"
                value={appointmentForm.patient_id}
                onChange={handleAppointmentChange}
                required
              >
                <option value="">Selecione...</option>
                {patients.map((p: any) => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.name || p.user?.name} - {p.email || p.user?.email}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              Especialidade
              <input
                className="form-input"
                type="text"
                placeholder="Filtrar especialidade (opcional)"
                value={specialityFilter}
                onChange={e => setSpecialityFilter(e.target.value)}
              />
              <span style={{ fontSize: 12, color: '#888', marginTop: 4, display: 'block' }}>
                (deixe em branco para listar todos)
              </span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              Médico
              <select
                className="form-select"
                name="doctor_id"
                value={appointmentForm.doctor_id}
                onChange={handleAppointmentChange}
                required
              >
                <option value="">Selecione...</option>
                {filteredDoctors.map((d: any) => (
                  <option key={d.user_id} value={d.user_id}>
                    {(typeof d.user?.name === 'string' ? d.user.name : '')}
                    {' - '}
                    {typeof d.speciality === 'string'
                      ? d.speciality
                      : (d.speciality?.name || '')}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              Data
              <input
                className="form-input"
                type="date"
                name="date"
                value={appointmentForm.date}
                onChange={handleAppointmentChange}
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              Hora
              <input
                className="form-input"
                type="time"
                name="time"
                value={appointmentForm.time}
                onChange={handleAppointmentChange}
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              Observações
              <textarea
                className="form-textarea"
                name="notes"
                value={appointmentForm.notes}
                onChange={handleAppointmentChange}
                rows={2}
              />
            </label>
          </div>

          <button 
            type="submit" 
            className="form-button"
            disabled={creating}
          >
            {creating ? 'Criando...' : 'Criar Consulta'}
          </button>

          {createError && <p className="error-message">{createError}</p>}
          {createSuccess && <p className="success-message">{createSuccess}</p>}
        </form>
      )}

      {loading && <p className="loading-message">Carregando...</p>}
      {error && <p className="error-message">{error}</p>}

      {tab === 'patients' && (
        <div className="data-grid">
          <h3 className="data-title">Pacientes</h3>
          {patients.length === 0 ? (
            <p className="empty-message">Não há pacientes cadastrados.</p>
          ) : (
            patients.map((patient: any) => (
              <div key={patient.user_id} className="data-card">
                <h4>{patient.name || patient.user?.name}</h4>
                <p>Email: {patient.email || patient.user?.email}</p>
                <p>CPF: {patient.cpf}</p>
                <p>Telefone: {patient.phone}</p>
                <p>Data de Nascimento: {new Date(patient.birthDate).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'doctors' && (
        <div className="data-grid">
          <h3 className="data-title">Médicos</h3>
          {doctors.length === 0 ? (
            <p className="empty-message">Não há médicos cadastrados.</p>
          ) : (
            doctors.map((doctor: any) => (
              <div key={doctor.user_id} className="data-card">
                <h4>{doctor.user?.name}</h4>
                <p>Email: {doctor.user?.email}</p>
                <p>CRM: {doctor.crm}</p>
                <p>Especialidade: {doctor.speciality?.name || doctor.speciality}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'appointments' && (
        <div className="data-grid">
          <h3 className="data-title">Consultas</h3>
          {appointments.length === 0 ? (
            <p className="empty-message">Não há consultas agendadas.</p>
          ) : (
            appointments.map((appointment: any) => (
              <div key={appointment.id} className="data-card">
                <h4>Consulta #{appointment.id}</h4>
                <p>Paciente: {appointment.patient?.name || appointment.patient?.user?.name}</p>
                <p>Médico: {appointment.doctor?.user?.name}</p>
                <p>Especialidade: {appointment.doctor?.speciality?.name || appointment.doctor?.speciality}</p>
                <p>Data: {new Date(appointment.date).toLocaleDateString()}</p>
                <p>Hora: {appointment.time}</p>
                {appointment.notes && <p>Observações: {appointment.notes}</p>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
