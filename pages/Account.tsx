import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserTier } from '../types';
import { 
  Settings, 
  ChevronRight, 
  Users, 
  Link as LinkIcon, 
  BarChart2, 
  UserCog, 
  HelpCircle, 
  Package, 
  ShieldCheck, 
  Info, 
  Wallet, 
  Zap, 
  BarChart3,
  Eye,
  EyeOff,
  Crown,
  Layout,
  ImageIcon,
  Database,
  Monitor,
  Check,
  Megaphone,
  Lock,
  Edit3,
  Sparkles,
  CheckCircle2,
  X,
  UserCheck,
  Share2,
  RefreshCw,
  Smartphone,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Account: React.FC = () => {
  const { user, getCommissionRate, team, kycStatus, commissions, orders, t, updateUserSecurity, isSecurityUnlocked, setIsSecurityUnlocked, logout } = useApp();
  const navigate = useNavigate();

  const isAdmin = user?.email === 'synergyflow.my@gmail.com';

  const [showEarnings, setShowEarnings] = useState<boolean>(() => {
    const saved = localStorage.getItem('synergy_privacy_mode');
    return saved === null ? true : saved === 'true';
  });

  const [animatedEarnings, setAnimatedEarnings] = useState(0);
  const [animatedSales, setAnimatedSales] = useState(0);

  // PIN Gate States
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pinFlow, setPinFlow] = useState<'verify' | 'setup' | 'confirm' | 'recovery'>('verify');
  const [tempPin, setTempPin] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string>('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Reset security state whenever account page mounts to ensure "Every Time" requirement
  useEffect(() => {
    setIsSecurityUnlocked(false);
    localStorage.setItem('synergy_privacy_mode', showEarnings.toString());
  }, [showEarnings, setIsSecurityUnlocked]);

  if (!user) return null;

  const todayString = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const userCommissions = commissions;
  const todayTxs = userCommissions.filter(c => c.date.includes(todayString));
  const todayOrders = orders.filter(o => o.date.includes(todayString));
  const todayOrderIds = new Set(todayOrders.map(o => o.id));

  const dailyEarnings = todayTxs
    .filter(c => c.amount > 0 && (c.type === 'Direct' || c.type === 'Team'))
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const referralSalesVolume = todayTxs
    .filter(c => (c.type === 'Direct' || c.type === 'Team') && (!c.orderId || !todayOrderIds.has(c.orderId)))
    .reduce((acc, curr) => acc + (curr.salesVolume || 0), 0);

  const personalSalesVolume = todayOrders.reduce((acc, curr) => acc + curr.total, 0);
  const totalDailySalesVolume = referralSalesVolume + personalSalesVolume;

  const preciseDailyEarnings = Math.round((dailyEarnings + Number.EPSILON) * 100) / 100;
  const preciseDailySales = Math.round((totalDailySalesVolume + Number.EPSILON) * 100) / 100;

  useEffect(() => {
    const duration = 1200;
    const frameRate = 60;
    const totalFrames = Math.round(duration / (1000 / frameRate));
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setAnimatedEarnings(preciseDailyEarnings * easeOut);
      setAnimatedSales(preciseDailySales * easeOut);
      if (frame === totalFrames) clearInterval(timer);
    }, 1000 / frameRate);
    return () => clearInterval(timer);
  }, [preciseDailyEarnings, preciseDailySales]);

  let globalProgress = 0; 
  if (user.accumulatedSales >= 18000) {
      globalProgress = 75 + Math.min(25, ((user.accumulatedSales - 18000) / 18000) * 25); 
      if (globalProgress > 100) globalProgress = 100;
  } else if (user.accumulatedSales >= 9000) {
      globalProgress = 50 + ((user.accumulatedSales - 9000) / (18000 - 9000)) * 25;
  } else if (user.accumulatedSales >= 3000) {
      globalProgress = 25 + ((user.accumulatedSales - 3000) / (9000 - 3000)) * 25;
  } else {
      globalProgress = (user.accumulatedSales / 3000) * 25;
  }

  const currentRate = (getCommissionRate() * 100).toFixed(0);

  const getTierColors = (tier: UserTier) => {
    switch (tier) {
      case UserTier.EXECUTIVE:
        return { 
          gradient: 'from-amber-500 via-amber-400 to-orange-500', 
          border: 'border-amber-600/30', 
          cardGradient: 'from-amber-400 via-orange-50 to-white dark:via-orange-900/20 dark:to-gray-800',
          text: 'text-amber-600 dark:text-amber-400', 
          bgLight: 'bg-amber-50 dark:bg-amber-900/30', 
          progress: 'bg-gradient-to-r from-amber-400 to-orange-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]', 
          decoration: 'from-amber-400/20', 
          icon: Crown 
        };
      case UserTier.BUILDER:
        return { 
          gradient: 'from-purple-800 via-purple-600 to-indigo-700', 
          border: 'border-purple-800/30', 
          cardGradient: 'from-purple-700 via-indigo-50 to-white dark:via-indigo-900/20 dark:to-gray-800',
          text: 'text-purple-700 dark:text-purple-400', 
          bgLight: 'bg-purple-50 dark:bg-purple-900/30', 
          progress: 'bg-gradient-to-r from-purple-700 to-indigo-900 shadow-[0_0_15px_rgba(126,34,206,0.4)]', 
          decoration: 'from-purple-700/20', 
          icon: Zap 
        };
      case UserTier.MARKETER: 
        return { 
          gradient: 'from-pink-600 via-pink-500 to-rose-500', 
          border: 'border-pink-700/30', 
          cardGradient: 'from-pink-500 via-pink-50 to-white dark:via-pink-900/20 dark:to-gray-800',
          text: 'text-pink-600 dark:text-pink-400', 
          bgLight: 'bg-pink-50 dark:bg-pink-900/30', 
          progress: 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]', 
          decoration: 'from-pink-400/20', 
          icon: BarChart3 
        };
      default:
        return { 
          gradient: 'from-synergy-dark via-synergy-blue to-blue-400', 
          border: 'border-synergy-dark/30', 
          cardGradient: 'from-synergy-blue via-blue-50 to-white dark:via-blue-900/20 dark:to-gray-800',
          text: 'text-synergy-blue dark:text-blue-400', 
          bgLight: 'bg-blue-50 dark:bg-blue-900/30', 
          progress: 'bg-synergy-blue shadow-[0_0_15px_rgba(0,181,255,0.4)]', 
          decoration: 'from-synergy-blue/20', 
          icon: UserCog 
        };
    }
  };

  const colors = getTierColors(user.tier);

  const triggerPinGate = (route: string) => {
    setTargetRoute(route);
    if (!user.pin || user.pin.trim() === "") {
        setPinFlow('setup');
    } else {
        setPinFlow('verify');
    }
    setIsVerifyingPin(true);
    setPin('');
    setPinError(false);
  };

  const handlePinInput = (value: string) => {
    if (value.length > 6) return;
    setPin(value);
    setPinError(false);

    if (value.length === 6) {
      if (pinFlow === 'verify') {
        if (value === user.pin) {
          setIsSecurityUnlocked(true);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setIsVerifyingPin(false);
            navigate(targetRoute);
          }, 800);
        } else {
          setPinError(true);
          setTimeout(() => setPin(''), 500);
        }
      } else if (pinFlow === 'setup') {
        setTempPin(value);
        setTimeout(() => {
          setPin('');
          setPinFlow('confirm');
        }, 300);
      } else if (pinFlow === 'confirm') {
        if (value === tempPin) {
          updateUserSecurity('pin', value);
          setIsSecurityUnlocked(true);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setIsVerifyingPin(false);
            navigate(targetRoute);
          }, 1000);
        } else {
          setPinError(true);
          setTimeout(() => {
            setPin('');
            setTempPin('');
            setPinFlow('setup');
          }, 500);
        }
      }
    }
  };

  const handleForgotPin = () => {
    setPinFlow('recovery');
    setRecoveryOtp('');
  };

  const handleVerifyRecoveryOtp = (value: string) => {
    const val = value.replace(/[^0-9]/g, '').slice(0, 6);
    setRecoveryOtp(val);
    if (val.length === 6) {
        setIsVerifyingOtp(true);
        setTimeout(() => {
            setIsVerifyingOtp(false);
            setPinFlow('setup');
        }, 1500);
    }
  };

  const getPinTitle = () => {
    if (showSuccess) return "Success!";
    switch (pinFlow) {
      case 'verify': return 'Enter Security PIN';
      case 'setup': return 'Set New PIN';
      case 'confirm': return 'Confirm New PIN';
      case 'recovery': return 'PIN Recovery';
    }
  };

  const handleShareProfile = async () => {
    const shareData = {
      title: 'Join Synergy Flow',
      text: `Start earning with Synergy Flow! My Referral Code: ${user.referralCode}`,
      url: `https://synergyflow.app/ref/${user.referralCode}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Referral link copied to clipboard!');
    }
  };

  const MenuRow = ({ icon: Icon, label, value, to, colorClass, requiresPin }: any) => (
    <button 
      onClick={() => { 
        if (requiresPin) {
            triggerPinGate(to);
        } else if (to) {
            navigate(to); 
        }
      }}
      className={`w-full flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[24px] shadow-sm mb-3 active:scale-[0.99] transition border border-white/60 dark:border-gray-700`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-xl ${colorClass || 'bg-blue-50 dark:bg-gray-700 text-synergy-blue'} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {value && <span className="text-xs text-gray-400 font-medium">{value}</span>}
        <ChevronRight size={16} className="text-gray-300 dark:text-gray-500" />
      </div>
    </button>
  );

  return (
    <div className="pb-0 pt-0 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative overflow-x-hidden">
      
      {/* 1. TOP BACKGROUND HEADER */}
      <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-br ${colors.gradient} border-b-4 ${colors.border} z-0 shadow-lg`}>
          <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10px] right-[-10px] w-32 h-32 bg-black/5 rounded-full blur-2xl"></div>

          {/* Status Badge in Top Right Corner */}
          <div className="absolute top-8 right-6 z-20">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 flex items-center shadow-lg animate-in fade-in slide-in-from-right-4 duration-700">
                  <span className="text-[10px] font-black text-white tracking-widest uppercase italic">
                      {user.tier} Affiliate
                  </span>
              </div>
          </div>
      </div>

      {/* PIN Security Gate Overlay */}
      {isVerifyingPin && (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-6 transition-all duration-300 animate-in fade-in">
              <button 
                onClick={() => setIsVerifyingPin(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400"
              >
                  <X size={20} />
              </button>

              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-8 transition-all duration-500 ${showSuccess ? 'bg-emerald-500 text-white scale-110' : 'bg-gray-50 dark:bg-gray-800 text-synergy-blue border border-gray-100 dark:border-gray-700'}`}>
                {showSuccess ? <CheckCircle2 size={40} className="animate-in zoom-in" /> : (pinFlow === 'recovery' ? <Smartphone size={32} className="text-amber-500" /> : (pinFlow === 'verify' ? <Lock size={32} /> : <Sparkles size={32} className="animate-pulse" />))}
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">{getPinTitle()}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 text-center max-w-[260px] leading-relaxed font-medium">
                  {showSuccess ? "Verification confirmed. Accessing profile..." : (pinFlow === 'recovery' ? "Enter the verification code sent to your device." : (pinFlow === 'setup' ? "Create a new 6-digit PIN for your account." : "Enter your PIN to access sensitive information."))}
              </p>
              
              {pinFlow === 'recovery' ? (
                  <div className="w-full space-y-6 flex flex-col items-center animate-in fade-in">
                    <input 
                        type="number" 
                        pattern="[0-9]*" 
                        inputMode="numeric"
                        autoFocus
                        placeholder="000000"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl py-6 text-center text-4xl font-black text-synergy-blue tracking-[0.3em] outline-none focus:ring-2 focus:ring-synergy-blue/10"
                        value={recoveryOtp}
                        onChange={(e) => handleVerifyRecoveryOtp(e.target.value)}
                        disabled={isVerifyingOtp}
                    />
                    {isVerifyingOtp && (
                        <div className="flex items-center space-x-2 text-synergy-blue animate-pulse">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Validating...</span>
                        </div>
                    )}
                  </div>
              ) : (
                  <>
                    <div className="flex space-x-4 mb-10">
                        {[...Array(6)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-synergy-blue scale-125 shadow-glow' : 'bg-gray-200 dark:bg-gray-700'} ${pinError ? 'bg-red-500' : ''}`}
                        />
                        ))}
                    </div>

                    {pinFlow === 'verify' && (
                        <button 
                        onClick={handleForgotPin}
                        className="mb-8 flex items-center space-x-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-synergy-blue transition"
                        >
                        <RefreshCw size={12} />
                        <span>Forgot Security PIN?</span>
                        </button>
                    )}

                    <input 
                        type="number" 
                        pattern="[0-9]*" 
                        inputMode="numeric"
                        autoFocus
                        className="opacity-0 absolute inset-0 h-full w-full cursor-pointer z-10"
                        value={pin}
                        onChange={(e) => handlePinInput(e.target.value)}
                    />
                  </>
              )}
          </div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-t-[40px] mt-32 pt-10 px-4 pb-12 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] min-h-screen">
          
          {/* Action Icons Area */}
          <div className="absolute top-6 right-6 flex items-center space-x-2.5 z-30">
              <button 
                onClick={() => navigate('/withdraw')}
                className={`w-9 h-9 ${colors.bgLight} backdrop-blur-sm rounded-full flex items-center justify-center ${colors.text} shadow-sm border border-white dark:border-gray-700 active:scale-90 transition-all`}
              >
                  <Wallet size={18} />
              </button>
              <button 
                onClick={() => navigate('/referrer-info')}
                className={`w-9 h-9 ${colors.bgLight} backdrop-blur-sm rounded-full flex items-center justify-center ${colors.text} shadow-sm border border-white dark:border-gray-700 active:scale-90 transition-all`}
              >
                  <UserCheck size={18} />
              </button>
              <button 
                onClick={handleShareProfile}
                className={`w-9 h-9 ${colors.bgLight} backdrop-blur-sm rounded-full flex items-center justify-center ${colors.text} shadow-sm border border-white dark:border-gray-700 active:scale-90 transition-all`}
              >
                  <Share2 size={18} />
              </button>
          </div>

          {/* PROFILE SECTION */}
          <div className="mb-4 relative z-20 flex flex-col items-start -mt-[104px] px-5 space-y-3">
              <button 
                onClick={() => triggerPinGate('/edit-profile')}
                className="relative w-28 h-28 group block active:scale-95 transition-transform shrink-0"
              >
                <div className="w-28 h-28 rounded-full border-[3px] border-white dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-700 transition-all group-hover:ring-8 group-hover:ring-synergy-blue/10">
                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Lock size={26} className="text-white opacity-60" />
                </div>
              </button>
              
              <div className="flex flex-col text-left">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm leading-tight">{user.name}</h2>
                    {kycStatus === 'Verified' && (
                        <div className="bg-emerald-500 text-white rounded-full p-0.5 shadow-sm flex items-center justify-center">
                            <Check size={10} strokeWidth={4} />
                        </div>
                    )}
                  </div>
              </div>
          </div>

          {/* Feature Card: Daily Earnings */}
          <div 
            onClick={() => navigate('/commissions')}
            className="w-full text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[24px] p-6 mb-6 shadow-soft dark:shadow-none border border-white/60 dark:border-gray-700 relative overflow-hidden group transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <div className="text-center mb-6 relative z-10">
                <div className={`inline-flex items-center space-x-2 ${colors.bgLight} px-3 py-1.5 rounded-full mb-2 border border-white/50 dark:border-gray-600 shadow-sm`}>
                    <span className={`text-[10px] ${colors.text} font-black uppercase tracking-wider`}>Daily Earnings</span>
                </div>
                <div className="h-10 flex flex-col items-center justify-center">
                    <h2 className={`text-2xl font-black ${colors.text} tracking-tight leading-none`}>
                        ฿{Math.floor(animatedEarnings).toLocaleString()}
                    </h2>
                </div>
            </div>

            <div className="relative z-10">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner relative mb-3">
                     <div 
                        className={`h-full ${colors.progress} rounded-full relative transition-all duration-1000 ease-out`}
                        style={{ width: `${globalProgress}%` }}
                     >
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 rounded-full"></div>
                     </div>
                </div>

                <div className="flex justify-between text-[9px] font-black text-gray-400 dark:text-gray-500 px-1 tracking-widest uppercase">
                    <span className={user.tier === UserTier.STARTER ? 'text-synergy-blue' : ''}>Starter</span>
                    <span className={user.tier === UserTier.MARKETER ? 'text-pink-600' : ''}>Marketer</span>
                    <span className={user.tier === UserTier.BUILDER ? 'text-purple-700 font-black' : ''}>Builder</span>
                    <span className={user.tier === UserTier.EXECUTIVE ? 'text-amber-600 font-black' : ''}>Executive</span>
                </div>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 dark:from-blue-900/20 to-transparent rounded-bl-[100px] pointer-events-none"></div>
            <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${colors.decoration} to-transparent rounded-tr-[80px] pointer-events-none`}></div>
          </div>

          {/* Admin Management Section */}
          {isAdmin && (
            <div className="mb-8 animate-in slide-in-from-bottom-2">
              <h3 className="text-xs font-black text-indigo-500 uppercase ml-2 mb-4 tracking-[0.2em] flex items-center">
                <ShieldCheck size={16} className="mr-2.5" />
                Admin Management
              </h3>
              <div className="space-y-1">
                <MenuRow icon={Database} label="Manage System Operations" to="/admin/dashboard" colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                <MenuRow icon={ImageIcon} label="Update Product Assets" to="/admin/products" colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                <MenuRow icon={Megaphone} label="Update Campaign Assets" to="/admin/campaign-assets" colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                <MenuRow icon={Layout} label="Update Ads & Banners" to="/admin/ads" colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                <MenuRow icon={Monitor} label="Update Onboarding Slides" to="/admin/onboarding" colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase ml-2 mb-4 tracking-[0.2em]">{t('account.dashboard')}</h3>
            <div className="space-y-1">
                <MenuRow icon={Package} label={t('menu.my_orders')} to="/my-orders" />
                <MenuRow 
                    icon={BarChart2} 
                    label={t('menu.commissions')} 
                    value={`Currently ${currentRate}%`} 
                    to="/commissions" 
                />
                <MenuRow icon={LinkIcon} label={t('menu.affiliate_links')} to="/affiliate-links" />
                <MenuRow 
                    icon={Users} 
                    label={t('menu.my_team')} 
                    value={`${team.length} Members`} 
                    to="/my-team" 
                />
            </div>
          </div>

          <div className="pb-10">
             <h3 className="text-xs font-black text-gray-400 uppercase ml-2 mb-4 tracking-[0.2em]">{t('account.personal')}</h3>
             <div className="space-y-1">
                 <MenuRow icon={UserCog} label={t('menu.personal_info')} to="/personal-info" requiresPin={true} />
                 <MenuRow icon={Settings} label={t('menu.preferences')} to="/preferences" />
                 <MenuRow icon={HelpCircle} label={t('menu.help_support')} to="/help-support" />
                 <MenuRow icon={Info} label={t('menu.about_us')} to="/about-us" />
             </div>
          </div>
      </div>
    </div>
  );
};
