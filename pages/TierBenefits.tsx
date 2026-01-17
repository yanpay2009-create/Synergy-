
import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckCircle, Crown, Shield, Star, TrendingUp, Clock, Info, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserTier } from '../types';

export const TierBenefits: React.FC = () => {
  const { user, getNextTierTarget, language } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  const nextTarget = getNextTierTarget();
  const progress = Math.min(100, (user.accumulatedSales / nextTarget) * 100);

  const getDaysRemaining = () => {
    if (!user.teamIncomeExpiry) return 0;
    const expiry = new Date(user.teamIncomeExpiry);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = getDaysRemaining();
  const isEligible = daysRemaining > 0;

  const tiers = [
    {
      name: UserTier.STARTER,
      req: 'Free Sign-up',
      color: 'bg-gray-100 text-gray-600',
      icon: Shield,
      benefits: [
        '5% Direct Commission from referrals',
        'Personal purchases: No commission',
        'Regular product pricing (No discount)'
      ]
    },
    {
      name: UserTier.MARKETER,
      req: '฿3,000 Accumulated Sales',
      color: 'bg-pink-50 text-pink-600',
      icon: Star,
      benefits: [
        '10% Direct Commission from referrals',
        '10% Personal Member Discount',
        '5% Override from Starter teams',
        '2% Override from downline Marketer teams'
      ]
    },
    {
      name: UserTier.BUILDER,
      req: '฿9,000 Accumulated Sales',
      color: 'bg-purple-50 text-purple-700',
      icon: Zap,
      benefits: [
        '20% Direct Commission from referrals',
        '20% Personal Member Discount',
        '15% Override from Starter teams',
        '10% Override from Marketer teams',
        '2% Override from downline Builder teams'
      ]
    },
    {
      name: UserTier.EXECUTIVE,
      req: '฿18,000 Accumulated Sales',
      color: 'bg-amber-50 text-amber-600',
      icon: Crown,
      benefits: [
        '30% Direct Commission from referrals',
        '30% Personal Member Discount',
        '25% Override from Starter teams',
        '20% Override from Marketer teams',
        '10% Override from Builder teams',
        '1% Override from downline Executive teams'
      ]
    }
  ];

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">Member Benefits</h1>
        </div>
        <button 
          onClick={() => navigate('/executive-info')}
          className="p-2.5 bg-white dark:bg-gray-800 text-synergy-blue rounded-full shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition border border-blue-100 dark:border-gray-700 active:scale-95"
          title="Executive Data"
        >
          <Crown size={20} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-soft dark:shadow-none border border-transparent dark:border-gray-700 mb-4">
        <div className="flex justify-between items-center mb-4">
            <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">Current Tier</p>
                <h2 className={`text-2xl font-black ${user.tier === UserTier.EXECUTIVE ? 'text-amber-500' : user.tier === UserTier.BUILDER ? 'text-purple-700' : user.tier === UserTier.MARKETER ? 'text-pink-600' : 'text-synergy-blue'}`}>{user.tier} Affiliate</h2>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.tier === UserTier.EXECUTIVE ? 'bg-amber-50 text-amber-500' : user.tier === UserTier.BUILDER ? 'bg-purple-50 text-purple-700' : user.tier === UserTier.MARKETER ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-synergy-blue'}`}>
                {user.tier === UserTier.EXECUTIVE ? <Crown size={24} fill="currentColor" /> : user.tier === UserTier.BUILDER ? <Zap size={24} fill="currentColor" /> : <Star size={24} fill="currentColor" />}
            </div>
        </div>
        
        <div className="mb-2">
            <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress to Next Tier</span>
                <span className="text-synergy-blue font-bold">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${user.tier === UserTier.EXECUTIVE ? 'bg-gradient-to-r from-amber-400 to-orange-600' : user.tier === UserTier.BUILDER ? 'bg-gradient-to-r from-purple-700 to-indigo-900' : user.tier === UserTier.MARKETER ? 'bg-pink-500' : 'bg-synergy-blue'}`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
            {user.tier === UserTier.EXECUTIVE 
                ? "You have reached the maximum tier!" 
                : `Accumulate ฿${(nextTarget - user.accumulatedSales).toLocaleString()} more in sales to upgrade`}
        </p>
      </div>

      {user.tier !== UserTier.STARTER && (
          <div className={`p-4 rounded-2xl mb-6 shadow-sm border flex items-start space-x-3 transition-colors duration-300 ${isEligible ? 'bg-green-50 dark:bg-emerald-900/20 border-green-100 dark:border-emerald-800 text-green-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isEligible ? 'bg-green-100 dark:bg-emerald-900/40 text-green-600 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300'}`}>
                  {isEligible ? <Clock size={20} /> : <Clock size={20} className="animate-pulse" />}
              </div>
              <div>
                  <h4 className="text-sm font-bold mb-1">
                      Team Income Eligibility
                  </h4>
                  <p className="text-xs font-medium opacity-90">
                      {`Eligibility remains ${daysRemaining} days`}
                  </p>
                  <p className="text-[10px] mt-1 opacity-70 font-bold uppercase tracking-tight">
                      {'Make 1 sale to add +30 days to your current balance'}
                  </p>
              </div>
          </div>
      )}

      <h3 className="text-sm font-bold text-gray-500 uppercase ml-2 mb-4 tracking-widest">Commission & Benefits</h3>

      <div className="space-y-4">
        {tiers.map((tier) => {
            const isActive = user.tier === tier.name;
            const isPassed = 
                (user.tier === UserTier.EXECUTIVE && tier.name !== UserTier.EXECUTIVE) ||
                (user.tier === UserTier.BUILDER && (tier.name === UserTier.STARTER || tier.name === UserTier.MARKETER)) ||
                (user.tier === UserTier.MARKETER && tier.name === UserTier.STARTER);

            return (
                <div key={tier.name} className={`rounded-2xl p-5 border transition ${isActive ? 'bg-white dark:bg-gray-800 border-current shadow-md ring-1 ring-current/20' : 'bg-white dark:bg-gray-800 border-transparent shadow-sm opacity-90'} ${isActive ? (tier.name === UserTier.EXECUTIVE ? 'border-amber-500 text-amber-600 dark:text-amber-400' : tier.name === UserTier.BUILDER ? 'border-purple-700 text-purple-700 dark:text-purple-400' : tier.name === UserTier.MARKETER ? 'border-pink-500 text-pink-600' : 'border-synergy-blue text-synergy-blue dark:text-blue-400') : ''}`}>
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.color}`}>
                                <tier.icon size={20} fill="currentColor" className="opacity-80" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900 dark:text-white">{tier.name} Affiliate</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{tier.req}</p>
                            </div>
                        </div>
                        {isActive && <span className={`text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${tier.name === UserTier.EXECUTIVE ? 'bg-amber-500' : tier.name === UserTier.BUILDER ? 'bg-purple-700' : tier.name === UserTier.MARKETER ? 'bg-pink-500' : 'bg-synergy-blue'}`}>Active</span>}
                        {isPassed && <CheckCircle size={16} className="text-green-500" />}
                    </div>
                    
                    <ul className="space-y-2 mt-3">
                        {tier.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5 shrink-0"></div>
                                <span className="font-medium">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        })}
      </div>
    </div>
  );
};
