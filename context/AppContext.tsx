import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User, UserTier, Product, CartItem, FeedItem, AppContextType, TeamMember, Referrer, CommissionTransaction, Address, Coupon, PaymentType, BankAccount, CreditCardInfo, KYCStatus, Notification, Order, Language, FontSize, Ad, OnboardingSlide, OrderStatus, Promotion, SystemSettings, CampaignAsset, ToastMessage, OrderTimelineItem } from '../types';
import { dictionary } from './translations';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const TO_PRECISION = (num: number): number => Math.round((num + Number.EPSILON) * 100) / 100;

export const TIER_THRESHOLDS = {
  [UserTier.STARTER]: 0,
  [UserTier.MARKETER]: 3000,
  [UserTier.BUILDER]: 9000,
  [UserTier.EXECUTIVE]: 18000
};

const TIER_RATES = {
  [UserTier.STARTER]: 0.05,
  [UserTier.MARKETER]: 0.10,
  [UserTier.BUILDER]: 0.20,
  [UserTier.EXECUTIVE]: 0.30
};

const TIER_DISCOUNTS = {
  [UserTier.STARTER]: 0,
  [UserTier.MARKETER]: 0.10,
  [UserTier.BUILDER]: 0.20,
  [UserTier.EXECUTIVE]: 0.30
};

const DEFAULT_USER_EMAIL = "synergyflow.my@gmail.com";

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Collagen Glow Pro", price: 1200, category: "Health", image: "https://picsum.photos/300/300?random=1", images: ["https://picsum.photos/300/300?random=1", "https://picsum.photos/300/300?random=101"], sold: 0, description: "Premium marine collagen peptides for radiant skin.", reviews: [] },
  { id: 2, name: "Smart Watch Ultra", price: 3500, category: "Gadgets", image: "https://picsum.photos/300/300?random=2", images: ["https://picsum.photos/300/300?random=2", "https://picsum.photos/300/300?random=201"], sold: 0, description: "The ultimate companion for adventure.", reviews: [] },
  { id: 3, name: "Wireless Earbuds", price: 990, category: "Gadgets", image: "https://picsum.photos/300/300?random=3", images: ["https://picsum.photos/300/300?random=3"], sold: 0, description: "Immersive sound with noise cancellation.", reviews: [] },
  { id: 4, name: "Organic Face Oil", price: 850, category: "Beauty", image: "https://picsum.photos/300/300?random=4", images: ["https://picsum.photos/300/300?random=4"], sold: 0, description: "Pure organic oils for a healthy glow.", reviews: [] }
];

