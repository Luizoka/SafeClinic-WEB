import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_URL = `${API_BASE_URL}/api/v1/auth/login`;

export async function login(email: string, password: string) {
  try {
    const response = await axios.post(API_URL, { email, password });
    const { token, refreshToken, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return { user };
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Erro ao conectar com o servidor.');
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export async function registerDoctor(data: {
  name: string;
  email: string;
  crm: string;
  speciality: string;
  password: string;
}) {
  const url = `${API_BASE_URL}/api/v1/doctors`;
  return axios.post(url, data); // Não há CPF ou telefone aqui
}

export async function registerPatient(data: {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  password: string;
}) {
  const url = `${API_BASE_URL}/api/v1/patients`;
  const payload = {
    ...data,
    cpf: data.cpf.replace(/\D/g, ''), // Remove máscara do CPF
    birth_date: data.birthDate,
  };
  delete (payload as any).birthDate;
  return axios.post(url, payload);
}

export async function registerReceptionist(data: {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  work_shift: string;
}) {
  const url = `${API_BASE_URL}/api/v1/receptionists`;
  const payload = {
    ...data,
    cpf: data.cpf.replace(/\D/g, ''),   // Remove máscara do CPF
    phone: data.phone.replace(/\D/g, ''), // Remove máscara do telefone
  };
  return axios.post(url, payload);
}
