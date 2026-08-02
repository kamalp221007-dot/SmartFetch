import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Store, 
  Search, 
  MapPin, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Package,
  Truck,
  LayoutDashboard,
  Plus,
  Trash2,
  X,
  Menu,
  Smartphone,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Shop {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  image: string;
}

interface OwnerKYC {
  upiId: string;
  phone: string;
  email: string;
}

interface CustomerKYC {
  phone: string;
}

interface DashboardStats {
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  cancellations: number;
}

// --- Mock Data ---
const INITIAL_SHOPS: Shop[] = [
  {
    id: '1',
    name: 'Green Grocers',
    category: 'Grocery',
    rating: 4.8,
    location: '2.5 km away',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    name: 'HealthFirst Pharmacy',
    category: 'Pharmacy',
    rating: 4.9,
    location: '1.2 km away',
    image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    name: 'Golden Crust Bakery',
    category: 'Bakery',
    rating: 4.7,
    location: '0.8 km away',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    name: 'TechHub Electronics',
    category: 'Electronics',
    rating: 4.6,
    location: '3.1 km away',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80'
  }
];

// --- Components ---

const Background3D = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated Gradient Orbs */}
      <motion.div 
        animate={{ 
          x: [0, 100, 0], 
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"
      />
      <motion.div 
        animate={{ 
          x: [0, -100, 0], 
          y: [0, 100, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full"
      />

      {/* Isometric Grid Simulation */}
      <div className="absolute inset-0 opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(30deg, #1e293b 12%, transparent 12.5%, transparent 87%, #1e293b 87.5%, #1e293b), linear-gradient(150deg, #1e293b 12%, transparent 12.5%, transparent 87%, #1e293b 87.5%, #1e293b), linear-gradient(30deg, #1e293b 12%, transparent 12.5%, transparent 87%, #1e293b 87.5%, #1e293b), linear-gradient(150deg, #1e293b 12%, transparent 12.5%, transparent 87%, #1e293b 87.5%, #1e293b), linear-gradient(60deg, #334155 25%, transparent 25.5%, transparent 75%, #334155 75%, #334155), linear-gradient(60deg, #334155 25%, transparent 25.5%, transparent 75%, #334155 75%, #334155)',
             backgroundSize: '80px 140px',
             perspective: '1000px',
             transform: 'rotateX(60deg) rotateZ(-30deg) scale(2)'
           }} 
      />

      {/* Floating Elements (Isometric Marketplace Feel) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              y: [0, -20, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0]
            }}
            transition={{ 
              duration: 5 + i, 
              repeat: Infinity, 
              delay: i * 0.5 
            }}
            className="absolute"
            style={{
              left: `${15 + (i * 10)}%`,
              top: `${20 + (i * 8)}%`,
            }}
          >
            {i % 3 === 0 ? <Store className="text-blue-400/20 w-12 h-12" /> : 
             i % 3 === 1 ? <Package className="text-purple-400/20 w-8 h-8" /> : 
             <Truck className="text-pink-400/20 w-10 h-10" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Navbar = () => {
  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-6 py-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShoppingBag className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-white">SmartFetch</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#demo" className="hover:text-white transition-colors">Demo</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={scrollToDemo} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</button>
          <button onClick={scrollToDemo} className="btn-primary py-2 px-5 text-sm">Join Now</button>
        </div>
      </div>
    </nav>
  );
};

interface ShopCardProps {
  shop: Shop;
  onRemove?: (id: string) => void;
  onView?: (shop: Shop) => void;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, onRemove, onView }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ y: -8 }}
    className="glass-dark rounded-3xl overflow-hidden group relative"
  >
    <div className="h-48 overflow-hidden relative">
      <img 
        src={shop.image} 
        alt={shop.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-4 right-4 glass px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-white">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        {shop.rating}
      </div>
      {onRemove && (
        <button 
          onClick={() => onRemove(shop.id)}
          className="absolute top-4 left-4 p-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md rounded-lg text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
    <div className="p-5">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{shop.name}</h3>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{shop.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-slate-400 text-sm mb-4">
        <MapPin className="w-4 h-4" />
        {shop.location}
      </div>
      <button 
        onClick={() => onView?.(shop)}
        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all"
      >
        View Shop
      </button>
    </div>
  </motion.div>
);

const DemoPreview = () => {
  const [step, setStep] = useState<'role' | 'phone' | 'otp' | 'kyc' | 'main'>('role');
  const [view, setView] = useState<'customer' | 'shopkeeper'>('customer');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [shops, setShops] = useState<Shop[]>(INITIAL_SHOPS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', category: 'Grocery' });
  const [showTerms, setShowTerms] = useState(false);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [ownerKyc, setOwnerKyc] = useState<OwnerKYC>({ upiId: '', phone: '', email: '' });
  const [customerKyc, setCustomerKyc] = useState<CustomerKYC>({ phone: '' });

  const stats: DashboardStats = {
    todayRevenue: 1250,
    weeklyRevenue: 8400,
    monthlyRevenue: 32000,
    totalOrders: 142,
    avgOrderValue: 225,
    cancellations: 3
  };

  const handleRoleSelect = (role: 'customer' | 'shopkeeper') => {
    setView(role);
    setStep('phone');
  };

  const handleSendOtp = () => {
    if (phoneNumber.length >= 10) {
      setIsSending(true);
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setTimeout(() => {
        setGeneratedOtp(code);
        setIsSending(false);
        setStep('otp');
        setToast({ message: `OTP Sent! Your code is ${code}`, type: 'info' });
      }, 1000);
    }
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setToast({ message: 'OTP Verified Successfully!', type: 'success' });
        setStep('kyc');
        if (view === 'customer') setCustomerKyc({ phone: phoneNumber });
        else setOwnerKyc({ ...ownerKyc, phone: phoneNumber });
      }, 1500);
    } else if (otp.length === 4) {
      setToast({ message: 'Invalid OTP. Please check the code.', type: 'info' });
    }
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('main');
  };

  const filteredShops = shops.filter(s => 
    (filter === 'All' || s.category === filter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShop.name) return;
    
    const shop: Shop = {
      id: Date.now().toString(),
      name: newShop.name,
      category: newShop.category,
      rating: 5.0,
      location: 'Just now',
      image: `https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80`
    };
    
    setShops([shop, ...shops]);
    setIsAdding(false);
    setNewShop({ name: '', category: 'Grocery' });
  };

  const handleRemoveShop = (id: string) => {
    setShops(shops.filter(s => s.id !== id));
  };

  return (
    <div className="w-full max-w-6xl mx-auto glass rounded-[2.5rem] p-4 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Device Frame Header */}
      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="h-8 w-px bg-white/10 mx-2" />
          <div className="flex bg-white/5 rounded-xl p-1">
            <button 
              onClick={() => setView('customer')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'customer' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Customer View
            </button>
            <button 
              onClick={() => setView('shopkeeper')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'shopkeeper' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Shopkeeper View
            </button>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
          <Smartphone className="w-4 h-4" />
          <span>Interactive Prototype</span>
        </div>
      </div>

      <div className="min-h-[500px] relative">
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={`fixed top-24 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 ${
                toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
              <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
        {step === 'role' && (
          <div className="flex flex-col items-center justify-center h-full py-12 space-y-8">
            <h3 className="text-2xl font-bold text-white">Choose Your Role to Start Demo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
              <button 
                onClick={() => handleRoleSelect('customer')}
                className="glass p-8 rounded-3xl text-center hover:bg-blue-600/10 border-blue-500/20 transition-all group"
              >
                <ShoppingBag className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <span className="block text-xl font-bold text-white">Customer</span>
                <span className="text-sm text-slate-400">Browse nearby shops</span>
              </button>
              <button 
                onClick={() => handleRoleSelect('shopkeeper')}
                className="glass p-8 rounded-3xl text-center hover:bg-purple-600/10 border-purple-500/20 transition-all group"
              >
                <Store className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <span className="block text-xl font-bold text-white">Shopkeeper</span>
                <span className="text-sm text-slate-400">Manage your business</span>
              </button>
            </div>
          </div>
        )}

        {step === 'phone' && (
          <div className="flex flex-col items-center justify-center h-full py-12 space-y-8">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">Enter Your Number</h3>
              <p className="text-slate-400">We'll send a verification code to your phone</p>
            </div>
            <div className="w-full max-w-xs">
              <input 
                type="tel" 
                placeholder="+91 00000 00000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full glass-dark rounded-xl py-4 px-6 text-center text-xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button 
              onClick={handleSendOtp}
              disabled={phoneNumber.length < 10 || isSending}
              className="btn-primary w-full max-w-xs"
            >
              {isSending ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="flex flex-col items-center justify-center h-full py-12 space-y-8">
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-blue-400" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">Verify Your Number</h3>
              <p className="text-slate-400">Enter the 4-digit code sent to your device</p>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl inline-block">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Demo OTP Code</p>
                <p className="text-2xl font-mono font-bold text-white tracking-[0.5em] mt-1">{generatedOtp}</p>
              </div>
            </div>
            <div className="flex gap-4">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={otp[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (!val && e.target.value !== '') return; // Prevent non-numeric
                    
                    const newOtpArr = otp.split('');
                    newOtpArr[i] = val;
                    const newOtp = newOtpArr.join('');
                    setOtp(newOtp);
                    
                    if (val && i < 3) {
                      const next = e.target.nextSibling as HTMLInputElement;
                      if (next) next.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[i] && i > 0) {
                      const prev = (e.target as HTMLInputElement).previousSibling as HTMLInputElement;
                      if (prev) {
                        prev.focus();
                        const newOtpArr = otp.split('');
                        newOtpArr[i-1] = '';
                        setOtp(newOtpArr.join(''));
                      }
                    }
                  }}
                  className="w-14 h-14 glass-dark rounded-xl text-center text-2xl font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              ))}
            </div>
            <button 
              onClick={handleVerifyOtp}
              disabled={otp.length < 4 || isVerifying}
              className="btn-primary w-full max-w-xs"
            >
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button 
              onClick={() => setStep('phone')}
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Change Phone Number
            </button>
          </div>
        )}

        {step === 'kyc' && (
          <div className="max-w-md mx-auto py-12">
            <h3 className="text-2xl font-bold text-white mb-2">Complete Verification</h3>
            <p className="text-slate-400 mb-8">Mandatory KYC for platform safety</p>
            <form onSubmit={handleKycSubmit} className="space-y-4">
              {view === 'shopkeeper' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">UPI ID (Mandatory)</label>
                    <input 
                      type="text" required 
                      className="w-full glass-dark rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="yourname@upi"
                      value={ownerKyc.upiId}
                      onChange={(e) => setOwnerKyc({...ownerKyc, upiId: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phone Number</label>
                    <input 
                      type="tel" required 
                      className="w-full glass-dark rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+91 98765 43210"
                      value={ownerKyc.phone}
                      onChange={(e) => setOwnerKyc({...ownerKyc, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address</label>
                    <input 
                      type="email" required 
                      className="w-full glass-dark rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="owner@example.com"
                      value={ownerKyc.email}
                      onChange={(e) => setOwnerKyc({...ownerKyc, email: e.target.value})}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Phone Number (Mandatory)</label>
                  <input 
                    type="tel" required 
                    className="w-full glass-dark rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 43210"
                    value={customerKyc.phone}
                    onChange={(e) => setCustomerKyc({...customerKyc, phone: e.target.value})}
                  />
                </div>
              )}
              <div className="flex items-start gap-3 py-4">
                <input type="checkbox" required className="mt-1" />
                <p className="text-xs text-slate-500">
                  I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-blue-400 underline">Terms & Conditions</button> and Privacy Policy. I understand that rules are system-enforced and non-negotiable.
                </p>
              </div>
              <button type="submit" className="btn-primary w-full">Complete Registration</button>
            </form>
          </div>
        )}

        {step === 'main' && view === 'customer' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search nearby shops..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                {['All', 'Grocery', 'Pharmacy', 'Bakery', 'Electronics'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === cat ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/20'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredShops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} onView={setActiveShop} />
                ))}
              </AnimatePresence>
            </div>
            
            {filteredShops.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-500">No shops found matching your search.</p>
              </div>
            )}
          </motion.div>
        ) : step === 'main' && view === 'shopkeeper' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Owner Dashboard Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Today's Revenue", value: `₹${stats.todayRevenue}`, color: "text-emerald-400" },
                { label: "Weekly Revenue", value: `₹${stats.weeklyRevenue}`, color: "text-blue-400" },
                { label: "Monthly Revenue", value: `₹${stats.monthlyRevenue}`, color: "text-purple-400" },
                { label: "Total Orders", value: stats.totalOrders, color: "text-white" },
                { label: "Avg. Order", value: `₹${stats.avgOrderValue}`, color: "text-white" },
                { label: "Cancellations", value: stats.cancellations, color: "text-red-400" },
              ].map((stat, i) => (
                <div key={i} className="glass-dark p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">My Shops</h2>
                <p className="text-slate-400 text-sm">Manage your business visibility</p>
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="btn-primary flex items-center gap-2 py-2.5"
              >
                <Plus className="w-5 h-5" />
                Add New Shop
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} onRemove={handleRemoveShop} onView={setActiveShop} />
                ))}
              </AnimatePresence>
            </div>

            {/* Add Shop Modal Overlay */}
            <AnimatePresence>
              {isAdding && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-dark w-full max-w-md rounded-[2rem] p-8 relative"
                  >
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="absolute top-6 right-6 text-slate-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-xl font-bold text-white mb-6">Register Your Shop</h3>
                    <form onSubmit={handleAddShop} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shop Name</label>
                        <input 
                          type="text" 
                          required
                          value={newShop.name}
                          onChange={(e) => setNewShop({...newShop, name: e.target.value})}
                          placeholder="e.g. Fresh Market"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                        <select 
                          value={newShop.category}
                          onChange={(e) => setNewShop({...newShop, category: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                        >
                          <option value="Grocery">Grocery</option>
                          <option value="Pharmacy">Pharmacy</option>
                          <option value="Bakery">Bakery</option>
                          <option value="Electronics">Electronics</option>
                        </select>
                      </div>
                      <div className="pt-4">
                        <button type="submit" className="w-full btn-primary bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/20">
                          List My Shop
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terms & Privacy Modal */}
            <AnimatePresence>
              {showTerms && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-dark w-full max-w-2xl rounded-[2rem] p-8 relative max-h-[80vh] overflow-y-auto"
                  >
                    <button 
                      onClick={() => setShowTerms(false)}
                      className="absolute top-6 right-6 text-slate-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-2xl font-bold text-white mb-6">Terms & Privacy Policy</h3>
                    <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
                      <section>
                        <h4 className="text-white font-bold mb-2">1. Rule Enforcement</h4>
                        <p>All platform rules are fixed and non-negotiable. Penalties and account blocks are system-driven based on behavior and compliance.</p>
                      </section>
                      <section>
                        <h4 className="text-white font-bold mb-2">2. Privacy & Data Isolation</h4>
                        <p>Strict data isolation is enforced. No user can access another user's account details, orders, or payment history. Owner data is strictly visible only to the owner and SmartFetch administrators.</p>
                      </section>
                      <section>
                        <h4 className="text-white font-bold mb-2">3. KYC Requirements</h4>
                        <p>Owners must provide valid UPI ID, Phone, and Email. Customers must verify their Phone number via OTP. All data is encrypted and used solely for platform verification.</p>
                      </section>
                      <section>
                        <h4 className="text-white font-bold mb-2">4. Marketplace Conduct</h4>
                        <p>Shopkeepers are responsible for the accuracy of their listings. Customers are responsible for their interactions with local businesses.</p>
                      </section>
                    </div>
                    <button 
                      onClick={() => setShowTerms(false)}
                      className="w-full btn-primary mt-8"
                    >
                      I Understand
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shop Detail Modal */}
            <AnimatePresence>
              {activeShop && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-dark w-full max-w-3xl rounded-[2.5rem] overflow-hidden relative"
                  >
                    <button 
                      onClick={() => setActiveShop(null)}
                      className="absolute top-6 right-6 z-10 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="h-64 md:h-auto">
                        <img 
                          src={activeShop.image} 
                          alt={activeShop.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-8 space-y-6">
                        <div>
                          <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                            {activeShop.category}
                          </span>
                          <h3 className="text-3xl font-bold text-white mt-2">{activeShop.name}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-bold">{activeShop.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{activeShop.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className="text-slate-400 text-sm leading-relaxed">
                            Welcome to {activeShop.name}. We provide high-quality {activeShop.category.toLowerCase()} products to our local community. Visit us today or contact us for more details.
                          </p>
                          <div className="flex gap-3">
                            <div className="flex-1 glass p-3 rounded-xl text-center">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                              <p className="text-emerald-400 font-bold">Open Now</p>
                            </div>
                            <div className="flex-1 glass p-3 rounded-xl text-center">
                              <p className="text-[10px] font-bold text-slate-500 uppercase">Delivery</p>
                              <p className="text-blue-400 font-bold">Available</p>
                            </div>
                          </div>
                        </div>
                        <button className="w-full btn-primary">Contact Shop</button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Shop Details Modal */}
            <AnimatePresence>
              {activeShop && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-dark w-full max-w-2xl rounded-[2.5rem] overflow-hidden relative"
                  >
                    <button 
                      onClick={() => setActiveShop(null)}
                      className="absolute top-6 right-6 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <div className="h-64 relative">
                      <img 
                        src={activeShop.image} 
                        alt={activeShop.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-8">
                        <span className="px-3 py-1 rounded-lg bg-blue-600 text-[10px] font-bold uppercase tracking-widest text-white mb-2 inline-block">
                          {activeShop.category}
                        </span>
                        <h3 className="text-3xl font-bold text-white">{activeShop.name}</h3>
                      </div>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="font-bold">{activeShop.rating}</span>
                          </div>
                          <div className="h-4 w-px bg-white/10" />
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <span>{activeShop.location}</span>
                          </div>
                        </div>
                        <span className="text-emerald-400 text-sm font-bold">Open Now</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        Experience the best of local commerce at {activeShop.name}. We offer a wide range of premium products and exceptional service to our community.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="btn-primary py-4">Order Now</button>
                        <button className="btn-secondary py-4">Contact Shop</button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="relative min-h-screen font-sans">
      <Background3D />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 inline-block">
              Welcome to the Future of Local Shopping
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Find Nearby <span className="text-gradient">Shops Instantly</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              SmartFetch helps customers easily discover nearby local shops while helping shopkeepers bring their businesses online.
            </p>
          </motion.div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-12">
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass p-8 rounded-[2.5rem] text-left group cursor-pointer border-blue-500/10 hover:border-blue-500/30 transition-all"
            >
              <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag className="text-blue-400 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Customer</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Explore nearby shops and discover products available around you.
              </p>
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                Grab Something <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="glass p-8 rounded-[2.5rem] text-left group cursor-pointer border-purple-500/10 hover:border-purple-500/30 transition-all"
            >
              <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Store className="text-purple-400 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Shopkeeper</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Register your shop and make it visible to customers in your area.
              </p>
              <button className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/20 w-full flex items-center justify-center gap-2">
                List My Shop <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Why Choose SmartFetch?</h2>
            <p className="text-slate-400">The ultimate bridge between local commerce and digital convenience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <Search className="w-6 h-6 text-blue-400" />, 
                title: "Discover Nearby", 
                desc: "Find exactly what you need in your immediate vicinity." 
              },
              { 
                icon: <Store className="w-6 h-6 text-purple-400" />, 
                title: "Support Local", 
                desc: "Empower small businesses in your community with every purchase." 
              },
              { 
                icon: <Truck className="w-6 h-6 text-pink-400" />, 
                title: "Fast & Simple", 
                desc: "A streamlined interface designed for speed and ease of use." 
              },
              { 
                icon: <LayoutDashboard className="w-6 h-6 text-emerald-400" />, 
                title: "Modern UX", 
                desc: "Premium experience for both customers and shopkeepers." 
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-3xl hover:bg-white/[0.08] transition-all"
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">See SmartFetch in Action</h2>
            <p className="text-slate-400">Experience the seamless flow of our marketplace platform.</p>
          </div>
          <DemoPreview />
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">How SmartFetch Works</h2>
            <p className="text-slate-400">Getting started is as easy as 1, 2, 3.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Lines (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 -z-10" />
            
            {[
              { 
                step: "01", 
                title: "Choose Your Role", 
                desc: "Sign up as a Customer to browse or a Shopkeeper to list your store.",
                icon: <Menu className="w-6 h-6 text-blue-400" />
              },
              { 
                step: "02", 
                title: "Discover or Register", 
                desc: "Find local gems or bring your physical storefront to the digital world.",
                icon: <Search className="w-6 h-6 text-purple-400" />
              },
              { 
                step: "03", 
                title: "Connect Easily", 
                desc: "Bridge the gap and support your local community with ease.",
                icon: <CheckCircle2 className="w-6 h-6 text-pink-400" />
              }
            ].map((step, i) => (
              <div key={i} className="text-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto relative border border-white/10">
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {step.step}
                  </span>
                  {step.icon}
                </div>
                <h4 className="text-xl font-bold text-white">{step.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[250px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-purple-600/10 -z-10" />
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Start exploring local shops today</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of users and shopkeepers building a stronger local economy together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary px-10 py-4">Find Shops</button>
            <button className="btn-secondary px-10 py-4">Register Your Shop</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-white w-5 h-5" />
                </div>
                <span className="text-lg font-bold font-display tracking-tight text-white">SmartFetch</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connecting communities through local commerce. Discover, support, and grow.
              </p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Platform</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-blue-400 transition-colors">For Customers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">For Shopkeepers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Shop Directory</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Company</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Connect</h5>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer border border-white/10">
                    <div className="w-4 h-4 bg-slate-500 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-medium">
            <p>© 2026 SmartFetch Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400">Terms of Service</a>
              <a href="#" className="hover:text-slate-400">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
