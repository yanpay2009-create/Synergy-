import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ShoppingCart, ShoppingBag, Star, ShieldCheck, Truck, User, Share2, Heart, Check, Zap, Info, X, UserPlus, Search, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserTier, Product } from '../types';

export const ProductDetail: React.FC = () => {
  const { products, addToCart, calculateCommission, user, referrer, addReferrer, t } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const product = products.find(p => p.id === Number(id));

  const [activeImage, setActiveImage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Referrer Modal State
  const [showReferrerModal, setShowReferrerModal] = useState(false);
  const [referrerCode, setReferrerCode] = useState('');
  const [referrerError, setReferrerError] = useState('');

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) return <div className="p-10 text-center text-gray-500">Product not found</div>;

  const commission = calculateCommission(product.price);
  const reviews = product.reviews || [];
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  // Related Products Logic
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  const getDiscountedPrice = (price: number) => {
      if (!user) return price;
      let discount = 0;
      if (user.tier === UserTier.MARKETER) discount = 0.10;
      else if (user.tier === UserTier.BUILDER) discount = 0.20;
      else if (user.tier === UserTier.EXECUTIVE) discount = 0.30;
      return price * (1 - discount);
  };

  const handleScroll = () => {
      if (scrollRef.current) {
          const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
          setActiveImage(index);
      }
  };

  const handleShare = async () => {
    // Check for referrer before sharing
    if (!referrer) {
      setShowReferrerModal(true);
      return;
    }

    const affiliateLink = `https://synergyflow.app/product/${product.id}?ref=${user?.referralCode || 'GUEST'}`;
    const shareText = `Check out ${product.name} on Synergy Flow! Earn commissions or shop now.`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: product.name,
                text: shareText,
                url: affiliateLink,
            });
        } catch (error) {
            console.log('Share canceled');
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareText);
            alert("Affiliate link copied to clipboard!");
        } catch (err) {
            alert("Could not copy link.");
        }
    }
  };

  const handleAddReferrer = () => {
      if (!referrerCode) return;
      const success = addReferrer(referrerCode);
      if (success) {
          setShowReferrerModal(false);
          setReferrerError('');
      } else {
          setReferrerError("Invalid Referrer Code.");
      }
  };

  const finalPrice = getDiscountedPrice(product.price);

  const getTierBadgeStyles = (tier: UserTier | undefined) => {
    switch (tier) {
      case UserTier.EXECUTIVE: return 'bg-amber-500/70 text-white border-white/40 shadow-[0_2px_10px_rgba(245,158,11,0.5)]';
      case UserTier.BUILDER: return 'bg-purple-700/70 text-white border-white/40 shadow-[0_2px_10px_rgba(126,34,206,0.5)]';
      case UserTier.MARKETER: return 'bg-pink-500/70 text-white border-white/40 shadow-[0_2px_10px_rgba(236,72,153,0.5)]';
      default: return 'bg-synergy-blue/70 text-white border-white/40 shadow-[0_2px_10px_rgba(0,181,255,0.5)]';
    }
  };

  return (
    <div className="pb-32 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="fixed top-0 left-0 right-0 p-4 pt-safe flex justify-between items-start z-50 pointer-events-none">
          <button 
              onClick={() => navigate(-1)} 
              className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full text-gray-800 dark:text-white shadow-soft border border-white/50 dark:border-gray-700 pointer-events-auto active:scale-90 transition-transform"
          >
              <ArrowLeft size={20} />
          </button>
      </div>

      <div className="relative h-[55vh] w-full bg-white dark:bg-gray-800 overflow-hidden">
         <div 
             ref={scrollRef}
             onScroll={handleScroll}
             className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full"
         >
             {images.map((img, i) => (
                 <img key={i} src={img} alt={`Product ${i}`} className="w-full h-full object-cover snap-center shrink-0" />
             ))}
         </div>

         {images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-1.5 z-20">
                {images.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === activeImage ? 'w-6 bg-synergy-blue shadow-glow' : 'w-2 bg-gray-300 dark:bg-gray-600'}`} />
                ))}
            </div>
         )}
         
         <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10" />
      </div>

      <div className="relative px-6 py-4 z-20 bg-white dark:bg-gray-900">
            <div className="flex justify-between items-center mb-5">
                 <span className="bg-synergy-blue/10 dark:bg-blue-900/30 text-synergy-blue dark:text-blue-400 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    {product.category}
                 </span>
                 <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-gray-700 dark:text-gray-200">4.8</span>
                    <span className="text-[10px] text-gray-400 font-medium ml-1">({reviews.length})</span>
                 </div>
            </div>

            <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight mb-4">{product.name}</h1>
                <div className="flex justify-between items-center">
                    <div className="inline-flex items-center space-x-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-1.5 pr-4 rounded-2xl">
                        <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                            <Zap size={16} fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider leading-none mb-0.5">Receive Commission</span>
                            <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">+฿{commission.toLocaleString()}</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleShare}
                        className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-800 dark:text-white shadow-soft border border-gray-100 dark:border-gray-700 active:scale-90 transition-all hover:bg-synergy-blue hover:text-white hover:border-synergy-blue"
                        title="Share Affiliate Link"
                    >
                        <Share2 size={22} />
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-end mb-10 pb-6 border-b border-gray-50 dark:border-gray-800">
                <div>
                    <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-black text-synergy-blue">฿{finalPrice.toLocaleString()}</h2>
                        {user && user.tier !== UserTier.STARTER && (
                            <div className="bg-synergy-blue/10 text-synergy-blue text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                                Member Price
                            </div>
                        )}
                    </div>
                    {user && user.tier !== UserTier.STARTER && (
                        <p className="text-xs text-gray-400 font-bold mt-1">
                            Regular Price: <span className="line-through">฿{product.price.toLocaleString()}</span>
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Status</p>
                    {/* Removed font-bold to lighten 'sold' text */}
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">In Stock • {product.sold} sold</span>
                </div>
            </div>

            <div className="space-y-10">
                <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-3">Product Story</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium opacity-80">
                        {product.description || "Crafted with precision for those who demand the best. This product represents the pinnacle of quality and modern design, ensuring you stay ahead of the curve while enjoying unparalleled comfort and style."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <Truck size={18} className="text-synergy-blue" />
                        <div>
                            <p className="text-xs font-black text-gray-800 dark:text-gray-100">Flash Delivery</p>
                            <p className="text-[10px] text-gray-400">1-2 Business Days</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        <div>
                            <p className="text-xs font-black text-gray-800 dark:text-gray-100">Genuine</p>
                            <p className="text-[10px] text-gray-400">100% Authentic</p>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Top Reviews</h3>
                        <button 
                            onClick={() => navigate(`/product/${product.id}/reviews`)}
                            className="text-xs text-synergy-blue font-bold flex items-center space-x-1"
                        >
                            <span>See All</span>
                            <ArrowLeft size={12} className="rotate-180" />
                        </button>
                    </div>
                    
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.slice(0, 1).map(review => (
                                <div key={review.id} className="bg-gray-50 dark:bg-gray-800/30 p-5 rounded-3xl border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 overflow-hidden shadow-sm border border-gray-100 dark:border-gray-600">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{review.user}</p>
                                                <div className="flex text-amber-400 mt-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={8} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-200 dark:text-gray-600"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{review.date}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">"{review.text}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-400 font-medium">No reviews yet. Be the first to review!</p>
                        </div>
                    )}
                </div>

                {/* RELATED PRODUCTS SECTION */}
                {relatedProducts.length > 0 && (
                    <div className="pb-10">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">{t('product.related')}</h3>
                        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
                            {relatedProducts.map(relProduct => (
                                <div 
                                    key={relProduct.id}
                                    onClick={() => navigate(`/product/${relProduct.id}`)}
                                    className="w-40 shrink-0 bg-white dark:bg-gray-800 rounded-[24px] shadow-sm hover:shadow-md transition duration-300 cursor-pointer active:scale-[0.98] border border-gray-50 dark:border-gray-700 overflow-hidden flex flex-col"
                                >
                                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                                        <img src={relProduct.image} alt={relProduct.name} className="w-full h-full object-cover" />
                                        <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full border backdrop-blur-md flex items-center font-black text-[10px] ${getTierBadgeStyles(user?.tier)}`}>
                                            +฿{calculateCommission(relProduct.price).toFixed(0)}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-[11px] font-bold text-gray-800 dark:text-gray-100 line-clamp-1 mb-1">{relProduct.name}</h3>
                                        <div className="flex justify-between items-center">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-synergy-blue">฿{getDiscountedPrice(relProduct.price).toLocaleString()}</p>
                                                {/* Removed font-bold for thinner 'sold' look */}
                                                <p className="text-[10px] text-gray-400 font-medium tracking-tighter">{relProduct.sold} sold</p>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); addToCart(relProduct); }} 
                                                className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-700 text-synergy-blue flex items-center justify-center hover:bg-synergy-blue hover:text-white transition shadow-sm shrink-0"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.08)] rounded-t-[32px] overflow-hidden">
          <div className="max-w-md mx-auto p-4 flex space-x-3">
              <button 
                onClick={() => {
                    addToCart(product);
                }}
                className="flex-1 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-800 dark:text-white font-black text-xs active:scale-95 transition-all hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700"
              >
                  Add to Cart
              </button>
              <button 
                onClick={() => {
                    addToCart(product);
                    navigate('/cart');
                }}
                className="flex-1 h-12 bg-synergy-blue text-white rounded-xl flex items-center justify-center font-black text-xs shadow-glow active:scale-95 transition-all hover:bg-synergy-dark flex items-center space-x-2"
              >
                  <span>Buy ฿{finalPrice.toLocaleString()}</span>
                  <ShoppingBag size={16} />
              </button>
          </div>
      </div>

      {/* REFERRER REQUIRED POPUP FOR PRODUCT DETAIL */}
      {showReferrerModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowReferrerModal(false)}></div>
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative z-10 animate-in zoom-in-95 border border-white/10">
                <button 
                    onClick={() => setShowReferrerModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>
                
                <div className="text-center">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-synergy-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <UserPlus size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Referrer Required</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                        To generate your personal affiliate link and track commissions, you must link your account to a referrer.
                    </p>
                    
                    <div className="mb-6">
                        <input 
                            value={referrerCode}
                            onChange={(e) => {
                                setReferrerCode(e.target.value.toUpperCase());
                                setReferrerError('');
                            }}
                            placeholder="Ex. BOSS001"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl py-4 px-4 text-center font-black text-xl uppercase tracking-widest text-synergy-blue placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-synergy-blue/30"
                        />
                        {referrerError && <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-tighter">{referrerError}</p>}
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button 
                            onClick={handleAddReferrer}
                            disabled={!referrerCode}
                            className="w-full bg-synergy-blue text-white font-black py-4 rounded-2xl shadow-glow active:scale-95 transition flex items-center justify-center space-x-2"
                        >
                            <Search size={20} />
                            <span>Link & Share</span>
                        </button>
                        <button 
                            onClick={() => setShowReferrerModal(false)}
                            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};