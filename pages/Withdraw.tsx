import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Wallet, ArrowUpRight, AlertCircle, Plus, Shield, ChevronRight, FileText, CheckCircle, Share2, Receipt, ShieldCheck, Lock, Activity, X, CheckCircle2, Sparkles, RefreshCw, Smartphone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { CommissionTransaction } from '../types';

export const Withdraw: React.FC = () => {
  const { user, bankAccounts, withdrawFunds, kycStatus, systemSettings, isSecurityUnlocked, setIsSecurityUnlocked, updateUserSecurity, logout } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  
  // PIN Gate States
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pinFlow, setPinFlow] = useState<'verify' | 'setup' | 'confirm' | 'recovery'>('verify');
  const [tempPin, setTempPin] = useState('');
  const [showPinSuccess, setShowPinSuccess] = useState(false);
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Slip Modal Logic
  const [successTx, setSuccessTx] = useState<CommissionTransaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  const WITHDRAWAL_FEE = 25;
  const TAX_RATE = 0.03; // WHT 3%

  if (!user) return null;

  const handleKycClick = () => {
    if (isSecurityUnlocked) {
        navigate('/kyc');
        return;
    }

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
          setShowPinSuccess(true);
          setTimeout(() => {
            setShowPinSuccess(false);
            setIsVerifyingPin(false);
            navigate('/kyc');
          }, 1000);
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
          setShowPinSuccess(true);
          setTimeout(() => {
            setShowPinSuccess(false);
            setIsVerifyingPin(false);
            navigate('/kyc');
          }, 1200);
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
    if (showPinSuccess) return "Success!";
    switch (pinFlow) {
      case 'verify': return 'Enter Security PIN';
      case 'setup': return 'Set New PIN';
      case 'confirm': return 'Confirm New PIN';
      case 'recovery': return 'PIN Recovery';
    }
  };

  const getReceiverDetails = (source: string) => {
      if (source && source.includes('Withdrawal:')) {
          const parts = source.replace('Withdrawal:', '').split('|');
          const name = parts[0]?.trim() || 'Receiver';
          const bank = parts[1]?.trim().split('(')[0]?.trim() || 'Bank';
          const account = parts[1]?.match(/\(([^)]+)\)/)?.[1] || 'xxx-xxxx-xxx';
          return { name, bank, account };
      }
      return { name: user?.name || 'Receiver', bank: 'Bank Account', account: 'xxx-xxxx-xxx' };
  };

  const setPercent = (percent: number) => {
    setAmount((user.walletBalance * percent).toFixed(0));
  };

  const grossAmount = parseFloat(amount) || 0;
  const taxAmount = grossAmount * TAX_RATE;
  const netAmount = grossAmount - WITHDRAWAL_FEE - taxAmount;
  const isValidAmount = grossAmount >= 100 && grossAmount <= user.walletBalance && netAmount > 0;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();

    // Security Gate: Ensure KYC is Verified
    if (kycStatus !== 'Verified') {
        handleKycClick();
        return;
    }

    if (!selectedBank) {
      alert("Please select a bank account.");
      return;
    }
    
    if (!isValidAmount) {
        alert("Min withdrawal is ฿100 and must not exceed balance.");
        return;
    }
    
    const transaction = withdrawFunds(grossAmount, selectedBank);
    if (transaction) {
        setSuccessTx(transaction);
    } else {
        alert("Withdrawal Failed. Please check your details and try again.");
    }
  };
  
  const handleSaveSlip = async () => {
      if (!slipRef.current) return;
      try {
          setIsSaving(true);
          await new Promise(resolve => setTimeout(resolve, 300));
          const canvas = await html2canvas(slipRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
          const image = canvas.toDataURL("image/png");
          const link = document.createElement('a');
          link.href = image;
          link.download = `Synergy_Slip_${successTx?.id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setIsSaving(false);
      } catch (error) {
          console.error("Save slip failed", error);
          alert("Image save failed.");
          setIsSaving(false);
      }
  };
  
  const handleCloseSuccess = () => {
      setSuccessTx(null);
      navigate(-1);
  };

  const receiver = successTx ? getReceiverDetails(successTx.source) : null;
  const qrCodeUrl = successTx ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`SYN-VERIFY-${successTx.id}`)}` : '';

  return (
    <div className="pb-24 pt-8 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* PIN Security Gate Overlay */}
      {isVerifyingPin && (
          <div className="fixed inset-0 z-[110] bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-6 transition-all duration-300 animate-in fade-in">
              <button 
                onClick={() => setIsVerifyingPin(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400"
              >
                  <X size={20} />
              </button>

              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-8 transition-all duration-500 ${showPinSuccess ? 'bg-emerald-500 text-white scale-110' : 'bg-gray-50 dark:bg-gray-800 text-synergy-blue border border-gray-100 dark:border-gray-700'}`}>
                {showPinSuccess ? <CheckCircle2 size={40} className="animate-in zoom-in" /> : (pinFlow === 'recovery' ? <Smartphone size={32} className="text-amber-500" /> : (pinFlow === 'verify' ? <Lock size={32} /> : <Sparkles size={32} className="animate-pulse" />))}
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 text-center">{getPinTitle()}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 text-center max-w-[260px] leading-relaxed font-medium">
                  {showPinSuccess ? "Verification confirmed. Accessing portal..." : (pinFlow === 'recovery' ? "Enter the verification code sent to your device." : (pinFlow === 'setup' ? "Create a new 6-digit PIN for security." : "Enter your security PIN to continue."))}
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

      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black ml-2 text-gray-900 dark:text-white tracking-tight">Withdraw Funds</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-soft dark:shadow-none border border-transparent dark:border-gray-700 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 bg-synergy-blue/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2 text-gray-400 dark:text-gray-500">
                <Wallet size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Withdrawal Wallet</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-1">฿{user.walletBalance.toLocaleString()}</h2>
            <div className="mt-4 inline-flex items-center space-x-2 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
                <Lock size={12} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400">Encrypted Transaction Engine Active</span>
            </div>
        </div>
      </div>

      {kycStatus !== 'Verified' && (
        <div onClick={handleKycClick} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 mb-6 flex items-start space-x-3 cursor-pointer active:scale-[0.98] transition group animate-in slide-in-from-top-2">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full text-red-500 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                <Shield size={20} />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-tight">ID Verification Required</h3>
                <p className="text-[11px] text-red-500 mt-1 leading-relaxed font-medium">To maintain network security and enable real bank transfers, please complete your identity verification (KYC) process.</p>
            </div>
            <ChevronRight size={18} className="text-red-300 self-center" />
        </div>
      )}

      <form onSubmit={handleWithdraw} className={kycStatus !== 'Verified' ? 'opacity-40 grayscale pointer-events-none' : ''}>
        <div className="mb-6 px-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 ml-1">Payout Destination</label>
            <div className="space-y-3">
                {bankAccounts.length === 0 ? (
                     <button type="button" onClick={() => navigate('/bank-accounts')} className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 rounded-3xl flex flex-col items-center justify-center space-y-2 hover:bg-white dark:hover:bg-gray-800/50 transition">
                        <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center"><Plus size={20} /></div>
                        <span className="text-xs font-black uppercase tracking-widest">Link New Bank Account</span>
                     </button>
                ) : (
                    bankAccounts.map(bank => (
                        <div 
                            key={bank.id} 
                            onClick={() => setSelectedBank(bank.id)} 
                            className={`p-5 rounded-[24px] border transition-all cursor-pointer flex justify-between items-center group ${selectedBank === bank.id ? 'bg-blue-50 dark:bg-blue-900/20 border-synergy-blue shadow-sm' : 'bg-white dark:bg-gray-800 border-transparent dark:border-gray-700 shadow-soft'}`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedBank === bank.id ? 'bg-synergy-blue text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}>
                                    <Receipt size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-800 dark:text-white tracking-tight">{bank.bankName}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{bank.accountNumber.replace(/.(?=.{4})/g, '*')}</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedBank === bank.id ? 'border-synergy-blue bg-synergy-blue shadow-[0_0_8px_rgba(0,181,255,0.4)]' : 'border-gray-200 dark:border-gray-700'}`}>
                                {selectedBank === bank.id && <CheckCircle size={12} className="text-white" strokeWidth={3} />}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="mb-8">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 ml-2">Withdrawal Amount</label>
             <div className="bg-white dark:bg-gray-800 rounded-[28px] p-6 border border-transparent dark:border-gray-700 shadow-soft mb-4 flex items-center focus-within:ring-2 focus-within:ring-synergy-blue/30 transition-all">
                 <span className="text-3xl font-black text-gray-300 dark:text-gray-600 mr-3">฿</span>
                 <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="w-full bg-transparent text-3xl font-black text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-100 dark:placeholder:text-gray-800" 
                    placeholder="0.00" 
                 />
             </div>
             <div className="flex space-x-2 px-1">
                 {[500, 1000, 5000].map(val => (
                     <button key={val} type="button" onClick={() => setAmount(val.toString())} className="flex-1 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition">฿{val}</button>
                 ))}
                 <button type="button" onClick={() => setPercent(1)} className="flex-1 py-2.5 bg-synergy-blue/10 text-synergy-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-synergy-blue/20 transition">Max</button>
             </div>
        </div>

        {grossAmount > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 mb-8 border border-transparent dark:border-gray-700 shadow-soft animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-gray-400">
                        <Activity size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Audit</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">Accuracy Verified</span>
                </div>
                <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-gray-500">
                        <span className="font-bold">Gross Amount</span>
                        <span className="font-black text-gray-900 dark:text-white">฿{grossAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span className="font-bold">Network Handling Fee</span>
                        <span className="font-bold">-฿{WITHDRAWAL_FEE.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                        <span className="font-bold">Withholding Tax (3%)</span>
                        <span className="font-bold">-฿{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="pt-4 mt-2 border-t border-dashed border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-synergy-blue">Estimated Net Received</span>
                            <span className="text-2xl font-black text-synergy-blue">
                                ฿{netAmount > 0 ? netAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <button 
            type="submit" 
            disabled={!selectedBank || !isValidAmount || kycStatus !== 'Verified'} 
            className={`w-full h-16 rounded-[24px] font-black text-xs text-white shadow-lg flex items-center justify-center space-x-3 transition uppercase tracking-[0.2em] ${(!selectedBank || !isValidAmount || kycStatus !== 'Verified') ? 'bg-gray-200 dark:bg-gray-800 shadow-none cursor-not-allowed text-gray-400' : 'bg-gray-900 dark:bg-white dark:text-gray-900 hover:scale-[1.02] active:scale-[0.98]'}`}
        >
            <ShieldCheck size={20} />
            <span>Secure Payout</span>
        </button>
      </form>
      
      <div className="mt-8 flex items-start space-x-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
              <p className="text-[10px] leading-relaxed font-black uppercase tracking-widest mb-1.5 border-b border-amber-200/30 pb-1">TRANSFER POLICY ADVISORY</p>
              <p className="text-[9px] font-medium leading-relaxed opacity-90 text-justify">
                  Funds are dispatched via the National ITMX Bank Gateway. Settlement typically occurs within 1-2 business days. Real-time verification logs are available in your history.
              </p>
          </div>
      </div>

      {successTx && receiver && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
               <div className="w-full max-w-sm flex flex-col items-center">
                  <div ref={slipRef} className="bg-white w-full rounded-[32px] overflow-hidden shadow-2xl relative">
                        <div className="bg-gray-900 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-synergy-blue/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            <div className="flex justify-between items-start relative z-10 text-white">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center text-white font-black text-2xl overflow-hidden border border-white/10">
                                        {systemSettings.logo ? <img src={systemSettings.logo} className="w-full h-full object-contain" alt="Logo" /> : <span className="italic">S</span>}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg leading-none tracking-tight">Synergy Flow</p>
                                        <p className="text-[8px] opacity-60 font-black uppercase tracking-[0.2em] mt-1.5">Network Security E-Slip</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end text-[10px] font-black uppercase mb-1 text-emerald-400"><CheckCircle size={10} className="mr-1" /><span>Processed</span></div>
                                    <p className="text-[8px] opacity-60 font-bold uppercase">{successTx.date}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-7">
                             <div className="flex flex-col space-y-0 relative">
                                 <div className="absolute left-[19px] top-8 bottom-8 w-[1px] border-l border-dashed border-gray-200 z-0"></div>
                                 <div className="flex items-start space-x-4 relative z-10">
                                     <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm"><div className="w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center text-gray-400"><Wallet size={14} /></div></div>
                                     <div className="pt-0.5"><p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Debit Source</p><p className="text-sm font-black text-gray-900 uppercase">Synergy Rewards</p></div>
                                 </div>
                                 <div className="h-6"></div>
                                 <div className="flex items-start space-x-4 relative z-10">
                                     <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm"><div className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500"><ArrowUpRight size={14} /></div></div>
                                     <div className="pt-0.5"><p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Credit Destination</p><p className="text-sm font-black text-gray-900 uppercase">{receiver.name}</p><p className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">{receiver.bank} • {receiver.account.replace(/.(?=.{4})/g, '*')}</p></div>
                                 </div>
                             </div>

                             <div className="w-full border-t border-gray-50 my-6"></div>

                             <div className="space-y-2 mb-4">
                                 <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest"><span>Gross Payout</span><span className="text-gray-600">฿{grossAmount.toLocaleString()}</span></div>
                                 <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase tracking-widest"><span>Fees & Compliance</span><span>-฿{(WITHDRAWAL_FEE + taxAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                             </div>

                             <div className="flex justify-between items-center py-3 bg-blue-50/50 rounded-[20px] px-4 -mx-1">
                                 <div><p className="text-[9px] text-synergy-dark font-black uppercase tracking-[0.2em]">Net Disbursed</p></div>
                                 <div className="text-right"><p className="text-2xl font-black text-synergy-blue">฿{netAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p></div>
                             </div>
                             
                             <div className="w-full border-t border-gray-50 my-6"></div>

                             <div className="flex justify-between items-end">
                                 <div><p className="text-[8px] text-gray-300 uppercase tracking-[0.2em] font-black mb-1.5">Security Auth ID</p><p className="text-[9px] font-mono text-gray-700 font-bold bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 tracking-tighter">#SYN-TRANS-{successTx.id}</p></div>
                                 <div className="text-right flex flex-col items-center">
                                     <div className="bg-white p-1 rounded-lg shadow-sm mb-1 border border-gray-100">
                                         <img src={qrCodeUrl} alt="Verify" className="w-10 h-10 grayscale opacity-80" />
                                     </div>
                                     <p className="text-[6px] text-gray-400 uppercase font-black tracking-tighter">Scan to Audit</p>
                                 </div>
                             </div>
                        </div>
                  </div>

                  <div className="mt-8 flex space-x-3 w-full px-2">
                      <button onClick={handleCloseSuccess} className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black backdrop-blur-md border border-white/20 hover:bg-white/20 transition active:scale-95 text-xs uppercase tracking-widest">Done</button>
                      <button onClick={handleSaveSlip} disabled={isSaving} className="flex-[2] py-4 bg-synergy-blue text-white rounded-2xl font-black shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition hover:bg-synergy-dark text-xs uppercase tracking-[0.15em]">{isSaving ? <span className="animate-pulse italic">Saving Security E-Slip...</span> : <><Share2 size={16} /><span>Export Slip</span></>}</button>
                  </div>
               </div>
          </div>
      )}
    </div>
  );
};
