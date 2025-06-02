import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout, getToken } from '../services/authService.ts';
import {
  getPatientById,
  updatePatient,
  Patient,
  PatientUpdateData,
  getMyPatientAppointments,
  PatientAppointment,
  getAvailableDoctors,
  DoctorForBooking,
  getSpecialities,
  Speciality,
  createAppointmentByPatient,
  CreateAppointmentPayload,
  getDoctorAvailability,
  TimeSlot
} from '../services/patientService.ts';

// Basic styling (can be moved to a CSS file)
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ccc',
    paddingBottom: '10px',
    marginBottom: '20px'
  },
  nav: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  navButton: (isActive: boolean) => ({
    padding: '10px 15px',
    border: isActive ? '1px solid #007bff' : '1px solid #ccc',
    backgroundColor: isActive ? '#007bff' : '#f0f0f0',
    color: isActive ? 'white' : 'black',
    cursor: 'pointer',
    borderRadius: '4px'
  }),
  section: {
    padding: '20px',
    border: '1px solid #eee',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box' as 'border-box',
    border: '1px solid #ccc',
    borderRadius: '4px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px'
  },
  error: {
    color: 'red',
    marginTop: '10px'
  },
  success: {
    color: 'green',
    marginTop: '10px'
  },
  appointmentCard: {
    border: '1px solid #ddd',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9'
  },
  timeSlotButton: (isAvailable: boolean, isSelected: boolean) => ({
    padding: '8px 12px',
    margin: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: isAvailable ? 'pointer' : 'not-allowed',
    backgroundColor: isSelected ? '#28a745' : (isAvailable ? '#fff' : '#e9ecef'),
    color: isSelected ? 'white' : (isAvailable ? 'black' : '#6c757d'),
    opacity: isAvailable ? 1 : 0.6
  })
};

type TabType = 'profile' | 'appointments' | 'bookAppointment';

const MAX_RETRIES = 3;

