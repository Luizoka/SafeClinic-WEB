import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPatients, getDoctors, getAppointments } from '../services/receptionistService.ts';

export default function ReceptionistDashboard() {
  const [tab, setTab] = useState<'patients' | 'doctors' | 'appointments'>('patients');
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      getAppointments()
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
      </div>
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
                <li key={p.id}>{p.name || p.user?.name} - {p.email || p.user?.email}</li>
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
                <li key={d.id}>
                  {d.user?.name || d.name}
                  {' - '}
                  {d.user?.email || d.email}
                  {' | CRM: '}
                  {d.crm}
                  {' | Especialidade: '}
                  {d.speciality}
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
                  Paciente: {a.patient?.name} | Médico: {a.doctor?.name} | Data: {a.date}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
