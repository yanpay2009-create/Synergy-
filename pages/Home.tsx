import React, { useState, useEffect, useRef } from 'react';
import { useApp, TIER_THRESHOLDS } from '../context/AppContext';
import { Plus, Search, Bell, TrendingUp, BarChart3, Star as StarIcon, Sparkles, Filter, Zap, X, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserTier, Product } from '../types';

export const Home: React.FC = () => {
  const { user, products, addToCart, calculateCommission, t, notifications, ads, setIsSearchActive, setBottomNavHidden } = useApp();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByCommission, setSortByCommission] = useState(false);
  
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setBottomNavHidden]);

  const activeAds = ads.filter(ad => ad.active);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeAds.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeAds.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeAds.length]);

  const getTierColors = (tier: UserTier | undefined) => {
    switch (tier) {
      case UserTier.EXECUTIVE:
        return { text: 'text-amber-600 dark:text-amber-400', bgLight: 'bg-amber-50 dark:bg-amber-900/30', progress: 'bg-gradient-to-r from-amber-400 to-orange-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]', decoration: 'from-amber-400/20', icon: Crown };
      case UserTier.BUILDER:
        return { text: 'text-purple-700 dark:text-purple-400', bgLight: 'bg-purple-50 dark:bg-purple-900/30', progress: 'bg-gradient-to-r from-purple-700 to-indigo-900 shadow-[0_0_15px_rgba(126,34,206,0.4)]', decoration: 'from-purple-700/20', icon: Zap };
      case UserTier.MARKETER: 
        return { text: 'text-pink-600 dark:text-pink-400', bgLight: 'bg-pink-50 dark:bg-pink-900/30', progress: 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]', decoration: 'from-pink-400/20', icon: BarChart3 };
      default:
        return { text: 'text-synergy-blue dark:text-blue-400', bgLight: 'bg-blue-50 dark:bg-blue-900/30', progress: 'bg-synergy-blue shadow-[0_0_15px_rgba(0,181,255,0.4)]', decoration: 'from-synergy-blue/20', icon: Sparkles };
    }
  };

  const tierColors = getTierColors(user?.tier);

  let filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (sortByCommission) {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  }

  const featuredProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const categories = ['All', 'Health', 'Gadgets', 'Beauty', 'Fashion', 'Home'];
  const unreadCount = notifications.filter(n => !n.read).length;

  let globalProgress = 0; 
  if (user) {
    const sales = user.accumulatedSales;
    const t_marketer = TIER_THRESHOLDS[UserTier.MARKETER];
    const t_builder = TIER_THRESHOLDS[UserTier.BUILDER];
    const t_executive = TIER_THRESHOLDS[UserTier.EXECUTIVE];

    if (sales >= t_executive) {
        globalProgress = 100;
    } else if (sales >= t_builder) {
        globalProgress = 50 + ((sales - t_builder) / (t_executive - t_builder)) * 50;
    } else if (sales >= t_marketer) {
        globalProgress = 25 + ((sales - t_marketer) / (t_builder - t_marketer)) * 25;
    } else {
        globalProgress = (sales / t_marketer) * 25;
    }
  }

  const getTierBadgeStyles = (tier: UserTier | undefined) => {
    switch (tier) {
      case UserTier.EXECUTIVE: return 'bg-amber-500/70 text-white border-white/40 shadow-[0_2px_10px_rgba(245,158,11,0.5)]';
      case UserTier.BUILDER: return 'bg-purple-700/70 text-white border-white/40 shadow-[0_2px_10px_rgba(126,34,206,0.5)]';
      case UserTier.MARKETER: return 'bg-pink-500/70 text-white border-white/40 shadow-[0_2px_10px_rgba(236,72,153,0.5)]';
      default: return 'bg-synergy-blue/70 text-white border-white/40 shadow-[0_2px_10px_rgba(0,181,255,0.5)]';
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

  const ProductCard: React.FC<{ product: Product, isFeatured?: boolean }> = ({ product, isFeatured = false }) => (
    <div 
        onClick={() => navigate(`/product/${product.id}`)}
        className={`${isFeatured ? 'w-40 shrink-0' : 'w-full'} bg-white dark:bg-gray-800 rounded-[24px] shadow-sm hover:shadow-md transition duration-300 cursor-pointer active:scale-[0.98] border border-transparent dark:border-gray-700 overflow-hidden flex flex-col`}
    >
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full border backdrop-blur-md flex items-center font-black text-[10px] ${getTierBadgeStyles(user?.tier)}`}>
                +฿{calculateCommission(product.price).toFixed(0)}
            </div>
        </div>
        <div className="p-3">
            <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">{product.name}</h3>
            <div className="flex justify-between items-center">
                <div className="min-w-0">
                    <p className="text-sm font-black text-synergy-blue">฿{getDiscountedPrice(product.price).toLocaleString()}</p>
                    {user && user.tier !== UserTier.STARTER && (
                        <p className="text-[10px] text-gray-400 line-through leading-none">฿{product.price.toLocaleString()}</p>
                    )}
                    {!isFeatured && <p className="text-[10px] text-gray-400 font-medium mt-1 tracking-tight">{product.sold} {t('home.sold')}</p>}
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
                    className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-700 text-synergy-blue flex items-center justify-center hover:bg-synergy-blue hover:text-white transition shadow-sm shrink-0 ml-1"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="pb-24 pt-0 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 relative transition-colors duration-300 font-sans">
      <div className="relative w-full h-56 bg-gray-200 dark:bg-gray-800 mb-6 overflow-hidden shadow-soft">
         <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-6 flex items-center space-x-3 bg-gradient-to-b from-black/40 to-transparent">
            <div className="flex-1 flex items-center bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl px-4 py-2 shadow-sm transition-all focus-within:bg-white/30 focus-within:border-white/50">
               <Search size={16} className="text-white/90 mr-2" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => setIsSearchActive(true)}
                 onBlur={() => setIsSearchActive(false)}
                 placeholder={t('home.cat.all') + '...'} 
                 className="bg-transparent border-none outline-none text-xs text-white placeholder-white/90 w-full font-medium"
               />
               {searchQuery && <button onClick={() => setSearchQuery('')} className="text-white/70 hover:text-white"><X size={14} /></button>}
            </div>
            <button onClick={() => navigate('/notifications')} className="relative p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white/30 transition shadow-sm">
               <Bell size={18} />
               {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
            </button>
         </div>

         {activeAds.length > 0 ? activeAds.map((ad, index) => (
           <div key={ad.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
             <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
             <div className="absolute bottom-8 left-6 text-white max-w-[80%]">
                <span className="bg-synergy-blue/90 backdrop-blur-md text-[9px] font-bold px-2 py-1 rounded-md mb-2 inline-block shadow-lg border border-white/20 tracking-wider uppercase">Promotion</span>
                <h2 className="text-2xl font-bold mb-1 drop-shadow-lg leading-tight">{ad.title}</h2>
                <p className="text-xs font-medium opacity-90 drop-shadow-md">{ad.subtitle}</p>
             </div>
           </div>
         )) : (
            <div className="w-full h-full bg-gradient-to-br from-synergy-blue to-purple-900 flex items-center justify-center p-10 text-center">
                <h2 className="text-white text-xl font-bold">Synergy Flow</h2>
            </div>
         )}
         
         {activeAds.length > 1 && (
             <div className="absolute bottom-6 right-6 flex space-x-1.5 z-10">
                {activeAds.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ease-out backdrop-blur-sm ${currentSlide === idx ? 'bg-white w-6 shadow-glow' : 'bg-white/30 w-1.5'}`} />
                ))}
             </div>
         )}
      </div>

      <div className="px-4">
        <div className="flex space-x-3 overflow-x-auto no-scrollbar mb-6 pb-2" role="tablist">
          {categories.map((cat, i) => (
            <button 
              key={i} role="tab" aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-medium transition ${activeCategory === cat ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              {t(`home.cat.${cat.toLowerCase()}`)}
            </button>
          ))}
        </div>

        {!searchQuery && activeCategory === 'All' && (
          <>
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                      <TrendingUp className="text-synergy-blue" size={20} />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('home.featured')}</h3>
                  </div>
                  <button 
                    onClick={() => navigate('/featured-products')}
                    className="text-xs font-bold text-synergy-blue hover:underline"
                  >
                    See all
                  </button>
                </div>
                <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
                  {featuredProducts.map(product => (
                    <ProductCard key={product.id} product={product} isFeatured={true} />
                  ))}
                </div>
            </div>

            <button onClick={() => navigate('/tier-benefits')} className="w-full text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[24px] p-6 mb-8 shadow-soft dark:shadow-none border border-white/60 dark:border-gray-700 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all duration-200">
                <div className="text-center mb-6 relative z-10">
                    <div className={`inline-flex items-center space-x-2 ${tierColors.bgLight} px-3 py-1.5 rounded-full mb-2 border border-white/50 dark:border-gray-600 shadow-sm`}>
                        <tierColors.icon size={12} className={tierColors.text} />
                        <span className={`text-[10px] ${tierColors.text} font-black uppercase tracking-wider`}>{user?.tier === UserTier.EXECUTIVE ? 'Max Level Active' : 'Upgrade Progress'}</span>
                    </div>
                    <div className="h-10 flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{user?.tier === UserTier.EXECUTIVE ? 'Executive Affiliate' : t('home.upgrade_title')}</h2>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">{t('home.upgrade_desc')}</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner relative mb-3">
                        <div className={`h-full ${tierColors.progress} rounded-full relative transition-all duration-1000 ease-out`} style={{ width: `${globalProgress}%` }}><div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 rounded-full"></div></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-gray-400 dark:text-gray-500 px-1 uppercase tracking-widest">
                        <span className={user?.tier === UserTier.STARTER ? 'text-synergy-blue' : ''}>Starter</span>
                        <span className={user?.tier === UserTier.MARKETER ? 'text-pink-600' : ''}>Marketer</span>
                        <span className={user?.tier === UserTier.BUILDER ? 'text-purple-700' : ''}>Builder</span>
                        <span className={user?.tier === UserTier.EXECUTIVE ? 'text-amber-600' : ''}>Executive</span>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 dark:from-blue-900/20 to-transparent rounded-bl-[100px] pointer-events-none"></div>
                <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${tierColors.decoration} to-transparent rounded-tr-[80px] pointer-events-none`}></div>
            </button>
          </>
        )}

        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center space-x-2">
              {!searchQuery && <Sparkles className="text-synergy-blue" size={20} />}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                 {searchQuery ? `Results for "${searchQuery}"` : "For You"}
              </h3>
           </div>
           <button onClick={() => setSortByCommission(!sortByCommission)} className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border ${sortByCommission ? 'bg-synergy-blue text-white border-synergy-blue shadow-glow' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}><Zap size={12} fill={sortByCommission ? "currentColor" : "none"} /><span>Sort</span></button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><p className="text-sm font-medium">No results found.</p></div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};