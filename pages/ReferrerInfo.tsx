
import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, MessageCircle, Phone, Copy, Check, UserCheck, UserPlus, Search, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UserTier } from '../types';

export const ReferrerInfo: React.FC = () => {
  const { referrer, addReferrer } = useApp();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmitCode = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputCode) return;
      
      const success = addReferrer(inputCode);
      if (success) {
          alert("Referrer added successfully!");
      } else {
          setError("Referrer code not found. Try 'BOSS001'");
      }
  };

  // Tier Color Helper (Same logic as Account page)
  const getTierColors = (tier: UserTier) => {
    switch (tier) {
      case UserTier.EXECUTIVE:
        return { 
          gradient: 'from-amber-400 via-orange-50 to-white dark:via-orange-900/20 dark:to-gray-800', 
          border: 'border-amber-200 dark:border-amber-500/30', 
          text: 'text-amber-600 dark:text-amber-400', 
          badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800' 
        };
      case UserTier.BUILDER:
        return { 
          gradient: 'from-purple-700 via-indigo-50 to-white dark:via-indigo-900/20 dark:to-gray-800', 
          border: 'border-purple-200 dark:border-purple-500/30', 
          text: 'text-purple-700 dark:text-purple-400', 
          badge: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800' 
        };
      case UserTier.MARKETER: 
        return { 
          gradient: 'from-pink-500 via-pink-50 to-white dark:via-pink-900/20 dark:to-gray-800', 
          border: 'border-pink-200 dark:border-pink-500/30', 
          text: 'text-pink-600 dark:text-pink-400', 
          badge: 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-800' 
        };
      default:
        return { 
          gradient: 'from-synergy-blue via-blue-50 to-white dark:via-blue-900/20 dark:to-gray-800', 
          border: 'border-blue-200 dark:border-blue-500/30', 
          text: 'text-synergy-blue dark:text-blue-400', 
          badge: 'bg-blue-50 dark:bg-blue-900/30 text-synergy-blue dark:text-blue-400 border-blue-100 dark:border-blue-800' 
        };
    }
  };

  if (!referrer) {
      return (
          <div className="pb-24 pt-8 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
               <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                    <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">My Referrer</h1>
               </div>

               <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-soft dark:shadow-none border border-transparent dark:border-gray-700 text-center flex flex-col items-center justify-center min-h-[400px]">
                   <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-synergy-blue rounded-full flex items-center justify-center mb-4 shadow-sm">
                       <UserPlus size={40} />
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Who Invited You?</h2>
                   <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed max-w-xs">
                       Link your account to your referrer to unlock team support and bonuses.
                   </p>

                   <form onSubmit={handleSubmitCode} className="w-full">
                       <div className="relative mb-4">
                           <input 
                                value={inputCode}
                                onChange={(e) => {
                                    setInputCode(e.target.value.toUpperCase());
                                    setError('');
                                }}
                                placeholder="Enter Referral Code"
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 px-4 text-center text-lg font-bold text-synergy-blue placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-synergy-blue/20 transition uppercase tracking-widest dark:text-white"
                           />
                       </div>
                       
                       {error && (
                           <p className="text-red-500 text-xs font-medium mb-4 animate-bounce">
                               {error}
                           </p>
                       )}

                       <button 
                            type="submit"
                            disabled={!inputCode}
                            className="w-full bg-synergy-blue text-white font-bold py-4 rounded-2xl shadow-glow flex items-center justify-center space-x-2 active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none"
                       >
                            <Search size={20} />
                            <span>Find Referrer</span>
                       </button>
                   </form>
                   
                   <p className="text-[10px] text-gray-400 mt-6">
                       Try codes: BOSS001, LISA2024, JOHNDOE
                   </p>
               </div>
          </div>
      );
  }

  const colors = getTierColors(referrer.tier);

  return (
    <div className="pb-24 pt-8 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">My Referrer</h1>
        </div>
        <button 
          onClick={() => navigate('/executive-info')}
          className="p-2.5 bg-white dark:bg-gray-800 text-synergy-blue rounded-full shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition border border-blue-100 dark:border-gray-700 active:scale-95"
          title="Executive Data"
        >
          <Crown size={20} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-soft dark:shadow-none text-center relative overflow-hidden mb-6 animate-in zoom-in-95 duration-300 border border-white/50 dark:border-gray-700">
         {/* Background Decoration Layer (Same as Account page) */}
         <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b ${colors.gradient} z-0 opacity-80 dark:opacity-40 pointer-events-none`}></div>
         
         <div className="relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 group block">
                <div className={`w-24 h-24 rounded-full border-2 border-white dark:border-gray-700 shadow-lg overflow-hidden bg-white dark:bg-gray-700 transition-all`}>
                    <img src={referrer.avatar} alt={referrer.name} className="w-full h-full rounded-full object-cover" />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{referrer.name}</h2>
            
            <div className="flex items-center justify-center space-x-2 mb-6">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm shadow-sm ${colors.badge}`}>
                    {referrer.tier} Leader
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => window.open(`tel:${referrer.phone}`)}
                    className="flex flex-col items-center justify-center p-4 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl hover:bg-green-50 dark:hover:bg-emerald-900/20 hover:text-green-600 transition group border border-white/50 dark:border-gray-700 shadow-sm"
                >
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm text-gray-600 dark:text-gray-400 group-hover:text-green-600 mb-2 transition-colors">
                        <Phone size={20} />
                    </div>
                    <span className="text-xs font-bold dark:text-gray-300">Call Now</span>
                </button>

                <button 
                    className="flex flex-col items-center justify-center p-4 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm rounded-2xl hover:bg-green-50 dark:hover:bg-emerald-900/20 hover:text-green-600 transition group border border-white/50 dark:border-gray-700 shadow-sm"
                >
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm text-gray-600 dark:text-gray-400 group-hover:text-green-600 mb-2 transition-colors">
                        <MessageCircle size={20} />
                    </div>
                    <span className="text-xs font-bold dark:text-gray-300">Line Chat</span>
                </button>
            </div>
         </div>
      </div>

      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase ml-2 mb-3 tracking-wide">Contact Details</h3>
      
      <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm dark:shadow-none border border-transparent dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-synergy-blue rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold">ID</span>
                  </div>
                  <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Referral Code</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{referrer.code}</p>
                  </div>
              </div>
              <button onClick={() => handleCopy(referrer.code, 'code')} className="p-2 text-gray-400 hover:text-synergy-blue transition-colors">
                 {copied === 'code' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm dark:shadow-none border border-transparent dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 bg-green-50 dark:bg-emerald-900/20 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                      <MessageCircle size={20} />
                  </div>
                  <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Line ID</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{referrer.lineId}</p>
                  </div>
              </div>
              <button onClick={() => handleCopy(referrer.lineId, 'line')} className="p-2 text-gray-400 hover:text-synergy-blue transition-colors">
                 {copied === 'line' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm dark:shadow-none border border-transparent dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl flex items-center justify-center shrink-0">
                      <Phone size={20} />
                  </div>
                  <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Phone Number</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{referrer.phone}</p>
                  </div>
              </div>
              <button onClick={() => handleCopy(referrer.phone, 'phone')} className="p-2 text-gray-400 hover:text-synergy-blue transition-colors">
                 {copied === 'phone' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
          </div>
      </div>
    </div>
  );
};
