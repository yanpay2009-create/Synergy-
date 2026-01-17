
import React, { useState } from 'react';
import { ArrowLeft, Crown, TrendingUp, Users, ShieldCheck, Star, ChevronRight, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserTier } from '../types';

export const ExecutiveInfo: React.FC = () => {
  const navigate = useNavigate();
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allExecutives = [
    { name: "Michael Scott", sales: "฿1.2M", team: 450, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
    { name: "Lisa Manobal", sales: "฿890K", team: 320, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa" },
    { name: "Tony Stark", sales: "฿750K", team: 210, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tony" },
    { name: "Sarah Connor", sales: "฿620K", team: 185, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { name: "John Wick", sales: "฿580K", team: 150, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
    { name: "Bruce Wayne", sales: "฿540K", team: 120, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bruce" },
    { name: "Diana Prince", sales: "฿490K", team: 110, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diana" },
    { name: "Peter Parker", sales: "฿450K", team: 95, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Peter" },
    { name: "Wanda Maximoff", sales: "฿410K", team: 88, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wanda" },
    { name: "Steve Rogers", sales: "฿380K", team: 75, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Steve" },
  ];

  const displayedExecutives = isShowingAll 
    ? allExecutives.filter(exec => exec.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allExecutives.slice(0, 3);

  // Added React.FC to fix type error for 'key' prop at the usage site and removed redundant key from inner div
  const ExecutiveCard: React.FC<{ exec: any, idx: number }> = ({ exec, idx }) => (
    <div 
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex items-center justify-between border border-transparent hover:border-amber-200 dark:hover:border-amber-900/50 transition animate-in fade-in slide-in-from-bottom-2"
        style={{ animationDelay: `${idx * 50}ms` }}
    >
        <div className="flex items-center space-x-4">
            <div className="relative">
                <img src={exec.avatar} alt={exec.name} className="w-14 h-14 rounded-full object-cover border-2 border-amber-50 dark:border-gray-700 shadow-sm bg-gray-100" />
                <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1 border-2 border-white dark:border-gray-800">
                    <Star size={8} fill="white" className="text-white" />
                </div>
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{exec.name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full font-bold border border-amber-100 dark:border-amber-800">Executive</span>
                    <span className="flex items-center text-[10px] text-gray-400">
                        <Users size={10} className="mr-1" />
                        {exec.team} Team
                    </span>
                </div>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm font-black text-amber-600 dark:text-amber-400">{exec.sales}</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Volume</p>
        </div>
    </div>
  );

  return (
    <div className="pb-24 pt-8 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex items-center mb-6">
        <button 
            onClick={() => isShowingAll ? setIsShowingAll(false) : navigate(-1)} 
            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">
            {isShowingAll ? 'Top Executives' : 'Executive Data'}
        </h1>
      </div>

      {!isShowingAll ? (
        <>
          {/* Global Board Header */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[32px] p-6 mb-8 text-white relative overflow-hidden shadow-lg animate-in zoom-in-95 duration-500">
              <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                          <Crown size={24} className="text-white" />
                      </div>
                      <div>
                          <h2 className="text-lg font-bold">Executive Board</h2>
                          <p className="text-xs opacity-80 font-medium">Platform Top Leaders</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                          <p className="text-[10px] text-white/80 uppercase font-bold mb-1">Active Leaders</p>
                          <p className="text-xl font-black">1,248</p>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
                          <p className="text-[10px] text-white/80 uppercase font-bold mb-1">Total Rewards</p>
                          <p className="text-xl font-black">฿4.5M</p>
                      </div>
                  </div>
              </div>
              <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Top Executives</h3>
            <button 
                onClick={() => setIsShowingAll(true)}
                className="text-xs font-bold text-synergy-blue hover:underline flex items-center"
            >
                See all
                <ChevronRight size={14} className="ml-0.5" />
            </button>
          </div>

          <div className="space-y-4">
              {displayedExecutives.map((exec, idx) => (
                  <ExecutiveCard key={idx} exec={exec} idx={idx} />
              ))}
          </div>

          {/* Rewards Info */}
          <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 rounded-3xl p-6 border border-amber-100 dark:border-amber-800 animate-in fade-in slide-in-from-bottom-4">
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center">
                  <ShieldCheck size={18} className="mr-2" />
                  Executive Privileges
              </h4>
              <ul className="space-y-3">
                  {[
                      "30% Lifetime Direct Commission",
                      "Exclusive VIP Support Line",
                      "Access to Premium Content Tools",
                      "Quarterly Profit Sharing Pool"
                  ].map((item, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-amber-700/80 dark:text-amber-400/80">
                          <TrendingUp size={14} className="mt-0.5 shrink-0" />
                          <span className="font-medium">{item}</span>
                      </li>
                  ))}
              </ul>
          </div>
        </>
      ) : (
        <div className="animate-in fade-in duration-300">
            {/* Search Bar for All Executives */}
            <div className="relative mb-6">
                <div className="absolute left-4 top-3 text-gray-400">
                    <Search size={18} />
                </div>
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search leaders..."
                    className="w-full bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl py-3 pl-12 pr-10 shadow-sm focus:ring-2 focus:ring-amber-500/20 outline-none dark:text-white text-sm"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-3 text-gray-400 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {displayedExecutives.length > 0 ? (
                    displayedExecutives.map((exec, idx) => (
                        <ExecutiveCard key={idx} exec={exec} idx={idx} />
                    ))
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <Users size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No results found for "{searchQuery}"</p>
                    </div>
                )}
            </div>

            <button 
                onClick={() => setIsShowingAll(false)}
                className="w-full mt-8 py-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold rounded-2xl shadow-sm border border-transparent dark:border-gray-700 active:scale-95 transition"
            >
                Back to Summary
            </button>
        </div>
      )}
    </div>
  );
};
