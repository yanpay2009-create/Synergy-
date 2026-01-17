
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Edit3, 
  X, 
  Save, 
  Copy, 
  Check, 
  Loader2, 
  Phone, 
  Box, 
  Calendar, 
  ShoppingBag,
  Navigation,
  ExternalLink,
  ChevronRight,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Order, Address } from '../types';

export const MyOrders: React.FC = () => {
  const { orders, updateOrderAddress } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'To Ship' | 'Shipped' | 'Delivered'>('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);
  
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<Address | null>(null);

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => activeTab === 'Shipped' ? (o.status === 'Shipped' || o.status === 'To Ship') : o.status === activeTab);

  const toggleExpand = (id: string) => {
    if (expandedOrder === id) setExpandedOrder(null);
    else setExpandedOrder(id);
  };

  const handleTrackOrder = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (expandedOrder === id) {
          setExpandedOrder(null);
          return;
      }
      
      setTrackingLoading(id);
      setTimeout(() => {
          setTrackingLoading(null);
          setExpandedOrder(id);
      }, 600);
  };

  const handleCopyText = (e: React.MouseEvent, text: string, id: string) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
        case 'Pending': return { color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400', label: 'Processing', step: 1 };
        case 'To Ship': return { color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', label: 'To Ship', step: 2 };
        case 'Shipped': return { color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400', label: 'Shipped', step: 3 };
        case 'Delivered': return { color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', label: 'Completed', step: 4 };
        default: return { color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', label: status, step: 0 };
    }
  };

  const handleStartEdit = (e: React.MouseEvent, order: Order) => {
      e.stopPropagation();
      setEditingOrder(order);
      setEditForm({ ...order.shippingAddress });
  };

  const handleSaveAddress = () => {
      if (editingOrder && editForm) {
          updateOrderAddress(editingOrder.id, editForm);
          setEditingOrder(null);
          setEditForm(null);
      }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-1.5 -ml-1 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-full transition shadow-sm">
            <ArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-black ml-2 text-gray-900 dark:text-white tracking-tight">My Orders</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-synergy-blue/10 flex items-center justify-center text-synergy-blue">
            <ShoppingBag size={18} />
        </div>
      </div>

      {/* Compact Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar mb-6 p-1 bg-white dark:bg-gray-900 rounded-[18px] border border-gray-100 dark:border-gray-800 shadow-sm">
        {['All', 'Pending', 'To Ship', 'Delivered'].map((tab) => (
            <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 px-4 py-2 rounded-[14px] text-[9px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === tab ? 'bg-synergy-blue text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
                {tab}
            </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800 animate-in fade-in">
                <Box size={32} className="mx-auto mb-3 text-gray-200 dark:text-gray-800" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">No orders in queue</p>
                <button onClick={() => navigate('/home')} className="mt-3 text-synergy-blue font-black uppercase tracking-widest text-[9px] hover:underline">Go Shopping</button>
            </div>
        ) : (
            filteredOrders.map(order => {
                const status = getStatusConfig(order.status);
                const isExpanded = expandedOrder === order.id;

                return (
                    <div key={order.id} className={`bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden shadow-soft dark:shadow-none border border-transparent transition-all duration-500 ${isExpanded ? 'ring-1 ring-synergy-blue/20' : ''}`}>
                        
                        <div className="p-4" onClick={() => toggleExpand(order.id)}>
                            {/* Card Header: Compact Ref & Status */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-synergy-blue/10 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-synergy-blue">
                                        <Box size={12} />
                                    </div>
                                    <button 
                                        onClick={(e) => handleCopyText(e, order.id, order.id)}
                                        className="font-mono text-[10px] font-black text-gray-900 dark:text-gray-100 flex items-center space-x-1"
                                    >
                                        <span>#{order.id.replace('SF-','')}</span>
                                        {copiedId === order.id ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-gray-300" />}
                                    </button>
                                </div>
                                <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-[0.1em] ${status.color}`}>
                                    {status.label}
                                </span>
                            </div>

                            {/* Main Content: Scaled down but readable */}
                            <div className="flex items-start space-x-3.5 mb-4">
                                <div className="relative w-16 h-16 shrink-0">
                                    <img src={order.items[0].image} className="w-full h-full object-cover rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm" alt="p" />
                                    {order.items.length > 1 && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white dark:border-gray-900 shadow-md">
                                            +{order.items.length - 1}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <h3 className="text-xs font-black text-gray-900 dark:text-white truncate mb-0.5">{order.items[0].name}</h3>
                                    <div className="flex items-center space-x-1.5 text-gray-400 dark:text-gray-500 mb-2">
                                        <Calendar size={10} />
                                        <p className="text-[9px] font-bold uppercase tracking-tight">{order.date}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-base font-black text-synergy-blue">฿{order.total.toLocaleString()}</p>
                                        <div className="flex items-center space-x-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`w-1 h-1 rounded-full ${i <= status.step ? 'bg-synergy-blue shadow-glow' : 'bg-gray-100 dark:bg-gray-800'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Redesigned Action Buttons */}
                            <div className="flex space-x-2 pt-3.5 border-t border-gray-50 dark:border-gray-800">
                                {order.status === 'Delivered' ? (
                                    <>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); navigate(`/write-review/${order.id}`); }}
                                            className="flex-1 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-black uppercase tracking-[0.15em] flex items-center justify-center space-x-2 active:scale-95 transition shadow-sm group"
                                        >
                                            <Star size={14} className="group-hover:fill-current" />
                                            <span>Review</span>
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); navigate('/home'); }}
                                            className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 text-[9px] font-black uppercase tracking-widest active:scale-95 transition"
                                        >
                                            Order Again
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={(e) => handleTrackOrder(e, order.id)}
                                        disabled={trackingLoading === order.id}
                                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] flex items-center justify-center space-x-2 transition-all ${isExpanded ? 'bg-synergy-blue text-white shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}
                                    >
                                        {trackingLoading === order.id ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                                        <span>{isExpanded ? 'Hide Intel' : (order.status === 'Pending' ? 'View Audit' : 'Live Track')}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Elegant Expanded Section */}
                        {isExpanded && (
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-4 space-y-5 border-t border-gray-50 dark:border-gray-800 animate-in slide-in-from-top-3 duration-500">
                                 
                                 <div className="space-y-3">
                                     <h4 className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Distribution Items</h4>
                                     <div className="bg-white dark:bg-gray-900 p-3.5 rounded-[20px] border border-gray-100 dark:border-gray-800 space-y-3.5 shadow-sm">
                                         {order.items.map((item, idx) => (
                                             <div key={idx} className="flex items-center justify-between pb-3 last:pb-0 last:border-0 border-b border-gray-50 dark:border-gray-800">
                                                 <div className="flex items-center space-x-3">
                                                     <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                                                         <img src={item.image} className="w-full h-full object-cover" alt="p" />
                                                     </div>
                                                     <div className="min-w-0">
                                                         <p className="text-[11px] font-black text-gray-900 dark:text-white truncate max-w-[140px]">{item.name}</p>
                                                         <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Qty: {item.quantity}</p>
                                                     </div>
                                                 </div>
                                                 <p className="text-[11px] font-black text-gray-900 dark:text-white">฿{(item.price * item.quantity).toLocaleString()}</p>
                                             </div>
                                         ))}
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-3">
                                     <div className="bg-white dark:bg-gray-900 p-3.5 rounded-[20px] border border-gray-100 dark:border-gray-800 relative shadow-sm">
                                         <div className="flex items-center space-x-1.5 text-synergy-blue mb-2">
                                             <MapPin size={12} />
                                             <p className="text-[8px] font-black uppercase tracking-widest">Shipment</p>
                                         </div>
                                         <p className="text-[10px] font-black text-gray-900 dark:text-white truncate">{order.shippingAddress.name}</p>
                                         <p className="text-[8px] text-gray-400 font-bold mt-0.5 line-clamp-1 italic">{order.shippingAddress.address}</p>
                                         {order.status === 'Pending' && (
                                            <button onClick={(e) => handleStartEdit(e, order)} className="absolute top-3 right-3 text-gray-300 hover:text-synergy-blue transition active:scale-90"><Edit3 size={12} /></button>
                                         )}
                                     </div>
                                     <div className="bg-white dark:bg-gray-900 p-3.5 rounded-[20px] border border-gray-100 dark:border-gray-800 shadow-sm">
                                         <div className="flex items-center space-x-1.5 text-gray-400 mb-2">
                                             <Navigation size={12} />
                                             <p className="text-[8px] font-black uppercase tracking-widest">Logistics</p>
                                         </div>
                                         <p className="text-[10px] font-black text-gray-900 dark:text-white truncate">{order.shippingProvider || 'Synergy Express'}</p>
                                         <p className="text-[8px] text-gray-400 font-bold mt-0.5 uppercase tracking-tighter">Surface Delivery</p>
                                     </div>
                                 </div>

                                 {order.status !== 'Pending' ? (
                                    <div className="bg-white dark:bg-gray-900 p-4 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
                                         <div className="flex justify-between items-center mb-5">
                                             <h4 className="text-[9px] font-black text-gray-900 dark:text-white uppercase tracking-[0.15em]">Movement History</h4>
                                             <div className="bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-lg flex items-center border border-gray-100 dark:border-gray-700">
                                                 <span className="text-[8px] font-mono font-black text-gray-500 uppercase tracking-tighter">{order.trackingNumber || `TRK${order.id.slice(-6)}`}</span>
                                                 <button 
                                                    onClick={(e) => handleCopyText(e, order.trackingNumber || `TRK${order.id.slice(-6)}`, `trk-${order.id}`)}
                                                    className="ml-2 text-gray-300 hover:text-synergy-blue transition"
                                                 >
                                                     {copiedId === `trk-${order.id}` ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                 </button>
                                             </div>
                                         </div>

                                         <div className="relative pl-5 space-y-8">
                                             <div className="absolute left-[3px] top-1 bottom-1 w-[1.5px] bg-gray-100 dark:bg-gray-800"></div>
                                             {order.timeline.map((step, idx) => (
                                                 <div key={idx} className="relative pl-6 animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 100}ms` }}>
                                                     <div className={`absolute -left-[26px] top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${step.completed ? 'bg-synergy-blue text-white shadow-glow border-2 border-white dark:border-gray-900' : 'bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 text-gray-300'}`}>
                                                        {step.completed ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />}
                                                     </div>
                                                     <div className="pt-0.5">
                                                        <p className={`text-[10px] font-black uppercase tracking-wider ${step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.status}</p>
                                                        <p className="text-[8px] text-gray-400 dark:text-gray-500 font-bold mt-0.5 tracking-tighter italic">{step.date || 'Update Pending...'}</p>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                    </div>
                                 ) : (
                                     <div className="text-center py-8 px-4 bg-blue-50/40 dark:bg-blue-900/10 rounded-[24px] border border-blue-100/50 dark:border-blue-800/20">
                                         <Clock size={20} className="mx-auto text-synergy-blue mb-2.5 animate-pulse" />
                                         <p className="text-[10px] font-black text-synergy-blue uppercase tracking-[0.15em]">Compliance Audit In-Progress</p>
                                         <p className="text-[8px] text-gray-400 dark:text-gray-500 mt-1.5 font-bold leading-relaxed uppercase tracking-tighter">
                                             We are verifying payment settlement and SKU inventory. Real-time intel will be updated within 24 hours.
                                         </p>
                                     </div>
                                 )}

                                 <div className="flex space-x-2">
                                     <button onClick={() => navigate('/help-support')} className="flex-1 py-3.5 rounded-[18px] bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-[9px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 border border-gray-100 dark:border-gray-800 active:scale-95 transition">
                                         <Phone size={14} />
                                         <span>Support</span>
                                     </button>
                                     <button className="flex-1 py-3.5 rounded-[18px] bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-[9px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 border border-gray-100 dark:border-gray-800 active:scale-95 transition">
                                         <ExternalLink size={14} />
                                         <span>Receipt</span>
                                     </button>
                                 </div>
                            </div>
                        )}
                    </div>
                );
            })
        )}
      </div>

      {/* Edit Address Modal */}
      {editingOrder && editForm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl animate-in zoom-in-95">
                  <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="font-black text-gray-900 dark:text-white text-[10px] uppercase tracking-widest flex items-center">
                          <Edit3 size={14} className="mr-2 text-synergy-blue" /> Re-route Intelligence
                      </h3>
                      <button onClick={() => setEditingOrder(null)} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-400 active:scale-90 transition"><X size={16} /></button>
                  </div>
                  <div className="p-6 space-y-5">
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Consignee Name</label>
                          <input 
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3.5 text-xs outline-none dark:text-white font-black transition-all"
                          />
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Contact Identity</label>
                          <input 
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3.5 text-xs outline-none dark:text-white font-black transition-all"
                          />
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Coordinate Registry</label>
                          <textarea 
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3.5 text-xs h-24 resize-none outline-none dark:text-white font-medium transition-all"
                          />
                      </div>
                      <button 
                        onClick={handleSaveAddress}
                        className="w-full py-4 bg-synergy-blue text-white rounded-[20px] font-black text-xs shadow-glow flex items-center justify-center space-x-2 active:scale-[0.98] transition uppercase tracking-[0.2em]"
                      >
                          <Save size={16} />
                          <span>Commit Update</span>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
