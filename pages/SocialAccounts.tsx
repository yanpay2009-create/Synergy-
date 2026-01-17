import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Facebook, Mail, MessageCircle, ChevronRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SocialAccounts: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserSocials, t } = useApp();

  // Default structure if undefined
  const connections = user?.socials || {
    facebook: { connected: false, name: '' },
    line: { connected: false, name: '' },
    google: { connected: false, name: '' }
  };

  const handleToggleConnection = (platform: 'facebook' | 'line' | 'google') => {
    const isConnected = connections[platform].connected;
    if (isConnected) {
      if (window.confirm(`Do you want to disconnect your ${platform.charAt(0).toUpperCase() + platform.slice(1)} account?`)) {
        updateUserSocials(platform, false, '');
      }
    } else {
      // Simulate OAuth connection
      const mockName = platform === 'line' ? 'User.Line' : user?.name || 'Verified User';
      updateUserSocials(platform, true, mockName);
    }
  };

  const SocialMenuRow = ({ platform, icon: Icon, label, colorClass }: any) => {
    const data = connections[platform as keyof typeof connections];
    
    return (
      <button 
        onClick={() => handleToggleConnection(platform)}
        className="w-full flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[24px] shadow-sm mb-3 active:scale-[0.99] transition border border-white/60 dark:border-gray-700 group"
      >
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} shadow-sm group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">{label}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {data.connected ? (
            <div className="flex items-center space-x-1.5 text-emerald-500">
               <span className="text-[10px] font-black uppercase tracking-tight">{data.name || 'Connected'}</span>
               <CheckCircle2 size={14} />
            </div>
          ) : (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Not Linked</span>
          )}
          <ChevronRight size={16} className="text-gray-300 dark:text-gray-500" />
        </div>
      </button>
    );
  };

  return (
    <div className="pb-24 pt-8 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-full transition shadow-sm">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black ml-2 text-gray-900 dark:text-white tracking-tight">Social Connections</h1>
      </div>

      <div className="animate-in slide-in-from-bottom-4 duration-500">
        <SocialMenuRow 
          platform="facebook" 
          icon={Facebook} 
          label="Facebook" 
          colorClass="bg-blue-50 dark:bg-blue-900/30 text-[#1877F2]" 
        />
        <SocialMenuRow 
          platform="line" 
          icon={MessageCircle} 
          label="Line Messenger" 
          colorClass="bg-green-50 dark:bg-green-900/30 text-[#06C755]" 
        />
        <SocialMenuRow 
          platform="google" 
          icon={Mail} 
          label="Google Account" 
          colorClass="bg-red-50 dark:bg-red-900/30 text-[#DB4437]" 
        />
      </div>

      {/* Recommended Info Box moved to the bottom */}
      <div className="mt-8 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-[28px] border border-blue-100 dark:border-blue-800/50 flex items-start space-x-3 backdrop-blur-sm animate-in fade-in duration-700">
          <ShieldCheck size={20} className="text-synergy-blue mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
            Connecting your social accounts allows for seamless product sharing and increases your trust score within the Synergy network.
          </p>
      </div>

      <div className="mt-12 text-center px-8 opacity-40">
          {/* Security Disclaimer text removed as requested */}
      </div>
    </div>
  );
};