const PatientDashboard: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [user, setUser] = useState<any>(null); // Consider defining a User type as in authService
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile states
  const [profileForm, setProfileForm] = useState<PatientUpdateData>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Appointments states
  const [myAppointments, setMyAppointments] = useState<PatientAppointment[]>([]);

  // Book Appointment states
  const [availableDoctors, setAvailableDoctors] = useState<DoctorForBooking[]>([]);
  const [specialities, setSpecialities] = useState<{id: string, name: string}[]>([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorForBooking | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [retryCount, setRetryCount] = useState(0);

  const navigate = useNavigate();

  const loadPatientData = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Add a small delay to ensure token is stored
      await new Promise(resolve => setTimeout(resolve, 100));
      const token = getToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Por favor, faça login novamente.');
      }
      const response = await getPatientById(userId);
      setPatient(response.data);
      setProfileForm({
        name: response.data.user.name,
        phone: response.data.user.phone || '',
        birth_date: response.data.birth_date,
        health_insurance: response.data.health_insurance || '',
        emergency_contact: response.data.emergency_contact || '',
        blood_type: response.data.blood_type || '',
        allergies: response.data.allergies || '',
      });
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('Erro ao carregar dados do paciente:', {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        logout();
        navigate('/login/paciente');
        return;
      }

      const errorMessage = err.response?.data?.message || err.message || 'Erro ao carregar dados do paciente.';
      setError(`${errorMessage} ${retryCount < MAX_RETRIES ? '(Tentativa ' + (retryCount + 1) + ' de ' + MAX_RETRIES + ')' : ''}`);
    }
    setLoading(false);
  }, [navigate, retryCount]);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser && currentUser.role === 'patient') {
      setUser(currentUser);
      loadPatientData(currentUser.id);
    } else {
      logout();
      navigate('/login/paciente');
    }
  }, [loadPatientData, navigate]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await updatePatient(patient.user_id, profileForm);
      setPatient(res.data); // Update patient state with the response
      setIsEditingProfile(false);
      setSuccess('Perfil atualizado com sucesso!');
      // Optionally re-fetch patient data or merge response
      loadPatientData(patient.user_id); 
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil.');
    }
    setLoading(false);
  };

  const loadMyAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyPatientAppointments();
      // Filtrar apenas os agendamentos do paciente logado
      const allAppointments = response.data.data || [];
      const filtered = user ? allAppointments.filter((apt: any) => apt.patient?.user_id === user.id) : [];
      setMyAppointments(filtered);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar agendamentos.');
    }
    setLoading(false);
  }, [user]);

  const loadDoctorsAndSpecialities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const doctorsRes = await getAvailableDoctors(1, 100);
      const doctors = doctorsRes.data.doctors || [];
      setAvailableDoctors(doctors);
      // Montar especialidades únicas
      const uniqueSpecs: {[id: string]: string} = {};
      doctors.forEach(doc => {
        if (doc.speciality && doc.speciality.id) {
          uniqueSpecs[doc.speciality.id] = doc.speciality.name;
        }
      });
      setSpecialities(Object.entries(uniqueSpecs).map(([id, name]) => ({id, name})));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar médicos/especialidades.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'appointments') {
      loadMyAppointments();
    } else if (activeTab === 'bookAppointment') {
      loadDoctorsAndSpecialities();
    }
  }, [activeTab, loadMyAppointments, loadDoctorsAndSpecialities]);

  // Filtrar médicos pela especialidade selecionada
  const filteredDoctors = selectedSpeciality
    ? availableDoctors.filter(doc => doc.speciality?.id === selectedSpeciality)
    : availableDoctors;

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      setError('Por favor, selecione médico, data e horário.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      doctor_id: selectedDoctor.user_id,
      patient_id: user.id,
      date: appointmentDate,
      time: appointmentTime,
      notes: notes,
    };

    try {
      await createAppointmentByPatient(payload);
      setSuccess('Consulta agendada com sucesso!');
      setSelectedSpeciality('');
      setSelectedDoctor(null);
      setAppointmentDate('');
      setAppointmentTime('');
      setNotes('');
      setActiveTab('appointments');
      loadMyAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao agendar consulta.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login/paciente');
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Ensure UTC if dates are stored as such
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('pt-BR', { timeZone: 'UTC' });
  };

  if (!user || !patient) {
    return (
      <div style={styles.container}>
        {loading ? (
          <p>Carregando dados do paciente...</p>
        ) : error ? (
          <div>
            <p style={styles.error}>{error}</p>
            {retryCount < MAX_RETRIES && (
              <button
                onClick={() => {
                  setRetryCount(prev => prev + 1);
                  if (user) {
                    loadPatientData(user.id);
                  }
                }}
                style={{
                  ...styles.button,
                  marginTop: '10px'
                }}
              >
                Tentar Novamente
              </button>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/login/paciente');
              }}
              style={{
                ...styles.button,
                backgroundColor: '#dc3545',
                marginTop: '10px',
                marginLeft: '10px'
              }}
            >
              Voltar para Login
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Painel do Paciente</h1>
        <div>
          <span>Olá, {patient.user.name}!</span>
          <button onClick={handleLogout} style={{...styles.button, backgroundColor: '#dc3545', marginLeft: '15px'}}>Sair</button>
        </div>
      </div>

      <div style={styles.nav}>
        <button style={styles.navButton(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>Meu Perfil</button>
        <button style={styles.navButton(activeTab === 'appointments')} onClick={() => setActiveTab('appointments')}>Meus Agendamentos</button>
        <button style={styles.navButton(activeTab === 'bookAppointment')} onClick={() => setActiveTab('bookAppointment')}>Agendar Consulta</button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      {activeTab === 'profile' && (
        <section style={styles.section}>
          <h2>Informações Pessoais</h2>
          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="name">Nome Completo:</label>
                <input style={styles.input} type="text" id="name" name="name" value={profileForm.name || ''} onChange={handleProfileChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="email">Email:</label>
                <input style={styles.input} type="email" id="email" name="email" value={patient.user.email} disabled />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="cpf">CPF:</label>
                <input style={styles.input} type="text" id="cpf" name="cpf" value={patient.user.cpf} disabled />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="phone">Telefone:</label>
                <input style={styles.input} type="tel" id="phone" name="phone" value={profileForm.phone || ''} onChange={handleProfileChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="birth_date">Data de Nascimento:</label>
                <input style={styles.input} type="date" id="birth_date" name="birth_date" value={profileForm.birth_date ? profileForm.birth_date.substring(0,10) : ''} onChange={handleProfileChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="health_insurance">Plano de Saúde:</label>
                <input style={styles.input} type="text" id="health_insurance" name="health_insurance" value={profileForm.health_insurance || ''} onChange={handleProfileChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="emergency_contact">Contato de Emergência:</label>
                <input style={styles.input} type="text" id="emergency_contact" name="emergency_contact" value={profileForm.emergency_contact || ''} onChange={handleProfileChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="blood_type">Tipo Sanguíneo:</label>
                <input style={styles.input} type="text" id="blood_type" name="blood_type" value={profileForm.blood_type || ''} onChange={handleProfileChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="allergies">Alergias:</label>
                <textarea style={styles.input} id="allergies" name="allergies" value={profileForm.allergies || ''} onChange={handleProfileChange} />
              </div>
              <button style={styles.button} type="submit" disabled={loading}>Salvar Alterações</button>
              <button style={{...styles.button, backgroundColor: '#6c757d'}} type="button" onClick={() => setIsEditingProfile(false)} disabled={loading}>Cancelar</button>
            </form>
          ) : (
            <div>
              <p><strong>Nome:</strong> {patient.user.name}</p>
              <p><strong>Email:</strong> {patient.user.email}</p>
              <p><strong>CPF:</strong> {patient.user.cpf}</p>
              <p><strong>Telefone:</strong> {patient.user.phone || 'Não informado'}</p>
              <p><strong>Data de Nascimento:</strong> {formatDate(patient.birth_date)}</p>
              <p><strong>Plano de Saúde:</strong> {patient.health_insurance || 'Não informado'}</p>
              <p><strong>Contato de Emergência:</strong> {patient.emergency_contact || 'Não informado'}</p>
              <p><strong>Tipo Sanguíneo:</strong> {patient.blood_type || 'Não informado'}</p>
              <p><strong>Alergias:</strong> {patient.allergies || 'Não informado'}</p>
              <button style={styles.button} onClick={() => setIsEditingProfile(true)}>Editar Perfil</button>
            </div>
          )}
        </section>
      )}

      {activeTab === 'appointments' && (
        <section style={styles.section}>
          <h2>Meus Agendamentos</h2>
          {myAppointments.length === 0 && !loading && <p>Você não tem nenhum agendamento.</p>}
          {myAppointments.map(apt => (
            <div key={apt.id} style={styles.appointmentCard}>
              <h4>Consulta com Dr(a). {apt.doctor.name} ({apt.doctor.speciality.name})</h4>
              <p><strong>Data e Hora:</strong> {formatDateTime(apt.appointment_datetime)}</p>
              <p><strong>Status:</strong> {apt.status}</p>
              <p><strong>Tipo:</strong> {apt.type}</p>
              {apt.symptoms_description && <p><strong>Sintomas Descritos:</strong> {apt.symptoms_description}</p>}
              {/* Pacientes geralmente não veem notas médicas detalhadas, mas pode haver um resumo ou status */} 
            </div>
          ))}
        </section>
      )}

      {activeTab === 'bookAppointment' && (
        <section style={styles.section}>
          <h2>Agendar Nova Consulta</h2>
          <form onSubmit={handleBookAppointment}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="speciality">Especialidade:</label>
              <select
                style={styles.input}
                id="speciality"
                value={selectedSpeciality}
                onChange={(e) => setSelectedSpeciality(e.target.value)}
              >
                <option value="">Todas as Especialidades</option>
                {specialities.map(spec => (
                  <option key={spec.id} value={spec.id}>{spec.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="doctor">Médico:</label>
              <select
                style={styles.input}
                id="doctor"
                value={selectedDoctor?.user_id || ''}
                onChange={(e) => {
                  const doctor = availableDoctors.find(d => d.user_id === e.target.value) || null;
                  setSelectedDoctor(doctor);
                }}
                disabled={availableDoctors.length === 0}
              >
                <option value="">Selecione um médico</option>
                {filteredDoctors.map(doc => (
                  <option key={doc.user_id} value={doc.user_id}>{doc.user?.name} - {doc.speciality?.name}</option>
                ))}
              </select>
            </div>
            
            {selectedDoctor && (
              <>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="appointmentDate">Data da Consulta:</label>
                    <input 
                        style={styles.input} 
                        type="date" 
                        id="appointmentDate" 
                        value={appointmentDate} 
                        onChange={e => setAppointmentDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]} // Não permite datas passadas
                    />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="appointmentTime">Horário:</label>
                  <input 
                    style={styles.input} 
                    type="time" 
                    id="appointmentTime" 
                    value={appointmentTime} 
                    onChange={e => setAppointmentTime(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="notes">Notas:</label>
                  <textarea 
                    style={styles.input} 
                    id="notes" 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    rows={3}
                    placeholder="Descreva brevemente seus sintomas"
                  />
                </div>
              </>
            )}
            <button style={styles.button} type="submit" disabled={loading || !selectedDoctor || !appointmentDate || !appointmentTime}>Agendar</button>
          </form>
        </section>
      )}
    </div>
  );
};

export default PatientDashboard; 