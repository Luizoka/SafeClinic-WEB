import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getMyAppointments,
  updateAppointment,
  getPatients,
  getDoctorSchedule,
  createSchedule,
  blockSchedule,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getSpecialities
} from '../services/doctorService.ts';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Doctor {
  user_id: string;
  crm: string;
  speciality: {
    id: string;
    name: string;
  };
  professional_statement?: string;
  consultation_duration: number;
  user: {
    id: string;
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
}

interface Appointment {
  id: string;
  appointment_datetime: string;
  status: string;
  type: string;
  symptoms_description?: string;
  medical_notes?: string;
  patient: {
    user_id: string;
    name: string;
  };
}

interface Patient {
  user_id: string;
  birth_date: string;
  health_insurance?: string;
  blood_type?: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface Speciality {
  id: string;
  name: string;
}

type TabType = 'dashboard' | 'appointments' | 'patients' | 'schedule' | 'profile' | 'notifications';

export default function DoctorDashboard() {
  const [tab, setTab] = useState<TabType>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para formulários
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    speciality_id: '',
    professional_statement: '',
    consultation_duration: 30
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadDoctorProfile(parsedUser.id);
    } else {
      navigate('/login/medico');
    }
  }, [navigate]);

  const loadDoctorProfile = async (userId: string) => {
    try {
      const response = await getDoctorProfile(userId);
      setDoctor(response.data);
      setProfileForm({
        name: response.data.user.name,
        phone: response.data.user.phone,
        speciality_id: response.data.speciality.id,
        professional_statement: response.data.professional_statement || '',
        consultation_duration: response.data.consultation_duration
      });
    } catch (err) {
      setError('Erro ao carregar perfil do médico');
    }
  };

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      switch (tab) {
        case 'appointments':
          const appointmentsRes = await getMyAppointments();
          setAppointments(appointmentsRes.data.data || []);
          break;
        case 'patients':
          const patientsRes = await getPatients();
          setPatients(patientsRes.data.data || []);
          break;
        case 'notifications':
          const notificationsRes = await getNotifications();
          setNotifications(notificationsRes.data.data || []);
          break;
        case 'profile':
          if (specialities.length === 0) {
            const specialitiesRes = await getSpecialities();
            setSpecialities(specialitiesRes.data.data || []);
          }
          break;
      }
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [tab, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login/medico');
  };

  const handleUpdateAppointment = async (appointmentId: string, status: string, notes?: string) => {
    try {
      await updateAppointment(appointmentId, {
        status,
        medical_notes: notes
      });
      setSuccess('Consulta atualizada com sucesso!');
      loadData();
      setSelectedAppointment(null);
      setMedicalNotes('');
    } catch (err) {
      setError('Erro ao atualizar consulta');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await updateDoctorProfile(user.id, profileForm);
      setSuccess('Perfil atualizado com sucesso!');
      setEditingProfile(false);
      loadDoctorProfile(user.id);
    } catch (err) {
      setError('Erro ao atualizar perfil');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#007bff';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'absent': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'absent': return 'Paciente Faltou';
      default: return status;
    }
  };

  if (!user || !doctor) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      padding: '20px' 
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#333' }}>SafeClinic - Painel Médico</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              Bem-vindo, {doctor.user.name} - {doctor.speciality.name}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '0', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex' }}>
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'appointments', label: 'Consultas' },
            { key: 'patients', label: 'Pacientes' },
            { key: 'schedule', label: 'Agenda' },
            { key: 'notifications', label: 'Notificações' },
            { key: 'profile', label: 'Perfil' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as TabType)}
              style={{
                padding: '15px 20px',
                border: 'none',
                backgroundColor: tab === key ? '#007bff' : 'transparent',
                color: tab === key ? 'white' : '#333',
                cursor: 'pointer',
                borderBottom: tab === key ? 'none' : '1px solid #dee2e6'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {success}
        </div>
      )}

      {/* Content */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Dashboard Tab */}
        {tab === 'dashboard' && (
          <div>
            <h2>Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3>Consultas de Hoje</h3>
                <p style={{ fontSize: '24px', margin: '10px 0' }}>
                  {appointments.filter(apt => 
                    new Date(apt.appointment_datetime).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3>Consultas Concluídas</h3>
                <p style={{ fontSize: '24px', margin: '10px 0' }}>
                  {appointments.filter(apt => apt.status === 'completed').length}
                </p>
              </div>
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#ffc107', 
                color: 'white', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3>Consultas Agendadas</h3>
                <p style={{ fontSize: '24px', margin: '10px 0' }}>
                  {appointments.filter(apt => apt.status === 'scheduled').length}
                </p>
              </div>
            </div>
            
            <h3 style={{ marginTop: '30px' }}>Próximas Consultas</h3>
            {appointments.filter(apt => apt.status === 'scheduled').slice(0, 5).map(appointment => (
              <div key={appointment.id} style={{ 
                padding: '15px', 
                border: '1px solid #dee2e6', 
                borderRadius: '8px', 
                marginBottom: '10px',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{appointment.patient.name}</strong>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      {formatDate(appointment.appointment_datetime)}
                    </p>
                    {appointment.symptoms_description && (
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        Sintomas: {appointment.symptoms_description}
                      </p>
                    )}
                  </div>
                  <span style={{ 
                    padding: '5px 10px', 
                    backgroundColor: getStatusColor(appointment.status), 
                    color: 'white', 
                    borderRadius: '4px', 
                    fontSize: '12px' 
                  }}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div>
            <h2>Minhas Consultas</h2>
            {loading ? (
              <p>Carregando consultas...</p>
            ) : (
              <div>
                {appointments.map(appointment => (
                  <div key={appointment.id} style={{ 
                    padding: '20px', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '8px', 
                    marginBottom: '15px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>{appointment.patient.name}</h4>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Data/Hora:</strong> {formatDate(appointment.appointment_datetime)}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Tipo:</strong> {appointment.type === 'online' ? 'Online' : 'Presencial'}
                        </p>
                        {appointment.symptoms_description && (
                          <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>Sintomas:</strong> {appointment.symptoms_description}
                          </p>
                        )}
                        {appointment.medical_notes && (
                          <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>Notas Médicas:</strong> {appointment.medical_notes}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                        <span style={{ 
                          padding: '5px 10px', 
                          backgroundColor: getStatusColor(appointment.status), 
                          color: 'white', 
                          borderRadius: '4px', 
                          fontSize: '12px' 
                        }}>
                          {getStatusText(appointment.status)}
                        </span>
                        
                        {appointment.status === 'scheduled' && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setMedicalNotes(appointment.medical_notes || '');
                              }}
                              style={{ 
                                padding: '5px 10px', 
                                backgroundColor: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Atender
                            </button>
                            <button
                              onClick={() => handleUpdateAppointment(appointment.id, 'absent')}
                              style={{ 
                                padding: '5px 10px', 
                                backgroundColor: '#ffc107', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Marcar Falta
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal para atender consulta */}
            {selectedAppointment && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '30px',
                  borderRadius: '8px',
                  maxWidth: '500px',
                  width: '90%'
                }}>
                  <h3>Atender Consulta - {selectedAppointment.patient.name}</h3>
                  <p><strong>Data/Hora:</strong> {formatDate(selectedAppointment.appointment_datetime)}</p>
                  {selectedAppointment.symptoms_description && (
                    <p><strong>Sintomas:</strong> {selectedAppointment.symptoms_description}</p>
                  )}
                  
                  <div style={{ margin: '20px 0' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      <strong>Notas Médicas:</strong>
                    </label>
                    <textarea
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      placeholder="Digite suas observações médicas..."
                      style={{
                        width: '100%',
                        height: '100px',
                        padding: '10px',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setSelectedAppointment(null);
                        setMedicalNotes('');
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUpdateAppointment(selectedAppointment.id, 'completed', medicalNotes)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Finalizar Consulta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Patients Tab */}
        {tab === 'patients' && (
          <div>
            <h2>Lista de Pacientes</h2>
            {loading ? (
              <p>Carregando pacientes...</p>
            ) : (
              <div>
                {patients.map(patient => (
                  <div key={patient.user_id} style={{ 
                    padding: '15px', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '8px', 
                    marginBottom: '10px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>{patient.user.name}</h4>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Email:</strong> {patient.user.email}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Telefone:</strong> {patient.user.phone}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Data de Nascimento:</strong> {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                    </p>
                    {patient.health_insurance && (
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Convênio:</strong> {patient.health_insurance}
                      </p>
                    )}
                    {patient.blood_type && (
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Tipo Sanguíneo:</strong> {patient.blood_type}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {tab === 'schedule' && (
          <div>
            <h2>Minha Agenda</h2>
            <p>Funcionalidade de agenda em desenvolvimento...</p>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Notificações</h2>
              <button
                onClick={async () => {
                  try {
                    await markAllNotificationsAsRead();
                    setSuccess('Todas as notificações foram marcadas como lidas');
                    loadData();
                  } catch (err) {
                    setError('Erro ao marcar notificações como lidas');
                  }
                }}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Marcar Todas como Lidas
              </button>
            </div>
            
            {loading ? (
              <p>Carregando notificações...</p>
            ) : (
              <div>
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    style={{ 
                      padding: '15px', 
                      border: '1px solid #dee2e6', 
                      borderRadius: '8px', 
                      marginBottom: '10px',
                      backgroundColor: notification.read ? '#f8f9fa' : '#fff3cd',
                      cursor: 'pointer'
                    }}
                    onClick={async () => {
                      if (!notification.read) {
                        try {
                          await markNotificationAsRead(notification.id);
                          loadData();
                        } catch (err) {
                          setError('Erro ao marcar notificação como lida');
                        }
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{notification.title}</h4>
                        <p style={{ margin: '5px 0', color: '#666' }}>{notification.message}</p>
                        <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: '#007bff',
                          borderRadius: '50%'
                        }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Meu Perfil</h2>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                style={{
                  padding: '10px 15px',
                  backgroundColor: editingProfile ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {editingProfile ? 'Cancelar' : 'Editar Perfil'}
              </button>
            </div>

            {editingProfile ? (
              <form onSubmit={handleUpdateProfile}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Nome:</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Telefone:</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Especialidade:</label>
                  <select
                    value={profileForm.speciality_id}
                    onChange={(e) => setProfileForm({ ...profileForm, speciality_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px'
                    }}
                  >
                    {specialities.map(spec => (
                      <option key={spec.id} value={spec.id}>{spec.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Duração da Consulta (minutos):</label>
                  <input
                    type="number"
                    value={profileForm.consultation_duration}
                    onChange={(e) => setProfileForm({ ...profileForm, consultation_duration: parseInt(e.target.value) || 30 })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px'
                    }}
                    min="15"
                    max="120"
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Declaração Profissional:</label>
                  <textarea
                    value={profileForm.professional_statement}
                    onChange={(e) => setProfileForm({ ...profileForm, professional_statement: e.target.value })}
                    style={{
                      width: '100%',
                      height: '100px',
                      padding: '10px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      resize: 'vertical'
                    }}
                    placeholder="Descreva sua experiência e especialidades..."
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Salvar Alterações
                </button>
              </form>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h3>Informações Pessoais</h3>
                    <p><strong>Nome:</strong> {doctor.user.name}</p>
                    <p><strong>Email:</strong> {doctor.user.email}</p>
                    <p><strong>CPF:</strong> {doctor.user.cpf}</p>
                    <p><strong>Telefone:</strong> {doctor.user.phone}</p>
                  </div>
                  <div>
                    <h3>Informações Profissionais</h3>
                    <p><strong>CRM:</strong> {doctor.crm}</p>
                    <p><strong>Especialidade:</strong> {doctor.speciality.name}</p>
                    <p><strong>Duração da Consulta:</strong> {doctor.consultation_duration} minutos</p>
                  </div>
                </div>
                
                {doctor.professional_statement && (
                  <div style={{ marginTop: '20px' }}>
                    <h3>Declaração Profissional</h3>
                    <p style={{ 
                      padding: '15px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px',
                      border: '1px solid #dee2e6'
                    }}>
                      {doctor.professional_statement}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 