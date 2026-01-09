
export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instruction: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Rejected';

export interface PharmacyOrder {
  id: string;
  patient: Patient;
  medicines: Medicine[];
  status: OrderStatus;
  timestamp: string;
  prepTimeMinutes: number;
  doctorName: string;
  rejectionReason?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  maxStock: number;
  minThreshold: number;
  category: string;
  lastRestocked: string;
}

export interface HospitalInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface DoctorDetails {
  name: string;
  qualifications: string;
  regNo: string;
  designation: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: 'Doctor' | 'Pharmacy' | null;
  userId?: number;
}
