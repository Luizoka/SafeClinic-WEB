import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getPatients,
  getDoctors,
  getAppointmentsPaginated,
  getDoctorsBySpeciality,
  createAppointment
} from '../services/receptionistService.ts';

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
    <div>
      <h2>Painel do Recepcionista</h2>
      <div>
        <button onClick={() => setTab('patients')}>Pacientes</button>
        <button onClick={() => setTab('doctors')}>Médicos</button>
        <button onClick={() => setTab('appointments')}>Consultas</button>
      </div>
      <div style={{ margin: '16px 0' }}>
        <Link to="/registro/paciente?admin=1">
          + Cadastrar novo paciente
        </Link>
        {' | '}
        <Link to="/registro/medico?admin=1">
          + Cadastrar novo médico
        </Link>
        {' | '}
        <button onClick={() => setShowAppointmentForm(v => !v)}>
          {showAppointmentForm ? 'Cancelar' : '+ Criar nova consulta'}
        </button>
      </div>
      {showAppointmentForm && (
        <form onSubmit={handleCreateAppointment} style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16 }}>
          <h4>Criar nova consulta</h4>
          <div>
            <label>Paciente:&nbsp;
              <select
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
          <div>
            <label>Especialidade:&nbsp;
              <input
                type="text"
                placeholder="Filtrar especialidade (opcional)"
                value={specialityFilter}
                onChange={e => setSpecialityFilter(e.target.value)}
                style={{ width: 180 }}
              />
              <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
                (deixe em branco para listar todos)
              </span>
            </label>
          </div>
          <div>
            <label>Médico:&nbsp;
              <select
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
          <div>
            <label>Data:&nbsp;
              <input
                type="date"
                name="date"
                value={appointmentForm.date}
                onChange={handleAppointmentChange}
                required
              />
            </label>
          </div>
          <div>
            <label>Hora:&nbsp;
              <input
                type="time"
                name="time"
                value={appointmentForm.time}
                onChange={handleAppointmentChange}
                required
              />
            </label>
          </div>
          <div>
            <label>Observações:&nbsp;
              <textarea
                name="notes"
                value={appointmentForm.notes}
                onChange={handleAppointmentChange}
                rows={2}
                style={{ width: 250 }}
              />
            </label>
          </div>
          <button type="submit" disabled={creating}>Criar Consulta</button>
          {createError && <p style={{ color: 'red' }}>{createError}</p>}
          {createSuccess && <p style={{ color: 'green' }}>{createSuccess}</p>}
        </form>
      )}
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tab === 'patients' && (
        <div>
          <h3>Pacientes</h3>
          {patients.length === 0 ? (
            <p>Não há pacientes.</p>
          ) : (
            <ul>
              {patients.map((p: any) => (
                <li key={p.user_id}>{p.name || p.user?.name} - {p.email || p.user?.email}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {tab === 'doctors' && (
        <div>
          <h3>Médicos</h3>
          {doctors.length === 0 ? (
            <p>Não há médicos.</p>
          ) : (
            <ul>
              {doctors.map((d: any) => (
                <li key={d.user_id}>
                  {(typeof d.user?.name === 'string' ? d.user.name : '')}
                  {' - '}
                  {(typeof d.user?.email === 'string' ? d.user.email : '')}
                  {' | CRM: '}
                  {typeof d.crm === 'string' ? d.crm : ''}
                  {' | Especialidade: '}
                  {typeof d.speciality === 'string'
                    ? d.speciality
                    : (d.speciality?.name || '')}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {tab === 'appointments' && (
        <div>
          <h3>Consultas</h3>
          {appointments.length === 0 ? (
            <p>Não há consultas.</p>
          ) : (
            <ul>
              {appointments.map((a: any) => (
                <li key={a.id}>
                  Paciente: {a.patient?.name || a.patient?.user_id}
                  {' | Médico: '}
                  {a.doctor?.name || a.doctor?.user_id}
                  {' | Especialidade: '}
                  {typeof a.doctor?.speciality === 'string'
                    ? a.doctor.speciality
                    : (a.doctor?.speciality?.name || '')}
                  {' | Data: '}
                  {a.appointment_datetime
                    ? new Date(a.appointment_datetime).toLocaleString('pt-BR')
                    : ''}
                  {' | Sintomas: '}
                  {a.symptoms_description || a.notes || ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
