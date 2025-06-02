import axios from 'axios';
import { getToken } from './authService.ts';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const authHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Interfaces based on your provided JSON structures

interface User {
  id: string;
  email: string;
  name: string;
  cpf: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'receptionist';
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Patient {
  user_id: string;
  birth_date: string; // YYYY-MM-DD
  health_insurance?: string;
  emergency_contact?: string;
  blood_type?: string;
  allergies?: string;
  user: User;
  created_at?: string;
  updated_at?: string;
}

export interface PatientRegistrationData {
  name: string;
  email: string;
  password: string;
  cpf: string; // 11 numeric digits
  phone?: string;
  birth_date: string; // YYYY-MM-DD
  health_insurance?: string;
  emergency_contact?: string;
  blood_type?: string;
  allergies?: string;
}

export interface PatientUpdateData {
  name?: string;
  phone?: string;
  birth_date?: string; // YYYY-MM-DD
  health_insurance?: string;
  emergency_contact?: string;
  blood_type?: string;
  allergies?: string;
}

interface PaginatedPatientsResponse {
  patients: Patient[];
  total: number;
  page: number;
  totalPages: number;
}

// 1. Create a new patient
// Renamed to avoid conflict if registerPatient from authService is imported elsewhere.
export const registerPatientWithService = async (data: PatientRegistrationData) => {
  const payload = {
    ...data,
    cpf: data.cpf.replace(/\D/g, ''), // Ensure only digits for CPF
  };
  return axios.post<Patient>(`${API_BASE_URL}/api/v1/patients`, payload);
  // API also supports /api/v1/patients/register
};

// 2. List all patients
export const getAllPatients = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  return axios.get<PaginatedPatientsResponse>(`${API_BASE_URL}/api/v1/patients?${params.toString()}`, authHeaders());
};

// 3. Get patient details by user_id
export const getPatientById = async (id: string) => {
  return axios.get<Patient>(`${API_BASE_URL}/api/v1/patients/${id}`, authHeaders());
};

// 4. Update patient data
export const updatePatient = async (id: string, data: PatientUpdateData) => {
  return axios.put<Patient>(`${API_BASE_URL}/api/v1/patients/${id}`, data, authHeaders());
};

// 5. Deactivate a patient
export const deactivatePatient = async (id: string) => {
  return axios.delete<{ message: string }>(`${API_BASE_URL}/api/v1/patients/${id}`, authHeaders());
};

// Additional functions needed for Patient Dashboard

// 6. Get appointments for the logged-in patient
export interface PatientAppointment extends Patient { // Assuming PatientAppointment might have more fields or a different structure
  id: string;
  appointment_datetime: string;
  status: string;
  type: string; // e.g., online, in-person
  symptoms_description?: string;
  medical_notes?: string; // Usually by doctor, but patient might see some summary
  doctor: { // Basic doctor info
    user_id: string;
    name: string;
    speciality: {
      id: string;
      name: string;
    };
  };
}

interface PaginatedPatientAppointmentsResponse {
  appointments: PatientAppointment[];
  total: number;
  page: number;
  totalPages: number;
}

export const getMyPatientAppointments = async (page = 1, limit = 10, status?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (status) params.append('status', status);
  // Assuming an endpoint like /api/v1/patients/me/appointments or that /api/v1/appointments filters by logged-in patient user
  return axios.get<PaginatedPatientAppointmentsResponse>(`${API_BASE_URL}/api/v1/appointments/patient/me?${params.toString()}`, authHeaders());
};

// 7. List doctors (e.g., for booking an appointment)
// This might be similar to a general doctor listing, or a specific one for patients
export interface DoctorForBooking {
  user_id: string;
  name: string;
  crm: string;
  speciality: {
    id: string;
    name: string;
  };
  // Add other relevant fields like consultation_duration, professional_statement if needed for patient view
}

interface PaginatedDoctorsResponse {
  doctors: DoctorForBooking[];
  total: number;
  page: number;
  totalPages: number;
}
export const getAvailableDoctors = async (page = 1, limit = 100, specialityId?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (specialityId) params.append('speciality_id', specialityId);
  return axios.get<PaginatedDoctorsResponse>(`${API_BASE_URL}/api/v1/doctors/available?${params.toString()}`, authHeaders());
  // Assuming a dedicated endpoint or that /api/v1/doctors can be filtered
};


// 8. Get Specialities (patients might need this to filter doctors)
export interface Speciality {
  id: string;
  name: string;
}
export const getSpecialities = async () => {
  // This can likely reuse the existing doctorService.getSpecialities or receptionistService.getSpecialities if it's a public/authenticated general endpoint
  return axios.get<{ data: Speciality[] }>(`${API_BASE_URL}/api/v1/specialities`, authHeaders());
};


// 9. Create an appointment (by patient)
export interface CreateAppointmentPayload {
  doctor_id: string; // user_id of the doctor
  appointment_datetime: string; // ISO string "YYYY-MM-DDTHH:mm:ssZ"
  type: 'online' | 'in-person'; // Example
  symptoms_description?: string;
}
export const createAppointmentByPatient = async (data: CreateAppointmentPayload) => {
  return axios.post<PatientAppointment>(`${API_BASE_URL}/api/v1/appointments`, data, authHeaders());
  // Assuming the backend infers patient_id from the authenticated user
};

// 10. Get Doctor's available time slots (NEW - this is crucial for booking)
export interface TimeSlot {
  start_time: string; // "HH:mm"
  end_time: string;   // "HH:mm"
  available: boolean;
}
export const getDoctorAvailability = async (doctorId: string, date: string) => { // date in YYYY-MM-DD format
  const params = new URLSearchParams({ date });
  return axios.get<{ available_slots: TimeSlot[] }>(
    `${API_BASE_URL}/api/v1/schedules/doctor/${doctorId}/availability?${params.toString()}`,
    authHeaders()
  );
}; 