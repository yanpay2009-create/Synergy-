
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Users, 
  Wallet, 
  X, 
  Target,
  ShoppingBag,
  TrendingUp,
  ChevronRight,
  Calendar,
  Hash,
  Zap,
  Clock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CommissionTransaction, UserTier } from '../types';
import html2canvas from 'html2canvas';

export const CommissionHistory: React.FC = () => {
  const { commissions, user, t, allOrders, systemSettings, allTeamMembers, kycStatus } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const slipRef = useRef<HTMLDivElement>(null);
  
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedMonth, setAnimatedMonth] = useState(0);
  const [animatedDaily, setAnimatedDaily] = useState(0);
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [animatedTotalSales, setAnimatedTotalSales] = useState(0);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Direct' | 'Team' | 'Withdrawal'>('All');
  
  // Modal States
  const [selectedDetail, setSelectedDetail] = useState<CommissionTransaction | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<CommissionTransaction | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const userCommissions = commissions;

  // Calculate stats
  const actualTotalEarned = useMemo(() => userCommissions
    .filter(c => c.status === 'Paid' || c.status === 'Completed')
    .reduce((acc, curr) => acc + curr.amount, 0), [userCommissions]);

  const todayString = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const actualDailyEarned = useMemo(() => userCommissions
    .filter(c => c.date.includes(todayString) && (c.type === 'Direct' || c.type === 'Team'))
    .reduce((acc, curr) => acc + curr.amount, 0), [userCommissions, todayString]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const actualMonthlyEarned = useMemo(() => userCommissions
    .filter(c => {
        const d = new Date(c.date);
        return (c.status === 'Paid' || c.status === 'Completed') && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + curr.amount, 0), [userCommissions, currentMonth, currentYear]);

  const actualBalance = user?.walletBalance || 0;
  const actualTotalSales = user?.accumulatedSales || 0;

  // Animation effect
  useEffect(() => {
    const duration = 1200;
    const frameRate = 60;
    const totalFrames = Math.round(duration / (1000 / frameRate));
    
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      setAnimatedTotal(actualTotalEarned * easeOut);
      setAnimatedMonth(actualMonthlyEarned * easeOut);
      setAnimatedDaily(actualDailyEarned * easeOut);
      setAnimatedBalance(actualBalance * easeOut);
      setAnimatedTotalSales(actualTotalSales * easeOut);
      
      if (frame === totalFrames) clearInterval(timer);
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [actualTotalEarned, actualMonthlyEarned, actualDailyEarned, actualBalance, actualTotalSales]);

  useEffect(() => {
      if (location.state && (location.state as any).autoOpenId) {
          const targetId = (location.state as any).autoOpenId;
          const targetTx = userCommissions.find(c => c.id === targetId);
          if (targetTx) {
              if (targetTx.type === 'Withdrawal') setSelectedWithdrawal(targetTx);
              else setSelectedDetail(targetTx);
          }
          window.history.replaceState({}, document.title);
      }
  }, [location.state, userCommissions]);

  const filteredCommissions = activeFilter === 'All' 
    ? userCommissions 
    : userCommissions.filter(c => c.type === activeFilter);

  const handleTxClick = (tx: CommissionTransaction) => {
      if (tx.type === 'Withdrawal') setSelectedWithdrawal(tx);
      else setSelectedDetail(tx);
  };

  const linkedOrder = selectedDetail?.orderId ? allOrders.find(o => o.id === selectedDetail.orderId) : null;

  const getTierTheme = (tier: UserTier | undefined) => {
    switch (tier) {
      case UserTier.EXECUTIVE:
        return { text: 'text-amber-500', bg: 'bg-amber-50', darkBg: 'bg-amber-900/20', border: 'border-amber-200', gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/40' };
      case UserTier.BUILDER:
        return { text: 'text-purple-600', bg: 'bg-purple-50', darkBg: 'bg-purple-900/20', border: 'border-purple-200', gradient: 'from-purple-600 to-indigo-600', shadow: 'shadow-purple-500/40' };
      case UserTier.MARKETER: 
        return { text: 'text-pink-500', bg: 'bg-pink-50', darkBg: 'bg-pink-900/20', border: 'border-pink-200', gradient: 'from-pink-500 to-red-500', shadow: 'shadow-pink-500/40' };
      default:
        return { text: 'text-synergy-blue', bg: 'bg-blue-50', darkBg: 'bg-blue-900/20', border: 'border-blue-200', gradient: 'from-synergy-blue to-blue-600', shadow: 'shadow-synergy-blue/40' };
    }
  };

  const theme = getTierTheme(user?.tier);

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-black ml-1 text-gray-900 dark:text-white tracking-tight">Commission</h1>
        </div>
        <button 
          onClick={() => navigate('/account')}
          className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md overflow-hidden bg-gray-200 active:scale-90 transition-transform shrink-0"
        >
            <img src={user?.avatar} alt="User" className="w-full h-full object-cover" />
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden shadow-soft dark:shadow-none border border-white dark:border-gray-700 mb-6">
        <div className={`p-6 bg-gradient-to-br ${theme.gradient} text-white relative`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <div className="flex items-center space-x-1.5 opacity-80 mb-1"><Target size={12} /><span className="text-[10px] font-black uppercase tracking-widest">Available Wallet</span></div>
                  <h2 className="text-3xl font-black tracking-tight">฿{Math.floor(animatedBalance).toLocaleString()}</h2>
                </div>
                {/* Status background and border removed as requested */}
            </div>
            
            <div className="grid grid-cols-3 gap-x-2 mt-6 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-white/70 tracking-wider mb-0.5">Daily Earned</span>
                    <span className="text-sm font-bold text-white">฿{Math.floor(animatedDaily).toLocaleString()}</span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-3">
                    <span className="text-[8px] font-black uppercase text-white/70 tracking-wider mb-0.5">This Month</span>
                    <span className="text-sm font-bold text-white">฿{Math.floor(animatedMonth).toLocaleString()}</span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-3">
                    <span className="text-[8px] font-black uppercase text-white/70 tracking-wider mb-0.5">Direct Total</span>
                    <span className="text-sm font-bold text-white">฿{Math.floor(animatedTotal).toLocaleString()}</span>
                </div>
                
                <div className="col-span-3 pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <TrendingUp size={14} className="text-white/60" />
                        <span className="text-[9px] font-black uppercase text-white/70 tracking-wider">Total Accumulated Sales</span>
                    </div>
                    <span className="text-base font-black text-white">฿{Math.floor(animatedTotalSales).toLocaleString()}</span>
                </div>
            </div>
        </div>
        <div className="p-4 bg-gray-50/30 dark:bg-gray-900/10">
            <button 
                onClick={() => navigate('/withdraw')} 
                disabled={!user || user.walletBalance <= 0} 
                className={`group relative w-full h-14 rounded-[20px] font-black text-xs flex items-center justify-center transition-all duration-500 uppercase tracking-[0.2em] overflow-hidden ${(!user || user.walletBalance <= 0) ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50' : `bg-gradient-to-r ${theme.gradient} text-white ${theme.shadow} shadow-lg active:scale-95`}`}
            >
                <div className="relative flex items-center justify-center space-x-3">
                    <span className="italic">Withdraw</span>
                    <ArrowUpRight size={18} strokeWidth={3} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
            </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar mb-5 px-1 py-1">
          {['All', 'Direct', 'Team', 'Withdrawal'].map((type) => (
              <button 
                key={type} 
                onClick={() => setActiveFilter(type as any)} 
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all duration-300 ${activeFilter === type ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md scale-105' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700 hover:border-gray-200'}`}
              >
                  {type}
              </button>
          ))}
      </div>
      
      <div className="space-y-3">
        {filteredCommissions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-[24px] border border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-14 h-14 bg-gray-50 dark:bg-target rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300"><Wallet size={22} /></div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">No activity found</p>
            </div>
        ) : (
            filteredCommissions.map(tx => (
                <div 
                    key={tx.id} 
                    onClick={() => handleTxClick(tx)}
                    className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-transparent transition cursor-pointer active:bg-gray-50 dark:active:bg-gray-700 hover:border-gray-100 dark:hover:border-gray-700"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'Direct' ? 'bg-blue-50 text-synergy-blue' : tx.type === 'Withdrawal' ? 'bg-red-50 text-red-500' : 'bg-purple-50 text-purple-500'}`}>{tx.type === 'Direct' ? <ShoppingBag size={18} /> : tx.type === 'Withdrawal' ? <ArrowUpRight size={18} /> : <Users size={18} />}</div>
                            <div className="min-w-0">
                                <h4 className="text-[13px] font-bold text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                                    {tx.type === 'Withdrawal' 
                                        ? tx.source.split('|')[0].replace('Withdrawal:', '').trim() 
                                        : (tx.type === 'Direct' ? 'Commission from User' : 'Commission from Team')}
                                </h4>
                                {tx.type !== 'Withdrawal' && tx.orderId && (
                                    <p className="text-[10px] text-synergy-blue font-bold">
                                        Order #{tx.orderId.split('-')[1]}
                                    </p>
                                )}
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{tx.date}</p>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-1.5">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase inline-block ${tx.status === 'Paid' || tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : tx.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>
                                {tx.status}
                            </span>
                            <div className="flex items-center space-x-1">
                                <p className={`text-sm font-black ${tx.amount > 0 ? (tx.status === 'Pending' ? 'text-gray-400' : 'text-emerald-500') : 'text-red-500'}`}>
                                    {tx.amount > 0 ? '+' : ''}฿{Math.abs(tx.amount).toLocaleString()}
                                </p>
                                <ChevronRight size={14} className="text-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {selectedDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedDetail(null)}>
              <div className="bg-white dark:bg-gray-900 w-full max-w-[310px] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 relative border border-white/20 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
                  <div className={`p-5 bg-gradient-to-r ${theme.gradient} flex justify-between items-center relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
                      <div className="flex items-center space-x-3 relative z-10">
                          <div className="w-14 h-14 rounded-full border-2 border-white/60 overflow-hidden shadow-md bg-white/20">
                              <img src={user?.avatar} className="w-full h-full object-cover" alt="User" />
                          </div>
                          <div className="min-w-0">
                              <h3 className="font-black text-white text-[13px] tracking-wide leading-tight">
                                  {user?.tier} Affiliate
                              </h3>
                          </div>
                      </div>
                      <div className="relative z-10">
                          <button onClick={() => setSelectedDetail(null)} className="p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition">
                              <X size={16} />
                          </button>
                      </div>
                  </div>
                  <div className="p-5 space-y-5">
                      <div className="text-center py-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                              {selectedDetail.type === 'Team' ? 'Team Commission' : 'Direct Commission'}
                          </p>
                          <h2 className={`text-3xl font-black ${selectedDetail.status === 'Paid' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                              ฿{selectedDetail.amount.toLocaleString()}
                          </h2>
                          <div className={`mt-2 inline-flex px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${selectedDetail.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                              {selectedDetail.status}
                          </div>
                      </div>
                      <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-2 text-gray-400"><Calendar size={12} /><span>Date</span></div>
                              <span className="font-bold text-gray-900 dark:text-white">{selectedDetail.date}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-2 text-gray-400"><Hash size={12} /><span>Order</span></div>
                              <span className="font-bold text-gray-900 dark:text-white">#{selectedDetail.orderId?.split('-')[1] || 'N/A'}</span>
                          </div>
                      </div>
                      {linkedOrder && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2.5 flex items-center"><ShoppingBag size={10} className="mr-1" /> Items</p>
                              <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                                  {linkedOrder.items.map((item, idx) => (
                                      <div key={idx} className="relative w-10 h-10 shrink-0">
                                          <img src={item.image} className="w-full h-full object-cover rounded-md border border-white dark:border-gray-700 shadow-sm" alt="p" />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
