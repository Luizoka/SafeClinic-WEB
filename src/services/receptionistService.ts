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

// Adicione outras funções conforme necessário (notificações, cadastrar médico, etc)