const INITIAL_ADS: Ad[] = [
  { id: 1, title: 'Welcome to Synergy!', subtitle: 'Start your affiliate journey today.', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', active: true }
];

const INITIAL_ASSETS: CampaignAsset[] = [
  { id: 1, title: 'Summer Promo Set 1', description: 'High conversion banner for seasonal sales.', image: 'https://picsum.photos/200/200?random=101', active: true },
  { id: 2, title: 'Summer Promo Set 2', description: 'Alternative conversion banner.', image: 'https://picsum.photos/200/200?random=102', active: true }
];

const INITIAL_ONBOARDING: OnboardingSlide[] = [
  { id: 1, title: "Welcome to Synergy Flow", desc: "The premium affiliate network designed for high-conversion marketing.", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop" },
  { id: 2, title: "Tiered Commissions", desc: "Achieve Executive status and earn up to 30% on every direct sale.", image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=800&auto=format&fit=crop" },
  { id: 3, title: "Content Studio", desc: "Use our built-in AI to generate viral reviews and marketing posts instantly.", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop" }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('synergy_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isLoggedIn = !!user;
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('synergy_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('synergy_lang');
    return (saved as Language) || 'en';
  });
  
  const [fontSize, setFontSize] = useState<FontSize>(() => {
      const saved = localStorage.getItem('synergy_font_size');
      return (saved as FontSize) || 'medium';
  });

  const [products, setProducts] = useState<Product[]>(() => {
      const saved = localStorage.getItem('synergy_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [feed, setFeed] = useState<FeedItem[]>(() => {
      const saved = localStorage.getItem('synergy_feed');
      return saved ? JSON.parse(saved) : [];
  });

  const [ads, setAds] = useState<Ad[]>(() => {
      const saved = localStorage.getItem('synergy_ads');
      return saved ? JSON.parse(saved) : INITIAL_ADS;
  });

  const [campaignAssets, setCampaignAssets] = useState<CampaignAsset[]>(() => {
      const saved = localStorage.getItem('synergy_campaign_assets');
      return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [onboardingSlides, setOnboardingSlides] = useState<OnboardingSlide[]>(() => {
      const saved = localStorage.getItem('synergy_onboarding');
      return saved ? JSON.parse(saved) : INITIAL_ONBOARDING;
  });

  const [allOrders, setAllOrders] = useState<Order[]>(() => {
      const saved = localStorage.getItem('synergy_orders');
      return saved ? JSON.parse(saved) : [];
  });

  const [allTeam, setAllTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('synergy_team');
    return saved ? JSON.parse(saved) : [];
  });

  const [allCommissions, setAllCommissions] = useState<CommissionTransaction[]>(() => {
    const saved = localStorage.getItem('synergy_commissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [allNotifications, setAllNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('synergy_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('synergy_settings');
    return saved ? JSON.parse(saved) : {
        logo: null,
        contactLinks: { line: '', phone: '', email: '', website: '', terms: '', privacy: '' }
    };
  });

  const [activePromo, setActivePromo] = useState<Promotion | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);
  const [bottomNavHidden, setBottomNavHidden] = useState(false);
  
  // Security State
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false);

  // Notification State
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('synergy_notifications_enabled');
    return saved === null ? true : saved === 'true';
  });

  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem('synergy_notifications_enabled', String(enabled));
  };

  const userOrders = useMemo(() => allOrders.filter(o => o.userId === user?.email), [allOrders, user]);
  const userTeam = useMemo(() => allTeam.filter(m => m.uplineId === user?.email), [allTeam, user]);
  const userCommissions = useMemo(() => allCommissions.filter(c => c.userId === user?.email), [allCommissions, user]);
  
  const userNotifications = useMemo(() => 
    allNotifications.filter(n => n.userId === user?.email || n.userId === 'global'), 
    [allNotifications, user]
  );

  const [referrer, setReferrer] = useState<Referrer | null>(() => {
      const saved = localStorage.getItem('synergy_referrer');
      return saved ? JSON.parse(saved) : null;
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
      const saved = localStorage.getItem('synergy_addresses');
      return saved ? JSON.parse(saved) : [];
  });
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(() => {
      const saved = localStorage.getItem('synergy_selected_address');
      return saved ? JSON.parse(saved) : null;
  });
  const [paymentMethod, setPaymentMethodState] = useState<PaymentType>(() => {
      const saved = localStorage.getItem('synergy_payment_method');
      return (saved as PaymentType) || 'PromptPay';
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
      const saved = localStorage.getItem('synergy_banks');
      return saved ? JSON.parse(saved) : [];
  });
  const [savedCards, setSavedCards] = useState<CreditCardInfo[]>(() => {
      const saved = localStorage.getItem('synergy_cards');
      return saved ? JSON.parse(saved) : [];
  });
  const [selectedCardId, setSelectedCardIdState] = useState<number | null>(() => {
      const saved = localStorage.getItem('synergy_selected_card');
      return saved ? JSON.parse(saved) : null;
  });
  const [kycStatus, setKycStatus] = useState<KYCStatus>(() => {
      const saved = localStorage.getItem('synergy_kyc');
      return (saved as KYCStatus) || 'Unverified';
  });

  useEffect(() => { if (user) localStorage.setItem('synergy_user', JSON.stringify(user)); else localStorage.removeItem('synergy_user'); }, [user]);
  useEffect(() => { if (referrer) localStorage.setItem('synergy_referrer', JSON.stringify(referrer)); else localStorage.removeItem('synergy_referrer'); }, [referrer]);
  useEffect(() => { localStorage.setItem('synergy_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('synergy_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('synergy_ads', JSON.stringify(ads)); }, [ads]);
  useEffect(() => { localStorage.setItem('synergy_campaign_assets', JSON.stringify(campaignAssets)); }, [campaignAssets]);
  useEffect(() => { localStorage.setItem('synergy_onboarding', JSON.stringify(onboardingSlides)); }, [onboardingSlides]);
  useEffect(() => { localStorage.setItem('synergy_orders', JSON.stringify(allOrders)); }, [allOrders]);
  useEffect(() => { localStorage.setItem('synergy_team', JSON.stringify(allTeam)); }, [allTeam]);
  useEffect(() => { localStorage.setItem('synergy_commissions', JSON.stringify(allCommissions)); }, [allCommissions]);
  useEffect(() => { localStorage.setItem('synergy_notifications', JSON.stringify(allNotifications)); }, [allNotifications]);
  useEffect(() => { localStorage.setItem('synergy_lang', language); }, [language]);
  useEffect(() => { localStorage.setItem('synergy_settings', JSON.stringify(systemSettings)); }, [systemSettings]);
  useEffect(() => { localStorage.setItem('synergy_addresses', JSON.stringify(addresses)); }, [addresses]);
  useEffect(() => { localStorage.setItem('synergy_selected_address', JSON.stringify(selectedAddressId)); }, [selectedAddressId]);
  useEffect(() => { localStorage.setItem('synergy_banks', JSON.stringify(bankAccounts)); }, [bankAccounts]);
  useEffect(() => { localStorage.setItem('synergy_cards', JSON.stringify(savedCards)); }, [savedCards]);
  useEffect(() => { localStorage.setItem('synergy_selected_card', JSON.stringify(selectedCardId)); }, [selectedCardId]);
  useEffect(() => { localStorage.setItem('synergy_payment_method', paymentMethod); }, [paymentMethod]);
  useEffect(() => { localStorage.setItem('synergy_kyc', kycStatus); }, [kycStatus]);
  
  // Refined Font Size Scale (Compact: 14px, Standard: 16px, Large: 19px)
  useEffect(() => {
      localStorage.setItem('synergy_font_size', fontSize);
      const root = document.documentElement;
      if (fontSize === 'small') {
          root.style.fontSize = '14px';
      } else if (fontSize === 'large') {
          root.style.fontSize = '19px';
      } else {
          root.style.fontSize = '16px';
      }
  }, [fontSize]);

  const showToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
      setCurrentToast({ ...msg, id: Date.now() });
  }, []);

  const dismissToast = useCallback(() => {
      setCurrentToast(null);
  }, []);

  const getTierBySales = (sales: number): UserTier => {
    if (sales >= TIER_THRESHOLDS[UserTier.EXECUTIVE]) return UserTier.EXECUTIVE;
    if (sales >= TIER_THRESHOLDS[UserTier.BUILDER]) return UserTier.BUILDER;
    if (sales >= TIER_THRESHOLDS[UserTier.MARKETER]) return UserTier.MARKETER;
    return UserTier.STARTER; 
  };

  const login = (email: string, name?: string) => {
    setUser({
      name: name || (email === DEFAULT_USER_EMAIL ? "System Administrator" : "Verified User"),
      username: name || email.split('@')[0],
      email: email,
      phone: email.match(/^[0-9]+$/) ? email : "",
      lineId: "",
      tier: UserTier.STARTER,
      accumulatedSales: 0,    
      walletBalance: 1000, 
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      referralCode: `SYN${Math.floor(1000 + Math.random() * 8999)}`,
      pin: email === DEFAULT_USER_EMAIL ? "123456" : "", 
      password: "password123", 
      teamIncomeExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      socials: { facebook: { connected: false, name: '' }, line: { connected: false, name: '' }, google: { connected: true, name: email } }
    });
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setReferrer(null);
    setAppliedCoupon(null);
    dismissToast();
    setIsSecurityUnlocked(false);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => { setCart(prev => prev.filter(item => item.id !== productId)); };
  const updateCartQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const getCommissionRate = (): number => user ? (TIER_RATES[user.tier] || TIER_RATES[UserTier.STARTER]) : TIER_RATES[UserTier.STARTER];
  
  const calculateCommission = (price: number): number => {
      const preVatPrice = price / 1.07;
      return TO_PRECISION(preVatPrice * getCommissionRate());
  };

  const getNextTierTarget = (): number => {
    if (!user) return TIER_THRESHOLDS[UserTier.MARKETER];
    if (user.accumulatedSales < TIER_THRESHOLDS[UserTier.MARKETER]) return TIER_THRESHOLDS[UserTier.MARKETER];
    if (user.accumulatedSales < TIER_THRESHOLDS[UserTier.BUILDER]) return TIER_THRESHOLDS[UserTier.BUILDER];
    return TIER_THRESHOLDS[UserTier.EXECUTIVE]; 
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    const newId = Date.now();
    const newAddr = { ...address, id: newId };
    setAddresses(prev => address.isDefault ? prev.map(a => ({ ...a, iDefault: false })).concat(newAddr) : [...prev, newAddr]);
    if (!selectedAddressId) setSelectedAddressId(newId);
  };

  const selectAddress = (id: number) => { setSelectedAddressId(id); };
  const setPaymentMethod = (method: PaymentType) => { setPaymentMethodState(method); };

  const applyCoupon = (code: string): boolean => {
    if (code.toUpperCase() === "SYNERGY2024") { 
        setAppliedCoupon({ code: "SYNERGY2024", type: 'percent', value: 5, description: "Launch Bonus 5% Off" }); 
        return true; 
    }
    return false;
  };

  const removeCoupon = () => { setAppliedCoupon(null); };

  const getCartTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let memberDiscount = 0;
    if (user) {
        memberDiscount = subtotal * (TIER_DISCOUNTS[user.tier] || 0);
    }
    memberDiscount = TO_PRECISION(memberDiscount);
    let couponDiscount = appliedCoupon ? (appliedCoupon.type === 'percent' ? TO_PRECISION(subtotal * (appliedCoupon.value / 100)) : appliedCoupon.value) : 0;
    const totalDiscount = memberDiscount + couponDiscount;
    const finalPrice = Math.max(0, subtotal - totalDiscount);
    
    const vat = TO_PRECISION(finalPrice - (finalPrice / 1.07)); 
    const total = TO_PRECISION(finalPrice);
    
    return { subtotal, discount: totalDiscount, memberDiscount, couponDiscount, vat, total };
  };

  const checkout = () => {
    if (!user) return;
    const shippingAddr = addresses.find(a => a.id === selectedAddressId);
    if (!shippingAddr) { alert("Please select a shipping address."); return; }
    const { total } = getCartTotals();
    if (paymentMethod === 'Wallet' && user.walletBalance < total) { alert("Insufficient Wallet Balance!"); return; }
    
    const orderId = `SF-${Math.floor(100000 + Math.random() * 899999)}`;
    const nowTimestamp = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const newOrder: Order = { 
        id: orderId, 
        userId: user.email, 
        date: nowTimestamp, 
        items: [...cart], 
        total: total, 
        status: 'Pending', 
        shippingAddress: { ...shippingAddr }, 
        timeline: [
          { status: 'Payment Verified', date: new Date().toLocaleString(), completed: true }, 
          { status: 'Preparing Ship', date: '', completed: false }, 
          { status: 'Shipped', date: '', completed: false }, 
          { status: 'Delivered', date: '', completed: false }
        ] 
    };

    setAllOrders(prev => [newOrder, ...prev]);

    let newBalance = paymentMethod === 'Wallet' ? TO_PRECISION(user.walletBalance - total) : user.walletBalance;
    const newAccumulatedSales = TO_PRECISION(user.accumulatedSales + total);
    const newTier = getTierBySales(newAccumulatedSales);

    let newExpiry = user.teamIncomeExpiry;
    if (user.tier !== UserTier.STARTER) {
        const now = new Date();
        const currentExpiry = user.teamIncomeExpiry ? new Date(user.teamIncomeExpiry) : now;
        const baseDate = currentExpiry > now ? currentExpiry : now;
        const extendedDate = new Date(baseDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        newExpiry = extendedDate.toISOString();
    }

    setUser({ 
        ...user, 
        walletBalance: newBalance,
        accumulatedSales: newAccumulatedSales,
        tier: newTier,
        teamIncomeExpiry: newExpiry
    });

    setProducts(prev => prev.map(p => {
        const cartItem = cart.find(ci => ci.id === p.id);
        return cartItem ? { ...p, sold: p.sold + cartItem.quantity } : p;
    }));
    setCart([]);
    setAppliedCoupon(null);
    setAllNotifications(prev => [{ id: Date.now(), userId: user.email, title: "Order Placed", message: `Order ${newOrder.id} is pending.`, date: "Just now", type: 'order', read: false, relatedId: newOrder.id, relatedType: 'order' }, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => { 
      setAllOrders(prev => prev.map(o => {
          if (o.id === orderId) {
              const now = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              const updatedTimeline = o.timeline.map(step => {
                  if (status === 'To Ship' && step.status === 'Preparing Ship') {
                      return { ...step, completed: true, date: now };
                  }
                  if (status === 'Shipped' && step.status === 'Shipped') {
                      return { ...step, completed: true, date: now };
                  }
                  if (status === 'Delivered' && step.status === 'Delivered') {
                      return { ...step, completed: true, date: now };
                  }
                  return step;
              });

              const updated = { ...o, status, timeline: updatedTimeline };
              if (status === 'Delivered') {
                  settleCommissionForOrder(orderId);
              }
              return updated;
          }
          return o;
      })); 
  };

  const settleCommissionForOrder = (orderId: string) => {
      setAllCommissions(prev => {
          const txIndex = prev.findIndex(t => t.orderId === orderId && t.status === 'Pending');
          if (txIndex === -1) return prev;

          const updatedTx = { ...prev[txIndex], status: 'Paid' as const };
          const newCommissions = [...prev];
          newCommissions[txIndex] = updatedTx;

          if (user && updatedTx.userId === user.email) {
              setUser(curr => curr ? ({
                  ...curr,
                  walletBalance: TO_PRECISION(curr.walletBalance + updatedTx.amount)
              }) : null);
              
              setAllNotifications(notifs => [{
                  id: Date.now() + 1,
                  userId: user.email,
                  title: "Commission Settled! ฿" + updatedTx.amount,
                  message: `Your commission for order ${orderId} has been moved to available balance.`,
                  date: "Just now",
                  type: 'promo',
                  read: false,
                  relatedId: updatedTx.id,
                  relatedType: 'commission'
              }, ...notifs]);
          }
          return newCommissions;
      });
  };

  const addBankAccount = (account: Omit<BankAccount, 'id'>): boolean => {
    if (bankAccounts.length >= 2) return false;
    setBankAccounts(prev => [...prev, { ...account, id: Date.now() }]);
    return true;
  };
  const removeBankAccount = (id: number) => { setBankAccounts(prev => prev.filter(b => b.id !== id)); };

  const addCreditCard = (card: Omit<CreditCardInfo, 'id' | 'brand'>) => {
    const brands: ('Visa' | 'Mastercard' | 'JCB' | 'Amex')[] = ['Visa', 'Mastercard', 'JCB', 'Amex'];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const newCard = { ...card, id: Date.now(), brand };
    setSavedCards(prev => [...prev, newCard]);
    if (!selectedCardId) setSelectedAddressId(newCard.id);
  };
  const removeCreditCard = (id: number) => {
    setSavedCards(prev => prev.filter(c => c.id !== id));
    if (selectedCardId === id) setSelectedAddressId(null);
  };
  const selectCreditCard = (id: number) => { setSelectedAddressId(id); };

  const updateKycStatus = (status: KYCStatus) => { setKycStatus(status); };
  const updateUserProfile = (data: Partial<User>) => { if (user) setUser({ ...user, ...data }); };
  
  const withdrawFunds = (amount: number, bankId: number): CommissionTransaction | null => {
    if (!user) return null;
    if (kycStatus !== 'Verified') return null; 
    
    const bank = bankAccounts.find(b => b.id === bankId);
    if (!bank) return null; 
    const nowTimestamp = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const newTx: CommissionTransaction = { id: Date.now(), userId: user.email, date: nowTimestamp, source: `Withdrawal: ${bank.accountName} | ${bank.bankName} | ACC: ${bank.accountNumber}`, type: "Withdrawal", amount: -amount, status: "Waiting" };
    setAllCommissions(prev => [newTx, ...prev]);
    setUser({ ...user, walletBalance: TO_PRECISION(user.walletBalance - amount) });
    return newTx;
  };

  const markNotificationAsRead = (id: number) => { setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); };
  const toggleFeedLike = (id: number) => { setFeed(prev => prev.map(item => item.id === id ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 } : item)); };
  const addFeedComment = (id: number, text: string) => { setFeed(prev => prev.map(item => item.id === id ? { ...item, comments: [...item.comments, { id: Date.now(), user: user?.name || 'User', avatar: user?.avatar || '', text, date: 'Just now' }] } : item)); };
  
  const createPost = (data: { image: string, caption: string, mood: string }) => { 
    const isVideo = data.image.startsWith('data:video/');
    setFeed(prev => [{ 
        id: Date.now(), 
        type: isVideo ? 'video' : 'image', 
        category: 'For You', 
        user: user?.name || 'User', 
        userId: user?.email || '', 
        avatar: user?.avatar || '', 
        content: data.image, 
        caption: data.caption, 
        mood: data.mood, 
        status: 'Pending', 
        likes: 0, 
        isLiked: false, 
        shares: 0, 
        comments: [],
        isAi: true 
    }, ...prev]); 
  };

  const addReview = (productId: number, rating: number, text: string, images: string[]) => { setProducts(prev => prev.map(p => p.id === productId ? { ...p, reviews: [{ id: Date.now(), user: user?.name || 'User', rating, text, date: 'Just now', images }, ...(p.reviews || [])] } : p)); };
  const updateUserSocials = (platform: 'facebook' | 'line' | 'google', connected: boolean, name: string) => { if (user) setUser({ ...user, socials: { ...user.socials!, [platform]: { connected, name } } }); };
  const updateUserSecurity = (type: 'password' | 'pin', value: string) => { if (user) setUser({ ...user, [type]: value }); };
  const addReferrer = (code: string): boolean => {
      if (code.toUpperCase() === "BOSS001") { setReferrer({ name: "System Admin", code: "BOSS001", tier: UserTier.EXECUTIVE, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=boss", phone: "02-123-4567", lineId: "@synergy.admin" }); return true; }
      return false;
  };
  const updateOrderAddress = (orderId: string, address: Address) => { setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, shippingAddress: address } : o)); };
  const updateProduct = (id: number, data: Partial<Product>) => { setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p)); };
  const deleteProduct = (id: number) => { setProducts(prev => prev.filter(p => p.id !== id)); };
  const addProduct = (product: Omit<Product, 'id'>) => { setProducts(prev => [{ ...product, id: Date.now() }, ...prev]); };
  const updateAd = (id: number, data: Partial<Ad>) => { setAds(prev => prev.map(a => a.id === id ? { ...a, ...data } : a)); };
  const deleteAd = (id: number) => { setAds(prev => prev.filter(a => a.id !== id)); };
  const addAd = (ad: Omit<Ad, 'id'>) => { setAds(prev => [...prev, { ...ad, id: Date.now() }]); };
  const updateCampaignAsset = (id: number, data: Partial<CampaignAsset>) => { setCampaignAssets(prev => prev.map(a => a.id === id ? { ...a, ...data } : a)); };
  const deleteCampaignAsset = (id: number) => { setCampaignAssets(prev => prev.filter(a => a.id !== id)); };
  const addCampaignAsset = (asset: Omit<CampaignAsset, 'id'>) => { setCampaignAssets(prev => [...prev, { ...asset, id: Date.now() }]); };
  const updateOnboardingSlide = (id: number, data: Partial<OnboardingSlide>) => { setOnboardingSlides(prev => prev.map(s => s.id === id ? { ...s, ...data } : s)); };
  const deleteOnboardingSlide = (id: number) => { setOnboardingSlides(prev => prev.filter(s => s.id !== id)); };
  const addOnboardingSlide = (slide: Omit<OnboardingSlide, 'id'>) => { setOnboardingSlides(prev => [...prev, { ...slide, id: Date.now() }]); };
  
  const deleteOrder = (orderId: string) => { setAllOrders(prev => prev.filter(o => o.id !== orderId)); };
  const updateCommissionStatus = (txId: number, status: CommissionTransaction['status']) => { setAllCommissions(prev => prev.map(c => c.id === txId ? { ...c, status } : c)); };
  const deleteCommission = (txId: number) => { setAllCommissions(prev => prev.filter(c => c.id !== txId)); };
  
  const deleteTeamMember = (id: number) => { setAllTeam(prev => prev.filter(m => m.id !== id)); };
  const updateMemberTier = (id: number, tier: UserTier) => { setAllTeam(prev => prev.map(m => m.id === id ? { ...m, tier } : m)); };
  const updateFeedStatus = (id: number, status: 'Approved' | 'Pending') => { setFeed(prev => prev.map(post => post.id === id ? { ...post, status } : post)); };
  const deleteFeedPost = (id: number) => { setFeed(prev => prev.filter(post => post.id !== id)); };
  
  const broadcastPromotion = (promo: Omit<Promotion, 'id' | 'active'>) => { 
    const newPromo = { ...promo, id: Date.now(), active: true };
    setActivePromo(newPromo);
    
    setAllNotifications(prev => [{
        id: Date.now(),
        userId: 'global',
        title: `🔥 Platform Event: ${promo.title}`,
        message: `A new promotion has just been launched! Tap to see the details and grab the best deals now.`,
        date: "Just now",
        type: 'promo',
        read: false,
        relatedType: 'promo',
        relatedData: JSON.stringify(promo) 
    }, ...prev]);
  };
  
  const dismissPromotion = () => { setActivePromo(null); };
  const updateSystemSettings = (data: Partial<SystemSettings>) => { setSystemSettings(prev => ({ ...prev, ...data })); };

  const t = (key: string): string => dictionary[key]?.[language] || key;

  return (
    <AppContext.Provider value={{
      user, isLoggedIn, cart, products, feed, ads, campaignAssets, onboardingSlides, team: userTeam, referrer, commissions: userCommissions, orders: userOrders, allOrders, allTeamMembers: allTeam, allCommissions, addresses, selectedAddressId, paymentMethod, appliedCoupon, bankAccounts, savedCards, selectedCardId, kycStatus, notifications: userNotifications, language, setLanguage, fontSize, setFontSize, t, login, logout, addToCart, removeFromCart, updateCartQuantity, checkout, calculateCommission, getNextTierTarget, getCommissionRate, addAddress, selectAddress, setPaymentMethod, applyCoupon, removeCoupon, getCartTotals, addBankAccount, removeBankAccount, addCreditCard, removeCreditCard, selectCreditCard, updateKycStatus, updateUserProfile, withdrawFunds, markNotificationAsRead, toggleFeedLike, addFeedComment, createPost, addReview, updateUserSocials, updateUserSecurity, addReferrer, updateOrderAddress, updateProduct, deleteProduct, addProduct, updateAd, deleteAd, addAd, updateCampaignAsset, deleteCampaignAsset, addCampaignAsset, updateOnboardingSlide, deleteOnboardingSlide, addOnboardingSlide, updateOrderStatus, deleteOrder, updateCommissionStatus, deleteCommission, deleteTeamMember, updateMemberTier, updateFeedStatus, deleteFeedPost, activePromo, broadcastPromotion, dismissPromotion, systemSettings, updateSystemSettings, isSearchActive, setIsSearchActive, currentToast, showToast, dismissToast, isSecurityUnlocked, setIsSecurityUnlocked, notificationsEnabled, setNotificationsEnabled, bottomNavHidden, setBottomNavHidden
    }}>
      {children}
    </AppContext.Provider>
  );
};