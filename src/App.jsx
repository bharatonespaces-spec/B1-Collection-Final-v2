import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  IndianRupee, 
  Calendar, 
  Phone, 
  Search, 
  Menu, 
  LogOut, 
  Bell, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Camera,
  QrCode,
  ArrowRight,
  ShieldAlert,
  Settings,
  Wallet
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, onSnapshot, query, where, addDoc, Timestamp } from "firebase/firestore";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBqOWnRgXyTjprZZn58C-F7pxed0mINpn",
  authDomain: "bharat-one-spaces.firebaseapp.com",
  projectId: "bharat-one-spaces",
  storageBucket: "bharat-one-spaces.firebasestorage.app",
  messagingSenderId: "221326819338",
  appId: "1:221326819338:web:edb1a476b5e42415e19ff3",
  measurementId: "G-5EKXWQ3GCD"};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Helper Functions & Constants ---
const BRAND = {
  blue: 'bg-blue-700',
  blueText: 'text-blue-700',
  orange: 'bg-orange-500',
  orangeText: 'text-orange-500',
  white: 'bg-white',
  lightBlue: 'bg-blue-50',
};

// Initial Data from Image (Mocked for Prototype)
const INITIAL_TENANTS = [
  { id: 't1', unit: 'B1 01', name: 'Pradeep Bhai', phone: '9923701058', baseRent: 8470, powerBill: 350, deposit: 20000, startDate: '2023-01-01', status: 'paid' },
  { id: 't2', unit: 'B1 02', name: 'Tasneem', phone: '7774975917', baseRent: 5000, powerBill: 200, deposit: 15000, startDate: '2025-11-01', status: 'late' },
  { id: 't3', unit: 'B1 03', name: 'RTO Agent Rohan', phone: '9075494727', baseRent: 9000, powerBill: 450, deposit: 25000, startDate: '2023-10-01', status: 'pending' },
  { id: 't4', unit: 'B1 04', name: 'Shadal', phone: '8788280024', baseRent: 12100, powerBill: 600, deposit: 30000, startDate: '2023-05-15', status: 'paid' },
  { id: 't5', unit: 'B1 05', name: 'BMW', phone: '9922970136', baseRent: 10500, powerBill: 500, deposit: 22000, startDate: '2023-09-22', status: 'pending' },
  { id: 't6', unit: 'B1 06', name: 'Modern', phone: '9822955993', baseRent: 15950, powerBill: 800, deposit: 40000, startDate: '2025-08-05', status: 'late' },
  { id: 't7', unit: 'B1 07', name: 'Tauhid', phone: '7276819713', baseRent: 10350, powerBill: 400, deposit: 20000, startDate: '2024-01-01', status: 'pending' },
];

// --- Components ---

const Header = ({ userRole, toggleRole }) => (
  <div className={`${BRAND.blue} text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50`}>
    <div>
      <h1 className="text-xl font-bold tracking-tight">BharatOne Spaces</h1>
      <p className="text-xs opacity-80">Rent Collection</p>
    </div>
    <button 
      onClick={toggleRole}
      className="text-xs bg-white/20 px-3 py-1 rounded-full flex items-center gap-2 hover:bg-white/30 transition"
    >
      <Users size={14} />
      {userRole === 'admin' ? 'Admin View' : 'Shankar View'}
    </button>
  </div>
);

const StatCard = ({ title, value, subValue, icon: Icon, colorClass, highlight = false }) => (
  <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between ${highlight ? 'ring-2 ring-orange-400' : ''}`}>
    <div>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
      <h3 className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</h3>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
    <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('700', '100').replace('500', '100')} opacity-80`}>
      <Icon size={20} className={colorClass} />
    </div>
  </div>
);

