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

export async function getPatients() {
  return axios.get(`${API_BASE_URL}/api/v1/patients`, authHeaders());
}

export async function getDoctors() {
  return axios.get(`${API_BASE_URL}/api/v1/doctors`, authHeaders());
}

export async function getAppointments() {
  return axios.get(`${API_BASE_URL}/api/v1/appointments`, authHeaders());
}

export async function getDoctorsBySpeciality(speciality: string) {
  return axios.get(`${API_BASE_URL}/api/v1/doctors/speciality/${speciality}`, authHeaders());
}

export async function createAppointment(data: {
  doctor_id: string; // deve ser user_id do médico
  patient_id: string; // deve ser user_id do paciente
  date: string;
  time: string;
  notes?: string;
}) {
  return axios.post(`${API_BASE_URL}/api/v1/appointments`, data, authHeaders());
}

export async function getSpecialities() {
  return axios.get(`${API_BASE_URL}/api/v1/specialities`, authHeaders());
}

// Adicione outras funções conforme necessário (notificações, cadastrar médico, etc)
