
import React, { useState, useEffect } from 'react';
import LoginPage from './components/Auth/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import PrescriptionPanel from './components/Prescription/PrescriptionPanel';
import DashboardScreen from './components/Dashboard/DashboardScreen';
import PatientsScreen from './components/Patients/PatientsScreen';
import PharmacyPanel from './components/Pharmacy/PharmacyPanel';
import InventoryScreen from './components/Pharmacy/InventoryScreen';
import OrderViewScreen from './components/Order/OrderViewScreen';
import { PharmacyOrder, InventoryItem, Medicine, Patient, HospitalInfo, DoctorDetails, OrderStatus } from './types';
import { supabase } from './services/supabaseClient';
import { triggerOrderReadyCall, sendOrderAcceptedSMS } from './services/notificationService';

const App: React.FC = () => {
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role: 'Doctor' | 'Pharmacy' | null; name: string | null; userId?: number }>({
    isAuthenticated: false,
    role: null,
    name: null
  });
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfo | null>(null);
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetails | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Simple routing logic
  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchHospitalInfo();
      fetchPatients();
      fetchInventory();
      fetchOrders();
      if (auth.role === 'Doctor' && auth.userId) {
        fetchDoctorDetails(auth.userId);
      }

      const orderSubscription = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchOrders();
          if (auth.role === 'Pharmacy') {
             setShowNotification("Sync: New clinical order received.");
             setTimeout(() => setShowNotification(null), 4000);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(orderSubscription);
      };
    }
  }, [auth.isAuthenticated, auth.role]);

  const fetchHospitalInfo = async () => {
    const { data, error } = await supabase.from('hospital_info').select('*').single();
    if (!error && data) {
      setHospitalInfo(data);
    }
  };

  const fetchDoctorDetails = async (userId: number) => {
    const { data, error } = await supabase
      .from('doctor_details')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      setDoctorDetails({
        name: auth.name || '',
        qualifications: data.qualifications,
        regNo: data.reg_no,
        designation: data.designation
      });
    }
  };

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('*');
    if (!error && data) {
      setPatients(data.map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        bloodGroup: p.blood_group,
        phone: p.phone
      })));
    }
  };

  const fetchInventory = async () => {
    const { data, error } = await supabase.from('inventory').select('*').order('name');
    if (!error && data) {
      setInventory(data.map(i => ({
        id: i.id,
        name: i.name,
        stock: i.stock,
        maxStock: i.max_stock,
        minThreshold: i.min_threshold,
        category: i.category,
        lastRestocked: i.last_restocked
      })));
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        patients (*),
        order_medicines (*)
      `)
      .order('timestamp', { ascending: false });

    if (!error && data) {
      const mappedOrders: PharmacyOrder[] = data.map(o => ({
        id: o.id,
        patient: {
          id: o.patients.id,
          name: o.patients.name,
          age: o.patients.age,
          gender: o.patients.gender,
          bloodGroup: o.patients.blood_group,
          phone: o.patients.phone
        },
        medicines: o.order_medicines.map((m: any) => ({
          name: m.medicine_name,
          dosage: m.dosage,
          duration: m.duration,
          instruction: m.instruction
        })),
        status: o.status,
        timestamp: o.timestamp,
        prepTimeMinutes: o.prep_time_minutes,
        doctorName: o.doctor_name,
        rejectionReason: o.rejection_reason
      }));
      setOrders(mappedOrders);
    }
  };

  const handleLogin = (role: 'Doctor' | 'Pharmacy', name: string, userId: number) => {
    setAuth({ isAuthenticated: true, role, name, userId });
    setActiveTab(role === 'Pharmacy' ? 'Live Orders' : 'Dashboard');
  };

  const sendPrescriptionToPharmacy = async (patient: Patient, medicines: Medicine[]) => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      patient_id: patient.id,
      status: 'Pending',
      timestamp: timestamp,
      prep_time_minutes: medicines.length * 5,
      doctor_name: auth.name
    });

    if (orderError) return alert(orderError.message);

    const medicinesData = medicines.map(m => ({
      order_id: orderId,
      medicine_name: m.name,
      dosage: m.dosage,
      duration: m.duration,
      instruction: m.instruction
    }));

    await supabase.from('order_medicines').insert(medicinesData);
    setShowNotification(`Order ${orderId} synced to Pharmacy.`);
    setTimeout(() => setShowNotification(null), 3000);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) return alert("Failed to update: " + error.message);

    if (newStatus === 'Preparing') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        for (const med of order.medicines) {
          const invItem = inventory.find(i => med.name.toLowerCase().includes(i.name.toLowerCase()));
          if (invItem) {
            await supabase.from('inventory').update({ stock: Math.max(0, invItem.stock - 5) }).eq('id', invItem.id);
          }
        }
        fetchInventory();

        if (order.patient.phone) {
          setShowNotification(`Link sent to ${order.patient.name}`);
          const paymentUrl = `${window.location.origin}/order/${orderId}`;
          await sendOrderAcceptedSMS(order.patient.phone, order.patient.name, orderId, paymentUrl);
          setTimeout(() => setShowNotification(null), 3000);
        }
      }
    }

    if (newStatus === 'Ready') {
      const order = orders.find(o => o.id === orderId);
      if (order && order.patient.phone) {
        setShowNotification(`Calling ${order.patient.name}...`);
        await triggerOrderReadyCall(order.patient.phone, order.patient.name);
        setTimeout(() => setShowNotification(null), 3000);
      }
    }

    fetchOrders();
  };

  const handleRestock = async (id: string, maxStock: number) => {
    const { error } = await supabase.from('inventory').update({ stock: maxStock, last_restocked: new Date().toISOString().split('T')[0] }).eq('id', id);
    if (!error) fetchInventory();
  };

  // Render Order View Route (Public)
  if (currentPath.startsWith('/order/')) {
    const orderId = currentPath.split('/').pop();
    return <OrderViewScreen orderId={orderId || ''} hospitalInfo={hospitalInfo} />;
  }

  if (!auth.isAuthenticated) return <LoginPage onLogin={handleLogin} />;

  const renderContent = () => {
    if (auth.role === 'Pharmacy') {
      if (activeTab === 'Inventory') return <InventoryScreen inventory={inventory} onRestock={handleRestock} />;
      return <PharmacyPanel orders={orders} onUpdateStatus={updateOrderStatus} hospitalInfo={hospitalInfo} />;
    }

    switch (activeTab) {
      case 'Dashboard':
        return <DashboardScreen patients={patients} onNewPrescription={() => setActiveTab('Prescriptions')} />;
      case 'Prescriptions':
        return (
          <PrescriptionPanel 
            patients={patients} 
            onSendToPharmacy={sendPrescriptionToPharmacy} 
            hospitalInfo={hospitalInfo}
            doctorDetails={doctorDetails}
            availableMedicines={inventory.map(i => i.name)}
            allOrders={orders}
          />
        );
      case 'Patients':
        return <PatientsScreen patients={patients} onSelectPatient={() => setActiveTab('Prescriptions')} />;
      default:
        return <DashboardScreen patients={patients} onNewPrescription={() => setActiveTab('Prescriptions')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={auth.role} name={auth.name || ''} />
      <main className="flex-1 ml-64 p-8">
        {showNotification && (
          <div className="fixed top-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-bounce flex items-center gap-3 font-bold border-2 border-emerald-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showNotification}
          </div>
        )}
        <header className="mb-8 flex items-center justify-between no-print">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{activeTab}</h1>
            <p className="text-slate-500 font-medium">{hospitalInfo?.name || 'MedScript Network'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-900">{auth.name}</p>
            <p className={`text-[10px] font-black uppercase tracking-tighter ${auth.role === 'Pharmacy' ? 'text-emerald-600' : 'text-blue-600'}`}>
              {auth.role} Online
            </p>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
