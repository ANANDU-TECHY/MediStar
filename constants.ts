
import { Patient, PharmacyOrder, InventoryItem } from './types';

export const MEDICINE_LIST = [
  "Paracetamol (500mg)", "Amoxicillin (250mg)", "Metformin (500mg)",
  "Atorvastatin (10mg)", "Omeprazole (20mg)", "Amlodipine (5mg)",
  "Azithromycin (500mg)", "Ibuprofen (400mg)", "Cetirizine (10mg)",
  "Losartan (50mg)", "Pantoprazole (40mg)", "Telmisartan (40mg)",
  "Montelukast (10mg)", "Glimipiride (2mg)", "Levocetirizine (5mg)"
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'INV-001', name: 'Paracetamol (500mg)', stock: 450, maxStock: 1000, minThreshold: 200, category: 'Analgesic', lastRestocked: '2023-10-12' },
  { id: 'INV-002', name: 'Amoxicillin (250mg)', stock: 45, maxStock: 500, minThreshold: 100, category: 'Antibiotic', lastRestocked: '2023-10-10' },
  { id: 'INV-003', name: 'Metformin (500mg)', stock: 620, maxStock: 800, minThreshold: 150, category: 'Antidiabetic', lastRestocked: '2023-10-15' },
  { id: 'INV-004', name: 'Cetirizine (10mg)', stock: 12, maxStock: 300, minThreshold: 50, category: 'Antihistamine', lastRestocked: '2023-09-28' },
  { id: 'INV-005', name: 'Omeprazole (20mg)', stock: 210, maxStock: 400, minThreshold: 80, category: 'Antacid', lastRestocked: '2023-10-01' },
  { id: 'INV-006', name: 'Pantoprazole (40mg)', stock: 35, maxStock: 500, minThreshold: 100, category: 'Antacid', lastRestocked: '2023-10-05' },
  { id: 'INV-007', name: 'Telmisartan (40mg)', stock: 180, maxStock: 600, minThreshold: 120, category: 'Hypertension', lastRestocked: '2023-10-08' }
];

export const MOCK_PATIENTS: Patient[] = [
  { id: 'P001', name: 'Rahul Sharma', age: 34, gender: 'Male', bloodGroup: 'O+', phone: '+91 9876543210' },
  { id: 'P002', name: 'Priya Verma', age: 28, gender: 'Female', bloodGroup: 'B-', phone: '+91 9123456789' },
  { id: 'P003', name: 'Amit Patel', age: 45, gender: 'Male', bloodGroup: 'A+', phone: '+91 9988776655' },
  { id: 'P004', name: 'Sneha Gupta', age: 31, gender: 'Female', bloodGroup: 'AB+', phone: '+91 9443322110' },
  { id: 'P005', name: 'Vikram Singh', age: 52, gender: 'Male', bloodGroup: 'O-', phone: '+91 9898989898' }
];

export const INITIAL_MOCK_ORDERS: PharmacyOrder[] = [
  {
    id: 'ORD-5501',
    patient: MOCK_PATIENTS[0],
    medicines: [
      { name: 'Paracetamol (500mg)', dosage: '1-0-1', duration: '5 Days', instruction: 'After food' },
      { name: 'Pantoprazole (40mg)', dosage: '1-0-0', duration: '7 Days', instruction: 'Empty stomach' }
    ],
    status: 'Preparing',
    timestamp: '11:20 AM',
    prepTimeMinutes: 10,
    doctorName: 'Dr. Arvind Sharma'
  },
  {
    id: 'ORD-5502',
    patient: MOCK_PATIENTS[1],
    medicines: [
      { name: 'Amoxicillin (250mg)', dosage: '1-1-1', duration: '5 Days', instruction: 'Complete the course' }
    ],
    status: 'Pending',
    timestamp: '11:45 AM',
    prepTimeMinutes: 5,
    doctorName: 'Dr. Arvind Sharma'
  },
  {
    id: 'ORD-5503',
    patient: MOCK_PATIENTS[2],
    medicines: [
      { name: 'Metformin (500mg)', dosage: '0-1-0', duration: '1 Month', instruction: 'With lunch' },
      { name: 'Atorvastatin (10mg)', dosage: '0-0-1', duration: '1 Month', instruction: 'At bedtime' }
    ],
    status: 'Ready',
    timestamp: '10:30 AM',
    prepTimeMinutes: 15,
    doctorName: 'Dr. Arvind Sharma'
  },
  {
    id: 'ORD-5504',
    patient: MOCK_PATIENTS[4],
    medicines: [
      { name: 'Telmisartan (40mg)', dosage: '1-0-0', duration: '15 Days', instruction: 'Morning' }
    ],
    status: 'Pending',
    timestamp: '11:58 AM',
    prepTimeMinutes: 5,
    doctorName: 'Dr. Arvind Sharma'
  }
];

export const DOSAGE_OPTIONS = [
  "1-0-1 (Morning & Night)", "1-1-1 (Morning, Afternoon & Night)",
  "0-0-1 (Night Only)", "1-0-0 (Morning Only)", "SOS (When needed)"
];

export const DURATION_OPTIONS = [
  "3 Days", "5 Days", "7 Days", "10 Days", "15 Days", "1 Month"
];

export const HOSPITAL_INFO = {
  name: "City Care Multispeciality Hospital",
  address: "123 Health Avenue, Medical District, Delhi - 110001",
  phone: "+91 11 2345 6789",
  email: "contact@citycarehospital.com",
  website: "www.citycarehospital.com"
};

export const DOCTOR_INFO = {
  name: "Dr. Arvind Sharma",
  qualifications: "MBBS, MD (Internal Medicine)",
  regNo: "MCI-123456",
  designation: "Senior Consultant Physician"
};
