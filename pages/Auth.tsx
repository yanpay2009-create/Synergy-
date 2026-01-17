import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Gift, X, User, Phone, ShieldCheck, Smartphone, Eye, EyeOff, Check, FileText, Circle, KeyRound, RefreshCw } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, addReferrer, systemSettings, t, updateUserSecurity } = useApp();
  const navigate = useNavigate();
  
  // Form State
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetFlow, setIsResetFlow] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
        login(emailOrPhone || 'user@synergy.com');
        navigate('/home');
    } else {
        if (!agreedToTerms) {
            alert("Please agree to the Terms & Conditions by clicking the circle icon.");
            return;
        }
        setIsResetFlow(false);
        setShowOtpModal(true);
    }
  };

  const handleForgotPassword = () => {
      if (!emailOrPhone) {
          alert("Please enter your email or phone number first.");
          return;
      }
      setIsResetFlow(true);
      setShowOtpModal(true);
  };

  const handleVerifyOtp = () => {
      if (otp.length === 6) {
          setShowOtpModal(false);
          setOtp('');
          if (isResetFlow) {
              setShowResetModal(true);
          } else {
              setShowReferralModal(true);
          }
      } else {
          alert("Invalid OTP code.");
      }
  };

  const handleResetPassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 6) {
          alert("Password must be at least 6 characters.");
          return;
      }
      // Mock reset
      updateUserSecurity('password', newPassword);
      alert("Password has been reset successfully! Please sign in.");
      setShowResetModal(false);
      setIsLogin(true);
  };

  const handleFinalizeSignUp = () => {
    login(emailOrPhone || 'user@synergy.com', username);
    if (referralCode) {
        addReferrer(referralCode);
    }
    navigate('/home');
  };

  const handleToggleTerms = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!agreedToTerms) {
          setShowTermsModal(true);
      } else {
          setAgreedToTerms(false);
      }
  };

  const acceptTerms = () => {
      setAgreedToTerms(true);
      setShowTermsModal(false);
  };

  return (
    <div className="min-h-screen bg-apple-gray dark:bg-gray-950 flex flex-col justify-center px-6 max-w-md mx-auto relative transition-colors duration-500 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-synergy-blue/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-soft dark:shadow-soft-dark relative z-10 border border-white/50 dark:border-gray-800 transition-all">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-transparent mx-auto mb-4 flex items-center justify-center">
            {systemSettings.logo ? (
                <img src={systemSettings.logo} className="w-full h-full object-contain" alt="App Logo" />
            ) : (
                <span className="text-5xl font-black bg-gradient-to-tr from-synergy-blue to-purple-600 bg-clip-text text-transparent italic tracking-tighter">S</span>
            )}
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{isLogin ? t('auth.welcome') : t('auth.join')}</h2>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Synergy Flow Network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-300" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-3.5 pl-12 pr-4 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-synergy-blue/20 transition text-sm font-medium"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('auth.email_phone')}</label>
            <div className="relative">
              {emailOrPhone.match(/^[0-9]+$/) ? <Smartphone className="absolute left-4 top-3.5 text-gray-300" size={18} /> : <Mail className="absolute left-4 top-3.5 text-gray-300" size={18} />}
              <input 
                type="text" 
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={t('auth.email_phone')}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-3.5 pl-12 pr-4 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-synergy-blue/20 transition text-sm font-medium"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('auth.pass')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-3.5 pl-12 pr-12 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-synergy-blue/20 transition text-sm font-medium"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-synergy-blue transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button className="w-full bg-synergy-blue text-white font-black py-4 rounded-2xl shadow-glow active:scale-[0.98] transition uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-2">
              <span>{isLogin ? t('auth.signin') : t('auth.signup')}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-2.5 group">
                {/* Checkbox Icon - Only show on Create Account side */}
                {!isLogin && (
                    <button 
                        type="button"
                        onClick={handleToggleTerms}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-synergy-blue border-synergy-blue text-white shadow-sm scale-110' : 'bg-transparent border-gray-300 dark:border-gray-700 hover:border-synergy-blue'}`}
                    >
                        {agreedToTerms && <Check size={10} strokeWidth={4} />}
                    </button>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {isLogin ? "New to Synergy?" : "Already a member?"}{" "}
                  <button 
                    type="button"
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setAgreedToTerms(false);
                    }} 
                    className="text-synergy-blue font-black hover:underline ml-1"
                  >
                    {isLogin ? t('auth.signup') : t('auth.signin')}
                  </button>
                </p>
            </div>
            
            {isLogin && (
                <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-synergy-blue transition flex items-center space-x-1"
                >
                    <RefreshCw size={10} />
                    <span>Forgot Password?</span>
                </button>
            )}
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[80vh] border border-white/20">
                  <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center space-x-2 text-synergy-blue">
                          <FileText size={20} />
                          <h3 className="font-black text-xs uppercase tracking-[0.2em]">Affiliate Agreement</h3>
                      </div>
                      <button onClick={() => setShowTermsModal(false)} className="text-gray-300 hover:text-gray-500 transition"><X size={22} /></button>
                  </div>
                  <div className="p-6 overflow-y-auto no-scrollbar flex-1 bg-white dark:bg-gray-900">
                      <div className="space-y-6">
                          <div>
                              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2 flex items-center"><ShieldCheck size={14} className="mr-2 text-emerald-500" /> 1. Operational Security</h4>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                  Your account is protected by military-grade encryption. Commission tracking is automated via our proprietary Synergy Flow engine to ensure 100% accuracy on every direct and team referral.
                              </p>
                          </div>
                          <div>
                              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2 flex items-center"><Check size={14} className="mr-2 text-synergy-blue" /> 2. Payout Verification</h4>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                  Withdrawals are only enabled for KYC-verified members. The system automatically audits all sales before releasing funds to prevent fraudulent activity and protect the network integrity.
                              </p>
                          </div>
                          <div>
                              <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2 flex items-center"><User size={14} className="mr-2 text-purple-500" /> 3. Data Integrity</h4>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                  We never share your personal or banking data. All information is used strictly for payout processing and tax compliance.
                              </p>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-50 dark:border-gray-800">
                      <button 
                        onClick={acceptTerms}
                        className="w-full h-14 bg-synergy-blue text-white font-black rounded-2xl shadow-glow active:scale-[0.98] transition uppercase tracking-[0.2em] text-xs"
                      >
                          Accept & Continue
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
                <button onClick={() => setShowOtpModal(false)} className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition"><X size={20}/></button>
                <div className="text-center">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-synergy-blue rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone size={28} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Security Check</h3>
                    <p className="text-gray-400 text-[11px] mb-8 uppercase font-bold tracking-widest leading-relaxed">
                        {isResetFlow ? "Verify your identity to reset password." : "Verify your registration."}
                    </p>
                    <div className="mb-8">
                        <input 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="000000"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl py-6 text-center text-4xl font-black text-synergy-blue tracking-[0.3em] outline-none focus:ring-2 focus:ring-synergy-blue/20"
                            autoFocus
                            inputMode="numeric"
                        />
                    </div>
                    <button 
                        onClick={handleVerifyOtp}
                        disabled={otp.length < 6}
                        className="w-full bg-synergy-blue text-white font-black py-4 rounded-2xl shadow-glow text-xs uppercase tracking-[0.2em] disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                    >
                        {t('btn.confirm')}
                    </button>
                    <button className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-synergy-blue transition">Resend Code (59s)</button>
                </div>
            </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound size={28} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Reset Password</h3>
                    <p className="text-gray-400 text-[11px] mb-6 uppercase font-bold tracking-widest">Set a new strong password.</p>
                </div>
                
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-gray-300" size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-3.5 pl-12 pr-12 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-synergy-blue/20 transition text-sm font-medium"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-synergy-blue transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-[0.2em] active:scale-95 transition-all"
                    >
                        Save & Sign In
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Referral Modal (Final Step) */}
      {showReferralModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-2xl animate-in zoom-in-95 border border-white/10">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-synergy-blue rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce duration-1000">
                          <Gift size={32} />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Referral Code</h3>
                      <p className="text-gray-400 text-[11px] uppercase font-bold tracking-widest mb-6">Link with your team leader to activate bonuses.</p>
                  </div>
                  <input 
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="EX. BOSS001"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-5 text-center font-black text-2xl uppercase text-synergy-blue mb-8 focus:outline-none focus:ring-2 focus:ring-synergy-blue/20 tracking-[0.2em]"
                  />
                  <div className="space-y-3">
                      <button 
                        onClick={handleFinalizeSignUp}
                        className="w-full bg-synergy-blue text-white font-black py-4 rounded-2xl shadow-glow text-xs uppercase tracking-[0.2em] active:scale-95 transition"
                      >
                          Activate Account
                      </button>
                      <button 
                        onClick={handleFinalizeSignUp}
                        className="w-full py-2 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 transition"
                      >
                          Skip for now
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
