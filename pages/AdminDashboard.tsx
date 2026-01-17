import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Users, CreditCard, ShoppingBag, Wallet, Search, Filter, CheckCircle, Trash2, ChevronRight, X, ShieldAlert, Award, MapPin, Landmark, Phone, User, ExternalLink, Zap, Clock, Send, Camera, Sparkles, AlertCircle, Link as LinkIcon, Activity, ArrowUpRight, ArrowDownRight, Globe, Settings, Mail, MessageCircle, FileText, Shield, Image as ImageIcon, Printer, Play, Download, Banknote, QrCode, Loader2, CheckCircle2, History, ShieldCheck, Package, Megaphone, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { OrderStatus, UserTier, Order, CommissionTransaction, FeedItem } from '../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { allTeamMembers, allCommissions, allOrders, feed, activePromo, broadcastPromotion, dismissPromotion, updateOrderStatus, deleteOrder, updateCommissionStatus, deleteCommission, deleteTeamMember, updateMemberTier, updateFeedStatus, deleteFeedPost, systemSettings, updateSystemSettings, showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState<'Members' | 'Orders' | 'Withdrawals' | 'Posts' | 'Events' | 'Settings'>('Members');
  
  const [promoForm, setPromoForm] = useState({ title: 'Campaign', image: '', link: '' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<CommissionTransaction | null>(null);
  const [previewPost, setPreviewPost] = useState<FeedItem | null>(null);
  
  const [printingLabel, setPrintingLabel] = useState<Order | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Payment Verification States
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [isCheckingBank, setIsCheckingBank] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Helpers
  const parseWithdrawal = (source: string) => {
    if (!source || !source.includes('|')) return { name: 'Unknown', bank: 'Unknown', account: source || 'N/A' };
    const parts = source.replace('Withdrawal:', '').split('|');
    return {
        name: parts[0]?.trim() || 'N/A',
        bank: parts[1]?.trim() || 'N/A',
        account: parts[2]?.replace('ACC:', '').trim() || 'N/A'
    };
  };

  const withdrawals = useMemo(() => allCommissions.filter(c => c.type === 'Withdrawal'), [allCommissions]);
  const pendingWithdrawalsCount = useMemo(() => withdrawals.filter(w => w.status === 'Waiting').length, [withdrawals]);
  const pendingPostsCount = useMemo(() => feed.filter(p => p.status === 'Pending').length, [feed]);
  const awaitingPaymentCount = useMemo(() => allOrders.filter(o => o.status === 'Pending').length, [allOrders]);

  const totalMembers = allTeamMembers.length;
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((acc, o) => acc + o.total, 0);

  const filteredList = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    if (activeTab === 'Members') {
      return allTeamMembers.filter(m => {
        const matchesQuery = m.name.toLowerCase().includes(query) || m.id.toString().includes(query);
        const matchesStatus = statusFilter === 'All' || m.tier === statusFilter;
        return matchesQuery && matchesStatus;
      });
    }
    
    if (activeTab === 'Orders') {
      return allOrders.filter(o => {
        const matchesQuery = o.id.toLowerCase().includes(query) || o.shippingAddress.name.toLowerCase().includes(query) || o.shippingAddress.phone.includes(query);
        let matchesStatus = statusFilter === 'All' || o.status === statusFilter;
        return matchesQuery && matchesStatus;
      });
    }
    
    if (activeTab === 'Withdrawals') {
      return withdrawals.filter(w => {
        const matchesQuery = w.source.toLowerCase().includes(query) || w.id.toString().includes(query);
        const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
        return matchesQuery && matchesStatus;
      });
    }

    if (activeTab === 'Posts') {
        return feed.filter(p => {
            const matchesQuery = p.user.toLowerCase().includes(query) || p.caption.toLowerCase().includes(query);
            const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
            return matchesQuery && matchesStatus;
        }).sort((a, b) => (a.status === 'Pending' ? -1 : 1));
    }
    
    return [];
  }, [activeTab, searchQuery, statusFilter, allTeamMembers, allOrders, withdrawals, feed]);

  const filterOptions = useMemo(() => {
    if (activeTab === 'Members') return ['All', 'Starter', 'Marketer', 'Builder', 'Executive'];
    if (activeTab === 'Orders') return ['All', 'Pending', 'To Ship', 'Shipped', 'Delivered'];
    if (activeTab === 'Withdrawals') return ['All', 'Waiting', 'Completed'];
    if (activeTab === 'Posts') return ['All', 'Pending', 'Approved'];
    return ['All'];
  }, [activeTab]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateSystemSettings({ logo: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleContactLinkUpdate = (key: string, value: string) => {
    updateSystemSettings({
        contactLinks: {
            ...systemSettings.contactLinks,
            [key]: value
        }
    });
  };

  const handleOpenVerifyPayment = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setVerifyingOrder(order);
    setVerificationSuccess(false);
    setIsCheckingBank(false);
  };

  const startVerificationProcess = () => {
    setIsCheckingBank(true);
    setTimeout(() => {
        setIsCheckingBank(false);
        setVerificationSuccess(true);
        setTimeout(() => {
            if (verifyingOrder) {
                updateOrderStatus(verifyingOrder.id, 'To Ship');
                setPrintingLabel(verifyingOrder);
                setVerifyingOrder(null);
            }
        }, 1500);
    }, 2800);
  };

  const handleConfirmPayment = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(`Manually override payment verification for Order #${id}?`)) {
        updateOrderStatus(id, 'To Ship');
        const order = allOrders.find(o => o.id === id);
        if (order) setPrintingLabel(order);
    }
  };

  const handleUpdateOrder = (e: React.MouseEvent, id: string, currentStatus: OrderStatus) => {
      e.stopPropagation();
      let next: OrderStatus = 'Pending';
      if (currentStatus === 'Pending') next = 'To Ship';
      else if (currentStatus === 'To Ship') next = 'Shipped';
      else if (currentStatus === 'Shipped') next = 'Delivered';
      
      if (next !== currentStatus) {
          updateOrderStatus(id, next);
          if (next === 'To Ship') {
              const order = allOrders.find(o => o.id === id);
              if (order) setPrintingLabel(order);
          }
      }
  };

  const handleDeleteOrder = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("Permanently delete this order from records?")) {
          deleteOrder(id);
          if (selectedOrder?.id === id) setSelectedOrder(null);
      }
  };

  const handleApproveWithdrawal = (id: number) => {
      updateCommissionStatus(id, 'Completed');
      setSelectedWithdrawal(null);
  };

  const handleRejectWithdrawal = (id: number) => {
      if (window.confirm("Mark this withdrawal as Pending?")) {
          updateCommissionStatus(id, 'Waiting');
          setSelectedWithdrawal(null);
      }
  };

  const handleDeleteWithdrawal = (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if (window.confirm("Permanently delete this withdrawal record?")) {
          deleteCommission(id);
          if (selectedWithdrawal?.id === id) setSelectedWithdrawal(null);
      }
  };

  const handleDeleteMember = (id: number) => {
      if (window.confirm("Permanently delete this member?")) {
          deleteTeamMember(id);
      }
  };

  const handleToggleTier = (id: number, currentTier: UserTier) => {
      const tiers = [UserTier.STARTER, UserTier.MARKETER, UserTier.BUILDER, UserTier.EXECUTIVE];
      const currentIndex = tiers.indexOf(currentTier);
      const nextIndex = (currentIndex + 1) % tiers.length;
      updateMemberTier(id, tiers[nextIndex]);
  };

  const handleApprovePost = (id: number) => {
      updateFeedStatus(id, 'Approved');
  };

  const handleDeletePost = (id: number) => {
      if (window.confirm("Delete this content post?")) {
          deleteFeedPost(id);
      }
  };

  const handlePromoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPromoForm(prev => ({ ...prev, image: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleBroadcast = () => {
      if (!promoForm.image) {
          alert("Please upload a promo image.");
          return;
      }
      setIsBroadcasting(true);
      setTimeout(() => {
          broadcastPromotion(promoForm);
          setIsBroadcasting(false);
          alert("Full-screen broadcast sent to all active sessions.");
      }, 800);
  };

  const handleToastBroadcast = () => {
      if (!promoForm.image) {
          alert("Please upload a promo image.");
          return;
      }
      showToast({
          title: promoForm.title || "Exclusive Offer!",
          amount: 0,
          user: "Platform Broadcaster",
          type: 'promo',
          image: promoForm.image,
          description: "Click to see exclusive promotional details and deals!",
          link: promoForm.link
      });
      alert("Floating Toast Broadcast sent successfully!");
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) setSearchQuery('');
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-400">
            <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-black ml-2 text-gray-900 dark:text-white tracking-tight">Admin System</h1>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">System Live</span>
        </div>
      </div>

      {/* DASHBOARD STATS: 2 COLUMN GRID */}
      <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Revenue Stat (Linked to Orders) */}
          <div 
            onClick={() => setActiveTab('Orders')}
            className="bg-white dark:bg-gray-800 p-5 rounded-[28px] shadow-sm border border-transparent dark:border-gray-700 relative overflow-hidden group cursor-pointer active:scale-[0.97] transition-all"
          >
              <div className="absolute top-0 right-0 w-16 h-16 bg-synergy-blue/5 rounded-bl-[40px] group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-synergy-blue border border-blue-100/50 mb-3">
                      <Wallet size={18} />
                  </div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">GMV Revenue</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5 tracking-tighter">฿{totalRevenue.toLocaleString()}</p>
              </div>
          </div>

          {/* Members Stat */}
          <div 
            onClick={() => setActiveTab('Members')}
            className="bg-white dark:bg-gray-800 p-5 rounded-[28px] shadow-sm border border-transparent dark:border-gray-700 cursor-pointer active:scale-[0.97] transition-all"
          >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 mb-3">
                  <Users size={18} />
              </div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Active Users</p>
              <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{totalMembers.toLocaleString()}</p>
          </div>

          {/* Orders Stat */}
          <div 
            onClick={() => setActiveTab('Orders')}
            className="bg-white dark:bg-gray-800 p-5 rounded-[28px] shadow-sm border border-transparent dark:border-gray-700 cursor-pointer active:scale-[0.97] transition-all"
          >
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 mb-3">
                  <ShoppingBag size={18} />
              </div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Total Orders</p>
              <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{totalOrders.toLocaleString()}</p>
          </div>

          {/* Payout Task Stat */}
          <div 
            onClick={() => setActiveTab('Withdrawals')}
            className={`p-5 rounded-[28px] shadow-sm border transition-all cursor-pointer active:scale-[0.97] ${pendingWithdrawalsCount > 0 ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/40 shadow-[0_8px_30px_rgb(239,68,68,0.1)]' : 'bg-white dark:bg-gray-800 border-transparent'}`}
          >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${pendingWithdrawalsCount > 0 ? 'bg-red-100 text-red-600 shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
                  <CreditCard size={18} />
              </div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Payout Tasks</p>
              <div className="flex items-center justify-between mt-0.5">
                <p className={`text-xl font-black ${pendingWithdrawalsCount > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{pendingWithdrawalsCount}</p>
                {pendingWithdrawalsCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
              </div>
          </div>

          {/* Content Review Stat */}
          <div 
            onClick={() => setActiveTab('Posts')}
            className={`p-5 rounded-[28px] shadow-sm border transition-all cursor-pointer active:scale-[0.97] ${pendingPostsCount > 0 ? 'bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/40 shadow-[0_8px_30px_rgb(168,85,247,0.1)]' : 'bg-white dark:bg-gray-800 border-transparent'}`}
          >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${pendingPostsCount > 0 ? 'bg-purple-100 text-purple-600 shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
                  <Sparkles size={18} />
              </div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Post Reviews</p>
              <div className="flex items-center justify-between mt-0.5">
                <p className={`text-xl font-black ${pendingPostsCount > 0 ? 'text-purple-600' : 'text-gray-900 dark:text-white'}`}>{pendingPostsCount}</p>
                {pendingPostsCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>}
              </div>
          </div>
      </div>

      <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-[24px] mb-6 shadow-soft dark:shadow-none border border-transparent dark:border-gray-700 overflow-x-auto no-scrollbar">
        {['Members', 'Orders', 'Withdrawals', 'Posts', 'Events', 'Settings'].map((t) => (
          <button 
            key={t}
            onClick={() => {
                setActiveTab(t as any);
                setStatusFilter('All');
                setSearchQuery('');
            }}
            className={`flex-1 min-w-[90px] py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${activeTab === t ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
          >
            {t === 'Posts' && pendingPostsCount > 0 ? `Posts (${pendingPostsCount})` : t}
          </button>
        ))}
      </div>

      {activeTab === 'Settings' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-soft dark:shadow-none border border-transparent dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-500">
                          <ImageIcon size={20} />
                      </div>
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Platform Branding</h3>
                  </div>

                  <div className="flex flex-col items-center">
                      <div 
                        onClick={() => document.getElementById('logo-input')?.click()}
                        className="w-28 h-28 rounded-[24px] bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition group overflow-hidden relative shadow-inner"
                      >
                          {systemSettings.logo ? (
                              <>
                                <img src={systemSettings.logo} className="w-full h-full object-contain p-4" alt="Logo" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                    <Camera size={28} className="text-white" />
                                </div>
                              </>
                          ) : (
                              <div className="text-center text-gray-300 group-hover:text-indigo-500 transition">
                                  <Camera size={32} className="mx-auto" />
                                  <span className="text-[8px] font-black uppercase mt-2 block tracking-widest">Select Logo</span>
                              </div>
                          )}
                          <input id="logo-input" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-4 text-center font-medium uppercase tracking-tighter">Preferred: Square SVG or Transparent PNG</p>
                      {systemSettings.logo && (
                          <button onClick={() => updateSystemSettings({ logo: null })} className="mt-3 text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest transition">Reset Default</button>
                      )}
                  </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-soft dark:shadow-none border border-transparent dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-500">
                          <Globe size={20} />
                      </div>
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Official Channels</h3>
                  </div>

                  <div className="space-y-5">
                      {[
                        { key: 'line', icon: MessageCircle, label: 'Line Support Channel', placeholder: 'Ex. @synergyflow' },
                        { key: 'phone', icon: Phone, label: 'Helpline Contact', placeholder: 'Ex. +66 2 123 4567' },
                        { key: 'email', icon: Mail, label: 'Official Email Registry', placeholder: 'support@synergy.com' },
                        { key: 'website', icon: Globe, label: 'Main Digital Landing', placeholder: 'https://synergyflow.app' },
                        { key: 'terms', icon: FileText, label: 'Compliance Terms URL', placeholder: 'https://...' },
                        { key: 'privacy', icon: Shield, label: 'Security Policy URL', placeholder: 'https://...' },
                      ].map((item) => (
                        <div key={item.key} className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{item.label}</label>
                            <div className="relative group">
                                <item.icon className="absolute left-4 top-3.5 text-gray-300 group-focus-within:text-synergy-blue transition-colors" size={16} />
                                <input 
                                    defaultValue={systemSettings.contactLinks[item.key as keyof typeof systemSettings.contactLinks]}
                                    onBlur={(e) => handleContactLinkUpdate(item.key, e.target.value)}
                                    placeholder={item.placeholder}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-3.5 pl-11 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-synergy-blue/10 dark:text-white font-bold transition-all shadow-inner"
                                />
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
          </div>
      ) : activeTab === 'Events' ? (
          <div className="bg-transparent animate-in fade-in duration-500 space-y-6">
              <div className="flex items-center space-x-3 mb-2 px-2">
                  <div className="w-11 h-11 bg-indigo-100 dark:bg-indigo-900/40 rounded-[18px] flex items-center justify-center text-indigo-600 shadow-sm border border-white dark:border-gray-700">
                      <Sparkles size={22} fill="currentColor" />
                  </div>
                  <div>
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-lg">Broadcast Hub</h3>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] italic">Push Global Engagement</p>
                  </div>
              </div>

              <div className="space-y-6">
                  <div 
                    onClick={() => document.getElementById('promo-input')?.click()}
                    className={`w-full h-56 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 relative overflow-hidden shadow-soft ${promoForm.image ? 'border-transparent bg-gray-900' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-synergy-blue'}`}
                  >
                      {promoForm.image ? (
                          <>
                            <img src={promoForm.image} className="w-full h-full object-cover opacity-80" alt="Promo Preview" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                <p className="text-white font-black uppercase text-xs tracking-widest flex items-center space-x-2"><ImageIcon size={14}/> <span>Update Visual</span></p>
                            </div>
                          </>
                      ) : (
                          <div className="text-center text-gray-300 space-y-3">
                              <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto shadow-inner"><Camera size={28} /></div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Upload Campaign Banner</p>
                          </div>
                      )}
                      <input id="promo-input" type="file" className="hidden" accept="image/*" onChange={handlePromoFileChange} />
                  </div>

                  <div className="space-y-5 px-1">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Broadcast Headline</label>
                          <input 
                            placeholder="Enter Promo Title"
                            value={promoForm.title}
                            onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                            className="w-full bg-white dark:bg-gray-800 border border-transparent shadow-soft rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-synergy-blue/10 dark:text-white font-black transition-all"
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Redirect Logic (Product ID)</label>
                          <div className="relative group">
                              <LinkIcon className="absolute left-4 top-4 text-gray-300 group-focus-within:text-synergy-blue transition-colors" size={18} />
                              <input 
                                placeholder="Enter Numeric ID (Ex. 1)"
                                value={promoForm.link}
                                onChange={(e) => setPromoForm({ ...promoForm, link: e.target.value })}
                                className="w-full bg-white dark:bg-gray-800 border border-transparent shadow-soft rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-synergy-blue/10 dark:text-white font-black tracking-widest transition-all"
                              />
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleToastBroadcast}
                        disabled={isBroadcasting || !promoForm.image}
                        className="h-16 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-soft flex items-center justify-center space-x-2 active:scale-95 transition-all border border-gray-100 dark:border-gray-700 disabled:opacity-50"
                      >
                        <Megaphone size={18} className="text-amber-500" />
                        <span>Push to Toast</span>
                      </button>
                      
                      {activePromo ? (
                          <button 
                            onClick={dismissPromotion}
                            className="h-16 bg-red-50 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                          >
                            Terminate Pop-up
                          </button>
                      ) : (
                        <button 
                            onClick={handleBroadcast}
                            disabled={isBroadcasting || !promoForm.image}
                            className={`h-16 bg-synergy-blue text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-glow flex items-center justify-center space-x-2 active:scale-[0.98] transition-all ${(!promoForm.image || isBroadcasting) ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                        >
                            {isBroadcasting ? <Loader2 size={18} className="animate-spin" /> : <><Play size={18} fill="currentColor" /><span>Push Pop-up</span></>}
                        </button>
                      )}
                  </div>
              </div>
          </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-soft dark:shadow-none border border-transparent dark:border-gray-700 transition-all">
            <div className="flex justify-between items-center mb-5 px-1">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] text-xs">
                    {activeTab === 'Posts' ? 'Compliance Queue' : `Registry: ${activeTab}`}
                </h3>
                <div className="flex space-x-2">
                    <button 
                      onClick={toggleSearch}
                      className={`p-2 rounded-xl transition-all ${showSearch ? 'bg-synergy-blue text-white shadow-glow' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 shadow-inner'}`}
                    >
                      {showSearch ? <X size={16} /> : <Search size={16} />}
                    </button>
                </div>
            </div>

            {showSearch && (
                <div className="mb-5 animate-in slide-in-from-top-3 duration-300">
                    <input 
                      autoFocus
                      placeholder={`Search in ${activeTab.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-synergy-blue/10 dark:text-white shadow-inner"
                    />
                </div>
            )}

            <div className="flex space-x-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                {filterOptions.map(option => (
                    <button 
                    key={option}
                    onClick={() => setStatusFilter(option)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === option ? 'bg-synergy-blue/10 text-synergy-blue dark:bg-blue-900/40 dark:text-blue-400 ring-1 ring-inset ring-synergy-blue/20' : 'bg-gray-50 dark:bg-gray-900 text-gray-400'}`}
                    >
                    {option}
                    </button>
                ))}
            </div>

            {filteredList.length === 0 ? (
                <div className="text-center py-16 animate-in fade-in">
                    <Activity size={48} className="mx-auto text-gray-100 dark:text-gray-800 mb-4" />
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Data Reservoir Empty</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredList.map((item: any) => {
                        if (activeTab === 'Posts') {
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => setPreviewPost(item)}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-synergy-blue/30 transition-all cursor-pointer active:opacity-70 animate-in slide-in-from-bottom-1"
                                >
                                    <div className="flex items-center space-x-4 min-w-0">
                                        <div className="w-12 h-12 bg-black rounded-xl overflow-hidden shrink-0 relative">
                                            {item.type === 'video' ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Play size={16} className="text-white/80" fill="white" />
                                                </div>
                                            ) : (
                                                <img src={item.content} className="w-full h-full object-cover" alt="thumb" />
                                            )}
                                            <div className="absolute inset-0 bg-black/10"></div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <img src={item.avatar} className="w-4 h-4 rounded-full border border-white" alt="av" />
                                                <p className="text-xs font-black text-gray-900 dark:text-white truncate">{item.user}</p>
                                                <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md ${item.status === 'Pending' ? 'bg-amber-400 text-white' : 'bg-emerald-500 text-white'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5 font-medium italic">"{item.caption}"</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 shrink-0">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-400">
                                            <Eye size={16} />
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeletePost(item.id); }}
                                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition active:scale-90"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        if (activeTab === 'Members') {
                            return (
                              <div key={item.id} className="flex items-center justify-between pb-5 border-b border-gray-50 dark:border-gray-700 last:border-0 last:pb-0 animate-in fade-in duration-300">
                                  <div className="flex items-center space-x-4 min-w-0">
                                      <div className="relative group">
                                          <img src={item.avatar} className="w-11 h-11 rounded-2xl object-cover border border-gray-100 dark:border-gray-700 shadow-sm transition-transform group-hover:scale-105" alt="Avatar" />
                                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-[8px] font-black ${item.tier === UserTier.EXECUTIVE ? 'bg-amber-500' : 'bg-synergy-blue'}`}>
                                              {item.tier[0]}
                                          </div>
                                      </div>
                                      <div className="min-w-0">
                                          <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">{item.name}</p>
                                          <button 
                                              onClick={() => handleToggleTier(item.id, item.tier)}
                                              className="text-[9px] text-synergy-blue font-black uppercase tracking-widest flex items-center mt-1 hover:underline active:opacity-50 transition-all"
                                          >
                                              <Zap size={10} className="mr-1" fill="currentColor" />
                                              {item.tier} Rank
                                          </button>
                                      </div>
                                  </div>
                                  <div className="text-right flex items-center space-x-5">
                                      <div>
                                          <p className="text-xs font-black text-gray-900 dark:text-white tracking-tighter">฿{item.totalSales.toLocaleString()}</p>
                                          <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Revenue</p>
                                      </div>
                                      <button onClick={() => handleDeleteMember(item.id)} className="p-2.5 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 transition shadow-sm active:scale-90"><Trash2 size={16} /></button>
                                  </div>
                              </div>
                            );
                        }
                        
                        if (activeTab === 'Orders') {
                            return (
                              <div key={item.id} onClick={() => setSelectedOrder(item)} className="flex items-center justify-between pb-5 border-b border-gray-50 dark:border-gray-700 last:border-0 last:pb-0 cursor-pointer active:opacity-70 transition-all duration-300">
                                  <div className="flex items-center space-x-4 min-w-0">
                                      <div className={`w-11 h-11 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm border transition-all ${item.status === 'Pending' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 border-emerald-100/50' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 border-gray-100/50'}`}>
                                          {item.status === 'Pending' ? <QrCode size={20} /> : <ShoppingBag size={20} />}
                                      </div>
                                      <div className="min-w-0">
                                          <div className="flex items-center space-x-2">
                                              <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">{item.shippingAddress.name}</p>
                                              <span className="text-[9px] bg-gray-50 dark:bg-gray-900 text-gray-400 px-1.5 py-0.5 rounded-lg border border-gray-100 dark:border-gray-700 font-black uppercase">{item.shippingAddress.phone.slice(-4)}</span>
                                          </div>
                                          <p className="text-[10px] text-gray-400 font-mono tracking-tighter mt-0.5">ORD_{item.id.replace('SF-','')}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center space-x-2 shrink-0">
                                      <div className="text-right mr-3">
                                          <p className="text-xs font-black text-gray-900 dark:text-white">฿{item.total.toLocaleString()}</p>
                                          <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${item.status === 'Delivered' ? 'text-emerald-500' : item.status === 'Pending' ? 'text-amber-500 font-black animate-pulse' : 'text-synergy-blue'}`}>{item.status === 'Pending' ? 'AUDIT REQ' : item.status}</p>
                                      </div>
                                      <div className="flex items-center space-x-1.5">
                                        {item.status === 'Pending' && (
                                            <button onClick={(e) => handleOpenVerifyPayment(e, item)} title="Verify Funds" className="p-2.5 text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition shadow-glow active:scale-90">
                                                <ShieldCheck size={18} />
                                            </button>
                                        )}
                                        {item.status !== 'Pending' && <button onClick={(e) => handleUpdateOrder(e, item.id, item.status)} className="p-2.5 text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 transition border border-transparent dark:border-gray-700 active:scale-90"><ChevronRight size={18} /></button>}
                                        <button onClick={(e) => handleDeleteOrder(e as any, item.id)} className="p-2.5 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition border border-transparent active:scale-90"><Trash2 size={18} /></button>
                                      </div>
                                  </div>
                              </div>
                            );
                        }
                        
                        if (activeTab === 'Withdrawals') {
                            const withdrawalInfo = parseWithdrawal(item.source);
                            return (
                              <div key={item.id} onClick={() => setSelectedWithdrawal(item)} className="flex items-center justify-between pb-5 border-b border-gray-50 dark:border-gray-700 last:border-0 last:pb-0 cursor-pointer active:opacity-70 transition-all duration-300">
                                  <div className="flex items-center space-x-4 min-w-0">
                                      <div className={`w-11 h-11 rounded-[18px] flex items-center justify-center shrink-0 border transition-all ${item.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-amber-50 border-amber-100 text-amber-500 shadow-sm'}`}>
                                          <CreditCard size={20} />
                                      </div>
                                      <div className="min-w-0">
                                          <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight">{withdrawalInfo.name}</p>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{item.status} • TXN_{item.id}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center space-x-3 shrink-0">
                                      <div className="text-right mr-2">
                                        <span className="text-sm font-black text-red-500 block tracking-tight">-฿{Math.abs(item.amount).toLocaleString()}</span>
                                        <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest">{withdrawalInfo.bank.slice(0,10)}</span>
                                      </div>
                                      <button onClick={(e) => handleDeleteWithdrawal(e as any, item.id)} className="p-2.5 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition active:scale-90"><Trash2 size={18} /></button>
                                  </div>
                              </div>
                            );
                        }
                        return null;
                    })}
                </div>
            )}
        </div>
      )}

      {/* PAYMENT VERIFICATION MODAL - ENHANCED VISIBILITY VERSION */}
      {verifyingOrder && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-900 w-full max-w-[320px] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 relative flex flex-col border border-white/20">
                  {verificationSuccess && (
                      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center animate-in fade-in duration-500">
                          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3 shadow-sm animate-bounce">
                              <CheckCircle2 size={32} strokeWidth={3} />
                          </div>
                          <h2 className="text-base font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Verification Success</h2>
                          <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Order Dispatch Authorized</p>
                      </div>
                  )}
                  <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center space-x-2">
                          <ShieldCheck size={16} className="text-synergy-blue" />
                          <h3 className="font-black text-gray-900 dark:text-white text-[10px] uppercase tracking-widest">Payment Audit</h3>
                      </div>
                      {!isCheckingBank && !verificationSuccess && (
                          <button onClick={() => setVerifyingOrder(null)} className="text-gray-300 hover:text-gray-500 transition active:scale-90"><X size={20} /></button>
                      )}
                  </div>
                  <div className="p-8 text-center flex-1">
                      <div className="mb-6">
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Settlement Magnitude</p>
                          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">฿{verifyingOrder.total.toLocaleString()}</h2>
                      </div>
                      
                      {/* TRANSACTION DETAILS AREA - LARGE TEXT VERSION */}
                      <div className="bg-gray-50 dark:bg-gray-950/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 text-left mb-8 space-y-6 shadow-inner">
                          <div className="flex items-center space-x-4">
                              <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-synergy-blue shrink-0 border border-blue-200 dark:border-blue-800">
                                  <QrCode size={24} />
                              </div>
                              <div className="flex flex-col">
                                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Method</p>
                                  <p className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest leading-none">PromptPay</p>
                              </div>
                          </div>
                          <div className="flex items-center space-x-4">
                              <div className="w-11 h-11 rounded-2xl bg-gray-200/50 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0 border border-gray-200 dark:border-gray-700">
                                  <FileText size={24} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Transaction ID</p>
                                  <p className="text-lg font-black text-gray-800 dark:text-gray-100 font-mono tracking-wider truncate leading-none uppercase">TXN_{verifyingOrder.id.replace('SF-','')}</p>
                              </div>
                          </div>
                      </div>

                      {isCheckingBank ? (
                          <div className="flex flex-col items-center space-y-3 py-4">
                              <div className="relative">
                                  <Loader2 size={48} className="text-synergy-blue animate-spin" strokeWidth={2.5} />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <Shield size={16} className="text-synergy-blue animate-pulse" />
                                  </div>
                              </div>
                              <div className="text-center">
                                  <p className="text-[10px] font-black text-synergy-blue uppercase tracking-[0.2em] animate-pulse">Handshaking Gateway...</p>
                                  <p className="text-[7px] text-gray-400 uppercase font-bold mt-1">Cross-referencing bank ledger</p>
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-3">
                              <button onClick={startVerificationProcess} className="w-full h-16 bg-emerald-500 text-white rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] shadow-glow shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-3">
                                  <ShieldCheck size={20} />
                                  <span>Execute Verification</span>
                              </button>
                              <button onClick={(e) => { handleConfirmPayment(e as any, verifyingOrder.id); setVerifyingOrder(null); }} className="w-full py-2.5 text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest text-[8px] hover:text-emerald-500 transition-all border border-transparent hover:border-emerald-500/20 rounded-xl">
                                  Manual Settlement Override
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 border border-white/10">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs flex items-center"><ShoppingBag size={18} className="mr-3 text-synergy-blue" /> Registry {selectedOrder.id}</h3>
                      <button onClick={() => setSelectedOrder(null)} className="text-gray-300 hover:text-gray-500 transition"><X size={24} /></button>
                  </div>
                  <div className="p-7 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                      <div className="space-y-6">
                          <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-gray-400 shadow-inner"><User size={20} /></div>
                              <div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Account Identification</p>
                                  <p className="text-xs font-black text-gray-900 dark:text-white">{selectedOrder.userId}</p>
                              </div>
                          </div>
                          <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-synergy-blue shadow-inner shrink-0 mt-0.5"><MapPin size={20} /></div>
                              <div>
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Logistics Destination</p>
                                  <p className="text-xs font-black text-gray-900 dark:text-white">{selectedOrder.shippingAddress.name} ({selectedOrder.shippingAddress.phone})</p>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5 font-medium italic">
                                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zip}
                                  </p>
                              </div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[28px] p-5 shadow-inner border border-gray-100 dark:border-gray-800">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center"><Package size={12} className="mr-2" /> SKU Breakdown</p>
                              <div className="space-y-3">
                                  {selectedOrder.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-[11px] mb-2 last:mb-0">
                                          <span className="text-gray-700 dark:text-gray-300 font-black uppercase tracking-tight">{item.name} <span className="text-synergy-blue font-bold ml-1">x{item.quantity}</span></span>
                                          <span className="font-black text-gray-900 dark:text-white">฿{(item.price * item.quantity).toLocaleString()}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                      <div className="space-y-3">
                        {selectedOrder.status === 'Pending' && (
                            <button onClick={(e) => { handleOpenVerifyPayment(e as any, selectedOrder); setSelectedOrder(null); }} className="w-full h-16 rounded-[24px] font-black text-white bg-emerald-500 shadow-glow shadow-emerald-500/30 transition-all flex items-center justify-center space-x-3 active:scale-95 uppercase tracking-[0.2em] text-xs">
                                <Banknote size={20} />
                                <span>Validate Payment</span>
                            </button>
                        )}
                        <button onClick={(e) => { handleUpdateOrder(e as any, selectedOrder.id, selectedOrder.status); setSelectedOrder(null); }} className={`w-full h-16 rounded-[24px] font-black text-white shadow-xl transition-all flex items-center justify-center space-x-3 active:scale-95 uppercase tracking-[0.2em] text-xs ${selectedOrder.status === 'Delivered' ? 'bg-emerald-50' : 'bg-gray-900 dark:bg-white dark:text-gray-900'}`}>
                            {selectedOrder.status === 'Pending' && <span>Dispatch Order</span>}
                            {selectedOrder.status === 'To Ship' && <span>Verify Shipped</span>}
                            {selectedOrder.status === 'Shipped' && <span>Confirm Delivery</span>}
                            {selectedOrder.status === 'Delivered' && <><CheckCircle2 size={20} /><span>Completed</span></>}
                        </button>
                        <button onClick={(e) => handleDeleteOrder(e as any, selectedOrder.id)} className="w-full py-4 text-red-500 font-black flex items-center justify-center space-x-2 text-[10px] uppercase tracking-[0.3em] hover:opacity-70 transition-opacity">
                            <Trash2 size={16} />
                            <span>Purge Registry Record</span>
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {selectedWithdrawal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-800 w-full max-sm rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 border border-white/10">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs flex items-center"><ExternalLink size={18} className="mr-3 text-synergy-blue" /> Payout Analytics</h3>
                      <button onClick={() => setSelectedWithdrawal(null)} className="text-gray-300 hover:text-gray-500 transition active:scale-90"><X size={24} /></button>
                  </div>
                  <div className="p-8 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Disbursement Magnitude</p>
                      <h2 className="text-4xl font-black text-red-500 mb-10 tracking-tighter">฿{Math.abs(selectedWithdrawal.amount).toLocaleString()}</h2>
                      <div className="flex items-start space-x-4 bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-[28px] border border-blue-100 dark:border-blue-900/30 text-left mb-10 shadow-inner">
                          <Landmark size={24} className="text-synergy-blue shrink-0 mt-1" />
                          <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Target Destination</p>
                              {(() => {
                                  const info = parseWithdrawal(selectedWithdrawal.source);
                                  return (
                                      <>
                                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{info.bank}</p>
                                          <p className="text-lg font-mono font-black text-synergy-blue mt-1 tracking-widest">{info.account.replace(/.(?=.{4})/g, '*')}</p>
                                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 font-bold uppercase tracking-widest">Holder: {info.name}</p>
                                      </>
                                  );
                              })()}
                          </div>
                      </div>
                      <div className="space-y-4">
                        {selectedWithdrawal.status === 'Waiting' ? (
                            <div className="flex space-x-3">
                                <button onClick={() => handleRejectWithdrawal(selectedWithdrawal.id)} className="flex-1 h-14 bg-gray-100 dark:bg-gray-700 text-gray-500 font-black rounded-2xl active:scale-95 transition text-[10px] uppercase tracking-widest">Hold</button>
                                <button onClick={() => handleApproveWithdrawal(selectedWithdrawal.id)} className="flex-[2] h-14 bg-emerald-500 text-white font-black rounded-2xl shadow-glow shadow-emerald-500/20 active:scale-95 transition text-[10px] uppercase tracking-widest">Authorize Bank</button>
                            </div>
                        ) : (
                            <div className="h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-[24px] flex items-center justify-center font-black space-x-3 border border-emerald-100 dark:border-emerald-800 transition-all uppercase tracking-[0.2em] text-[10px]">
                                <ShieldCheck size={20} />
                                <span>Transfer Validated</span>
                            </div>
                        )}
                        <button onClick={(e) => handleDeleteWithdrawal(e as any, selectedWithdrawal.id)} className="w-full py-3 text-red-500 font-black flex items-center justify-center space-x-2 text-[10px] uppercase tracking-[0.3em] hover:opacity-70 transition-opacity">
                            <Trash2 size={16} />
                            <span>Purge Analytics Log</span>
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* POST COMPLIANCE DETAIL MODAL - COMPACT FEED STYLE */}
      {previewPost && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setPreviewPost(null)}>
              <div className="bg-white dark:bg-gray-900 w-full max-w-[320px] rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 relative flex flex-col border border-white/10 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
                  {/* Compact Header */}
                  <div className="p-3.5 flex justify-between items-center bg-white dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800">
                      <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-synergy-blue to-purple-500 shrink-0">
                            <img src={previewPost.avatar} className="w-full h-full rounded-full border border-white dark:border-gray-900 object-cover" alt="av" />
                          </div>
                          <div className="min-w-0">
                              <p className="text-[11px] font-black text-gray-900 dark:text-white leading-tight truncate">{previewPost.user}</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">Review Content</p>
                          </div>
                      </div>
                      <button onClick={() => setPreviewPost(null)} className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-red-500 transition active:scale-90"><X size={16}/></button>
                  </div>

                  {/* Visual Preview */}
                  <div className="w-full aspect-square bg-black flex items-center justify-center relative overflow-hidden">
                      {previewPost.type === 'video' ? (
                          <video src={previewPost.content} controls className="w-full h-full object-cover" />
                      ) : (
                          <img src={previewPost.content} className="w-full h-full object-cover" alt="post" />
                      )}
                  </div>

                  {/* Content Info */}
                  <div className="p-4 bg-white dark:bg-gray-900">
                      <div className="mb-4">
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium line-clamp-3 italic">
                              "{previewPost.caption}"
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                             <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm ${previewPost.status === 'Pending' ? 'bg-amber-400 text-white' : 'bg-emerald-500 text-white'}`}>{previewPost.status}</span>
                             {previewPost.mood && <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest opacity-60">Tone: {previewPost.mood}</span>}
                          </div>
                      </div>

                      {/* Decisive Actions */}
                      <div className="flex space-x-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                          {previewPost.status === 'Pending' && (
                              <button 
                                onClick={() => { handleApprovePost(previewPost.id); setPreviewPost(null); }}
                                className="flex-[2] h-11 bg-synergy-blue text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-glow active:scale-95 transition flex items-center justify-center space-x-1.5"
                              >
                                <CheckCircle size={14} />
                                <span>Approve</span>
                              </button>
                          )}
                          <button 
                            onClick={() => { handleDeletePost(previewPost.id); setPreviewPost(null); }}
                            className="flex-1 h-11 bg-red-50 text-red-500 rounded-xl font-black uppercase text-[9px] tracking-widest border border-red-100 dark:border-red-900/20 active:scale-95 transition flex items-center justify-center space-x-1.5"
                          >
                            <Trash2 size={14} />
                            <span>Discard</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};