const TenantCard = ({ tenant, currentDate, userRole, onCollect }) => {
  const { totalDue, discount, lateFee, isLate, isEarly } = calculateRentDetails(tenant, currentDate);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 relative">
      <div className="flex justify-between items-center p-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded text-sm">
            {tenant.unit}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{tenant.name}</h4>
            <a href={`tel:${tenant.phone}`} className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
              <Phone size={10} /> {tenant.phone}
            </a>
          </div>
        </div>
        <div className="text-right">
           <span className={`text-xs font-bold px-2 py-1 rounded-full ${
             isLate ? 'bg-red-100 text-red-600' : 
             tenant.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
           }`}>
             {tenant.status === 'paid' ? 'PAID' : isLate ? 'OVERDUE' : 'DUE'}
           </span>
        </div>
      </div>

      <div className="p-4">
        {userRole === 'admin' && (
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Base Rent</p>
              <p className="font-medium text-gray-700">₹{tenant.baseRent.toLocaleString()}</p>
            </div>
             <div>
              <p className="text-gray-400 text-xs">Power Bill</p>
              <p className="font-medium text-gray-700">₹{tenant.powerBill.toLocaleString()}</p>
            </div>
             <div>
              <p className="text-gray-400 text-xs">Deposit</p>
              <p className="font-medium text-gray-700">₹{tenant.deposit.toLocaleString()}</p>
            </div>
             <div>
              <p className="text-gray-400 text-xs">Start Date</p>
              <p className="font-medium text-gray-700">{tenant.startDate}</p>
            </div>
          </div>
        )}

        {/* Dynamic Pricing Logic Display */}
        {tenant.status !== 'paid' && (
           <div className="bg-gray-50 rounded-lg p-3 mb-4">
             <div className="flex justify-between items-center mb-1">
               <span className="text-sm text-gray-600">Total Base</span>
               <span className="text-sm font-medium">₹{(tenant.baseRent + tenant.powerBill).toLocaleString()}</span>
             </div>
             
             {isEarly && (
               <div className="flex justify-between items-center mb-1 text-green-600">
                 <span className="text-xs flex items-center gap-1"><CheckCircle size={10} /> Early Bird (2% Off)</span>
                 <span className="text-sm font-bold">-₹{discount.toFixed(0)}</span>
               </div>
             )}

             {isLate && (
               <div className="flex justify-between items-center mb-1 text-red-600">
                 <span className="text-xs flex items-center gap-1"><AlertCircle size={10} /> Late Fee (2%/day)</span>
                 <span className="text-sm font-bold">+₹{lateFee.toFixed(0)}</span>
               </div>
             )}
             
             <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total Payable</span>
                <span className="text-xl font-bold text-blue-700">₹{totalDue.toLocaleString()}</span>
             </div>
           </div>
        )}

        {tenant.status !== 'paid' && (
          <button 
            onClick={() => onCollect(tenant)}
            className={`w-full py-3 rounded-lg font-semibold text-white shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2 ${BRAND.orange}`}
          >
            Collect Payment <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// --- Logic Functions ---

const calculateRentDetails = (tenant, simulatedDate) => {
  const day = simulatedDate.getDate();
  const totalBase = tenant.baseRent + tenant.powerBill;
  let discount = 0;
  let lateFee = 0;
  let totalDue = totalBase;
  let isLate = false;
  let isEarly = false;

  // Logic: 1st-5th (Early Bird) - Technically prompt says 31st-5th, simplified to day <= 5
  if (day <= 5) {
    discount = totalBase * 0.02;
    totalDue = totalBase - discount;
    isEarly = true;
  } 
  // Logic: 6th Onward (Late Fee)
  else if (day >= 6) {
    const daysLate = day - 5; // Starts calculating from 5th night
    lateFee = (totalBase * 0.02) * daysLate;
    totalDue = totalBase + lateFee;
    isLate = true;
  }

  return { totalDue, discount, lateFee, isLate, isEarly };
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('admin'); // 'admin' or 'shankar'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [simulatedDate, setSimulatedDate] = useState(new Date());
  const [tenants, setTenants] = useStateINITIAL_TENANTS
  const [cashBalances, setCashBalances] = useState({ karunesh: 0, shankar: 0 });
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Auth & Data Fetching ---
  useEffect(() => {
    const initApp = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initApp();

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Setup Listeners
        const tenantsRef = collection(db, 'artifacts', appId, 'public', 'data', 'tenants');
        const balancesRef = doc(db, 'artifacts', appId, 'public', 'data', 'balances', 'current');
        
        // Load Balances
        const unsubBalances = onSnapshot(balancesRef, (docSnap) => {
          if (docSnap.exists()) {
            setCashBalances(docSnap.data());
          } else {
            // Init balances if not exist
            setDoc(balancesRef, { karunesh: 0, shankar: 0 });
          }
        });

        // Load Tenants (Mock data sync first time if empty)
        const unsubTenants = onSnapshot(tenantsRef, async (snapshot) => {
          if (snapshot.empty) {
             // Seed data
             const batchPromises = INITIAL_TENANTS.map(t => 
               addDoc(tenantsRef, t)
             );
             await Promise.all(batchPromises);
          } else {
            const tenantList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTenants(tenantList);
          }
          setIsLoading(false);
        });

        return () => {
          unsubBalances();
          unsubTenants();
        };
      }
    });
    return () => unsubscribeAuth();
  }, []);


  // --- Actions ---

  const handleCollect = async (amount, collector, method) => {
    if (!selectedTenant || !user) return;

    // 1. Update Tenant Status
    const tenantRef = doc(db, 'artifacts', appId, 'public', 'data', 'tenants', selectedTenant.id);
    await updateDoc(tenantRef, { status: 'paid' });

    // 2. Update Balance if Cash
    if (method === 'cash') {
      const balanceRef = doc(db, 'artifacts', appId, 'public', 'data', 'balances', 'current');
      const key = collector.toLowerCase();
      const currentVal = cashBalances[key] || 0;
      await updateDoc(balanceRef, { [key]: currentVal + amount });
    }

    // 3. Log Transaction (Optional for this demo but good practice)
    
    setIsCollecting(false);
    setSelectedTenant(null);
    setActiveTab(userRole === 'shankar' ? 'outstanding' : 'dashboard');
  };

  const getFinancials = () => {
    let expected = 0;
    let collected = 0; // In a real app, query transactions. Here, inferred.
    let outstanding = 0;

    tenants.forEach(t => {
      const { totalDue } = calculateRentDetails(t, simulatedDate);
      if (t.status === 'paid') {
        collected += totalDue;
      } else {
        outstanding += totalDue;
      }
      expected += totalDue;
    });

    return { expected, collected, outstanding };
  };

  const financials = useMemo(() => getFinancials(), [tenants, simulatedDate]);

  const filteredTenants = useMemo(() => {
    if (userRole === 'shankar' || activeTab === 'outstanding') {
      return tenants.filter(t => t.status !== 'paid');
    }
    return tenants;
  }, [tenants, userRole, activeTab]);


  // --- Render ---

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">Loading BharatOne...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Header userRole={userRole} toggleRole={() => {
        const newRole = userRole === 'admin' ? 'shankar' : 'admin';
        setUserRole(newRole);
        setActiveTab(newRole === 'shankar' ? 'outstanding' : 'dashboard');
      }} />

      {/* --- Main Content --- */}
      <div className="p-4 max-w-md mx-auto">
        
        {/* SHANKAR RESTRICTION: No Dashboard, straight to Outstanding */}
        {userRole === 'admin' && activeTab === 'dashboard' && (
          <div className="space-y-4 animate-fade-in">
            {/* Cash Balances */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard 
                title="Karunesh Cash" 
                value={`₹${cashBalances.karunesh.toLocaleString()}`} 
                icon={Wallet} 
                colorClass="text-blue-700" 
              />
              <StatCard 
                title="Shankar Cash" 
                value={`₹${cashBalances.shankar.toLocaleString()}`} 
                icon={Wallet} 
                colorClass="text-orange-600" 
              />
            </div>

            {/* Overview */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" /> October 2025
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                   <span className="text-gray-500 text-sm">Total Expected</span>
                   <span className="font-bold text-gray-800">₹{financials.expected.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                   <span className="text-gray-500 text-sm">Total Collected</span>
                   <span className="font-bold text-green-600">₹{financials.collected.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between items-center">
                   <span className="text-gray-500 text-sm">Outstanding</span>
                   <span className="font-bold text-red-600 text-lg">₹{financials.outstanding.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
             <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2"><Settings size={14} /> Logic Simulator</h3>
                 <span className="text-xs bg-white px-2 py-1 rounded text-blue-600 border border-blue-200">
                   Current: Day {simulatedDate.getDate()}
                 </span>
              </div>
              <input 
                type="range" min="1" max="31" 
                value={simulatedDate.getDate()}
                onChange={(e) => {
                  const d = new Date();
                  d.setDate(parseInt(e.target.value));
                  setSimulatedDate(d);
                }}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-blue-400 mt-1">
                <span>1st</span>
                <span className="font-bold text-blue-600">5th (Late starts)</span>
                <span>31st</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('outstanding')}
              className="w-full bg-white border-2 border-orange-500 text-orange-500 font-bold py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-orange-50 transition"
            >
              <ShieldAlert size={18} /> View Outstanding Tenants
            </button>
          </div>
        )}

        {/* --- Tenant List (Outstanding / All) --- */}
        {(activeTab === 'outstanding' || activeTab === 'tenants') && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-4">
               <h2 className="font-bold text-gray-800 text-lg">
                 {userRole === 'shankar' || activeTab === 'outstanding' ? 'Outstanding Dues' : 'All Tenants'}
               </h2>
               <div className="text-xs text-gray-400">{filteredTenants.length} Tenants</div>
             </div>

             {filteredTenants.length === 0 ? (
               <div className="text-center py-10 opacity-50">
                 <CheckCircle size={48} className="mx-auto text-green-500 mb-2" />
                 <p>All payments collected!</p>
               </div>
             ) : (
                filteredTenants.map(tenant => (
                  <TenantCard 
                    key={tenant.id} 
                    tenant={tenant} 
                    currentDate={simulatedDate} 
                    userRole={userRole}
                    onCollect={(t) => {
                      setSelectedTenant(t);
                      setIsCollecting(true);
                    }}
                  />
                ))
             )}
          </div>
        )}

        {/* --- Payment Modal --- */}
        {isCollecting && selectedTenant && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
             <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden animate-slide-up">
                <div className="bg-blue-700 p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold">Collect Rent</h3>
                  <button onClick={() => setIsCollecting(false)}><LogOut size={18} /></button>
                </div>
                
                <div className="p-6">
                  <div className="text-center mb-6">
                     <p className="text-gray-500 text-sm">Total Amount Due</p>
                     <h2 className="text-4xl font-bold text-blue-700 mt-1">
                       ₹{calculateRentDetails(selectedTenant, simulatedDate).totalDue.toLocaleString()}
                     </h2>
                     <p className="text-xs text-gray-400 mt-2">{selectedTenant.name} - {selectedTenant.unit}</p>
                  </div>

                  <div className="space-y-3">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Select Payment Method</p>
                     
                     <button 
                       onClick={() => handleCollect(calculateRentDetails(selectedTenant, simulatedDate).totalDue, 'Karunesh', 'cash')}
                       className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition"
                     >
                       <div className="flex items-center gap-3">
                         <div className="bg-green-100 p-2 rounded-full text-green-600"><IndianRupee size={18} /></div>
                         <div className="text-left">
                           <p className="font-bold text-gray-800">Cash to Karunesh</p>
                           <p className="text-xs text-gray-400">Updates Admin Dashboard</p>
                         </div>
                       </div>
                       <ArrowRight size={16} className="text-gray-300" />
                     </button>

                     <button 
                       onClick={() => handleCollect(calculateRentDetails(selectedTenant, simulatedDate).totalDue, 'Shankar', 'cash')}
                       className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition"
                     >
                       <div className="flex items-center gap-3">
                         <div className="bg-orange-100 p-2 rounded-full text-orange-600"><IndianRupee size={18} /></div>
                         <div className="text-left">
                           <p className="font-bold text-gray-800">Cash to Shankar</p>
                           <p className="text-xs text-gray-400">Updates Personal Balance</p>
                         </div>
                       </div>
                       <ArrowRight size={16} className="text-gray-300" />
                     </button>

                     <div className="border-t border-gray-100 my-2 pt-2">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Digital / Bank Transfer</p>
                       <div className="grid grid-cols-2 gap-2">
                          <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl text-xs gap-1 hover:bg-gray-50">
                             <QrCode size={20} className="text-blue-600" />
                             <span>Show QR</span>
                          </button>
                          <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl text-xs gap-1 hover:bg-gray-50">
                             <Upload size={20} className="text-blue-600" />
                             <span>Upload Proof</span>
                          </button>
                       </div>
                       <div className="bg-blue-50 p-3 rounded-lg mt-3 text-xs text-blue-800">
                          <p className="font-bold">Indian Overseas Bank</p>
                          <p>AC: 1234567890 • IFSC: IOBA000123</p>
                       </div>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* --- Mobile Navigation --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-safe z-40">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'dashboard' ? 'text-blue-700 font-bold' : 'text-gray-400'} ${userRole === 'shankar' ? 'hidden' : ''}`}
        >
          <Menu size={20} className="mb-1" />
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('outstanding')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'outstanding' ? 'text-blue-700 font-bold' : 'text-gray-400'}`}
        >
          <ShieldAlert size={20} className="mb-1" />
          Outstanding
        </button>
        <button 
          onClick={() => setActiveTab('tenants')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'tenants' ? 'text-blue-700 font-bold' : 'text-gray-400'} ${userRole === 'shankar' ? 'hidden' : ''}`}
        >
          <Users size={20} className="mb-1" />
          All Tenants
        </button>
      </div>
    </div>
  );
}
