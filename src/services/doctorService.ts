import axios from 'axios';
import { getToken } from './authService.ts';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function authHeaders() {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// Perfil do médico
export async function getDoctorProfile(userId: string) {
  return axios.get(`${API_BASE_URL}/api/v1/doctors/${userId}`, authHeaders());
}

export async function updateDoctorProfile(userId: string, data: {
  name?: string;
  phone?: string;
  speciality_id?: string;
  professional_statement?: string;
  consultation_duration?: number;
}) {
  return axios.put(`${API_BASE_URL}/api/v1/doctors/${userId}`, data, authHeaders());
}

// Consultas
export async function getMyAppointments(page = 1, limit = 10, status?: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (status) params.append('status', status);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  return axios.get(`${API_BASE_URL}/api/v1/appointments?${params.toString()}`, authHeaders());
}

export async function getAppointmentDetails(appointmentId: string) {
  return axios.get(`${API_BASE_URL}/api/v1/appointments/${appointmentId}`, authHeaders());
}

export async function updateAppointment(appointmentId: string, data: {
  status?: string;
  medical_notes?: string;
  cancellation_reason?: string;
}) {
  return axios.put(`${API_BASE_URL}/api/v1/appointments/${appointmentId}`, data, authHeaders());
}

// Pacientes
export async function getPatients(page = 1, limit = 10) {
  return axios.get(`${API_BASE_URL}/api/v1/patients?page=${page}&limit=${limit}`, authHeaders());
}

export async function getPatientDetails(patientId: string) {
  return axios.get(`${API_BASE_URL}/api/v1/patients/${patientId}`, authHeaders());
}

// Agenda/Cronograma
export async function getDoctorSchedule(doctorId: string) {
  return axios.get(`${API_BASE_URL}/api/v1/schedules/doctor/${doctorId}`, authHeaders());
}

export async function createSchedule(data: {
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}) {
  return axios.post(`${API_BASE_URL}/api/v1/schedules`, data, authHeaders());
}

export async function blockSchedule(data: {
  doctor_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
}) {
  return axios.post(`${API_BASE_URL}/api/v1/schedules/block`, data, authHeaders());
}

// Notificações
export async function getNotifications(page = 1, limit = 10) {
  return axios.get(`${API_BASE_URL}/api/v1/notifications?page=${page}&limit=${limit}`, authHeaders());
}

export async function markNotificationAsRead(notificationId: string) {
  return axios.patch(`${API_BASE_URL}/api/v1/notifications/${notificationId}/read`, {}, authHeaders());
}

export async function markAllNotificationsAsRead() {
  return axios.patch(`${API_BASE_URL}/api/v1/notifications/read-all`, {}, authHeaders());
}

// Especialidades
export async function getSpecialities() {
  return axios.get(`${API_BASE_URL}/api/v1/specialities`, authHeaders());
} 