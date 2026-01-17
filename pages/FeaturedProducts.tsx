import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserTier } from '../types';

export const FeaturedProducts: React.FC = () => {
  const { products, addToCart, calculateCommission, user, t, setBottomNavHidden } = useApp();
  const navigate = useNavigate();

  // Scroll hide logic
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 150) {
        setBottomNavHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setBottomNavHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Ensure nav is visible when leaving the page
      setBottomNavHidden(false);
    };
  }, [setBottomNavHidden]);

  const featuredProducts = [...products].sort((a, b) => b.sold - a.sold);

  const getTierBadgeStyles = (tier: UserTier | undefined) => {
    switch (tier) {
      case UserTier.EXECUTIVE: return 'bg-amber-500/80 text-white border-white/40 shadow-[0_2px_10px_rgba(245,158,11,0.5)]';
      case UserTier.BUILDER: return 'bg-purple-700/80 text-white border-white/40 shadow-[0_2px_10px_rgba(126,34,206,0.5)]';
      case UserTier.MARKETER: return 'bg-pink-500/80 text-white border-white/40 shadow-[0_2px_10px_rgba(236,72,153,0.5)]';
      default: return 'bg-synergy-blue/80 text-white border-white/40 shadow-[0_2px_10px_rgba(0,181,255,0.5)]';
    }
  };

  const getDiscountedPrice = (price: number) => {
      if (!user) return price;
      let discount = 0;
      if (user.tier === UserTier.MARKETER) discount = 0.10;
      else if (user.tier === UserTier.BUILDER) discount = 0.20;
      else if (user.tier === UserTier.EXECUTIVE) discount = 0.30;
      return price * (1 - discount);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">Featured Products</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
          {featuredProducts.map(product => (
            <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white dark:bg-gray-800 rounded-[24px] shadow-sm hover:shadow-md transition duration-300 cursor-pointer active:scale-[0.98] border border-transparent dark:border-gray-700 overflow-hidden flex flex-col"
            >
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    {/* Commission Badge */}
                    <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full border backdrop-blur-md flex items-center font-black text-[10px] ${getTierBadgeStyles(user?.tier)}`}>
                        +฿{calculateCommission(product.price).toFixed(0)}
                    </div>
                </div>
                <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">{product.name}</h3>
                    <div className="flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-base font-black text-synergy-blue">฿{getDiscountedPrice(product.price).toLocaleString()}</p>
                            {/* Regular price font size set to 10px */}
                            {user && user.tier !== UserTier.STARTER && (
                                <p className="text-[10px] text-gray-400 line-through leading-none mt-0.5">฿{product.price.toLocaleString()}</p>
                            )}
                            {/* Move sold count to here, below the line-through price, with thin font and lowercase */}
                            <p className="text-[10px] text-gray-400 font-medium mt-1 tracking-tight">{product.sold} {t('home.sold')}</p>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                            }}
                            className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-700 text-synergy-blue flex items-center justify-center hover:bg-synergy-blue hover:text-white transition shadow-sm shrink-0 ml-1"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            </div>
          ))}
      </div>
    </div>
  );
};