import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Share2, Copy, Heart, MessageCircle, Send, X, Check, Clock, ChevronUp, Sparkles, Play, ShieldCheck, UserPlus, Search } from 'lucide-react';
import { FeedItem } from '../types';

export const Feed: React.FC = () => {
  const { feed, ads, toggleFeedLike, addFeedComment, user, referrer, addReferrer, setBottomNavHidden } = useApp();
  const [activeTab, setActiveTab] = useState<'Trending' | 'For You'>('For You');
  
  const [showComments, setShowComments] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  // Referrer Modal for Feed
  const [showReferrerModal, setShowReferrerModal] = useState(false);
  const [referrerCode, setReferrerCode] = useState('');
  const [referrerError, setReferrerError] = useState('');

  // Users see all 'Approved' posts + their own 'Pending' posts
  const visibleFeed = feed.filter(f => f.status === 'Approved' || f.userId === user?.email);
  const filteredFeed = activeTab === 'For You' ? visibleFeed : visibleFeed.filter(f => f.category === 'Trending');
  const activeAds = ads.filter(a => a.active);

  const checkReferrerAction = (action: () => void) => {
    if (!referrer) {
      setShowReferrerModal(true);
      return;
    }
    action();
  };

  const handleShare = async (post: FeedItem) => {
    checkReferrerAction(async () => {
        const affiliateLink = `https://synergyflow.app/post/${post.id}?ref=${user?.referralCode || 'USER'}`;
        const shareText = `${post.caption}\n\nShop Now: ${affiliateLink} #SynergyFlow`;

        if (navigator.share) {
            try {
                await navigator.share({ title: `Promote: ${post.user}'s Post`, text: shareText, url: affiliateLink });
            } catch (error) { console.log('Share canceled'); }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                alert("Promote link and caption copied to clipboard!");
            } catch (err) { alert("Could not copy text."); }
        }
    });
  };

  const handleCopyCaption = (id: number, text: string) => {
    checkReferrerAction(() => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    });
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

  const submitComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentInput.trim() || showComments === null) return;
      addFeedComment(showComments, commentInput);
      setCommentInput('');
  };

  const openComments = (id: number) => {
      setShowComments(id);
      setIsExpanded(false);
  };

  const activePostForComments = feed.find(f => f.id === showComments);

  return (
    <div className="pb-24 pt-0 px-4 max-w-md mx-auto min-h-screen bg-gray-50 relative transition-colors duration-300">
      
      {/* Advertising Banners from AppContext */}
      {activeAds.length > 0 && (
          <div className="flex overflow-x-auto snap-x no-scrollbar -mx-4 mb-4">
              {activeAds.map(ad => (
                  <div key={ad.id} className="min-w-full h-36 relative snap-center group">
                      <img src={ad.image} alt={ad.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                          <div className="flex items-center space-x-2 mb-1">
                              <span className="bg-synergy-blue text-[10px] font-bold px-2 py-0.5 rounded border border-white/20 uppercase tracking-widest">PROMO</span>
                              <div className="flex items-center space-x-1 text-yellow-400 text-xs font-bold"><Sparkles size={12} /><span>Limited Time</span></div>
                          </div>
                          <h2 className="text-lg font-bold leading-tight">{ad.title}</h2>
                          <p className="text-[10px] text-gray-300 line-clamp-1">{ad.subtitle}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Tabs Filter */}
      <div className="flex justify-end mb-6">
        <div className="flex space-x-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-full inline-flex shadow-sm">
            <button onClick={() => setActiveTab('Trending')} className={`text-xs px-4 py-1.5 rounded-full font-medium transition ${activeTab === 'Trending' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500'}`}>Trending</button>
            <button onClick={() => setActiveTab('For You')} className={`text-xs px-4 py-1.5 rounded-full font-medium transition ${activeTab === 'For You' ? 'bg-synergy-blue text-white shadow-sm' : 'text-gray-500'}`}>For You</button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredFeed.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
                <Sparkles size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No posts in your feed yet.</p>
            </div>
        ) : (
            filteredFeed.map(post => (
              <div key={post.id} className={`bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-soft transition-all duration-300 border border-transparent dark:border-gray-700 ${post.status === 'Pending' ? 'opacity-80 grayscale-[0.3]' : ''}`}>
                <div className="relative">
                  {post.type === 'video' ? (
                      <video src={post.content} className="w-full h-[400px] object-cover" controls playsInline />
                  ) : (
                      <img src={post.content} alt="Post" className="w-full h-[400px] object-cover" />
                  )}
                  
                  {/* Status Overlay - Only show if Pending */}
                  <div className="absolute top-4 right-4 flex flex-col items-end space-y-2 z-10">
                      {post.status === 'Pending' && (
                          <div className="bg-yellow-400/90 backdrop-blur-md rounded-full px-3 py-1 text-white text-[10px] font-black uppercase flex items-center space-x-1 shadow-md border border-white/20">
                              <Clock size={12} />
                              <span>Reviewing</span>
                          </div>
                      )}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-synergy-blue to-purple-500 p-[2px] shadow-sm">
                           <img src={post.avatar} className="w-full h-full rounded-full border border-white dark:border-gray-800" alt="Avatar" />
                       </div>
                       <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{post.user}</span>
                    </div>
                    <div className="flex space-x-4 text-gray-500">
                      <button onClick={() => toggleFeedLike(post.id)} className="flex flex-col items-center transition active:scale-90"><Heart size={22} className={post.isLiked ? "fill-red-500 text-red-500" : ""} /><span className="text-[10px] mt-1 font-medium">{post.likes}</span></button>
                      <button onClick={() => openComments(post.id)} className="flex flex-col items-center transition active:scale-90"><MessageCircle size={22} /><span className="text-[10px] mt-1 font-medium">{post.comments.length}</span></button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed line-clamp-2">
                    {post.caption} <span className="text-synergy-blue font-bold">#SynergyFlow #Affiliate</span>
                  </p>
                  {post.mood && (
                    <div className="mb-4">
                        <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-wider border border-purple-100 dark:border-purple-800">
                            Tone: {post.mood}
                        </span>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button onClick={() => handleCopyCaption(post.id, post.caption)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition ${copiedId === post.id ? 'bg-green-100 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-green-200 dark:border-emerald-800' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}>
                        {copiedId === post.id ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedId === post.id ? 'Copied' : 'Caption'}</span>
                    </button>
                    <button onClick={() => handleShare(post)} disabled={post.status === 'Pending'} className={`flex-[2] text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center space-x-2 shadow-glow active:scale-95 transition ${post.status === 'Pending' ? 'bg-gray-300 dark:bg-gray-700 shadow-none cursor-not-allowed' : 'bg-synergy-blue'}`}>
                        <Share2 size={14} />
                        <span>Promote Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* REFERRER REQUIRED POPUP FOR FEED */}
      {showReferrerModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6">
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
                        To start promoting and earning commissions from the feed, you must link your account to a referrer.
                    </p>
                    
                    <div className="mb-6">
                        <input 
                            value={referrerCode}
                            onChange={(e) => {
                                setReferrerCode(e.target.value.toUpperCase());
                                setReferrerError('');
                            }}
                            placeholder="Ex. BOSS001"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-4 text-center font-black text-xl uppercase tracking-widest text-synergy-blue placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-synergy-blue/30"
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
                            <span>Link & Promote</span>
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

      {showComments !== null && activePostForComments && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowComments(null)}></div>
              <div className={`bg-white dark:bg-gray-900 w-full max-w-md rounded-t-[32px] relative animate-in slide-in-from-bottom-full duration-300 flex flex-col transition-all ease-in-out ${isExpanded ? 'h-[92vh]' : 'h-[60vh]'}`}>
                  <div className="w-full pt-4 pb-2 flex flex-col items-center justify-center cursor-pointer touch-none" onClick={() => setIsExpanded(!isExpanded)}><div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mb-1"></div>{!isExpanded && <ChevronUp size={14} className="text-gray-400 animate-bounce" />}</div>
                  <div className="px-6 flex justify-between items-center mb-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Comments ({activePostForComments.comments.length})</h3>
                      <button onClick={() => setShowComments(null)} className="p-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} className="text-gray-500" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 px-6">
                      {activePostForComments.comments.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">No comments yet. Be the first!</div>
                      ) : (
                        activePostForComments.comments.map(c => (
                            <div key={c.id} className="flex space-x-3">
                                <img src={c.avatar} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" alt="Avatar" />
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none text-sm">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-bold text-gray-900 dark:text-white text-xs">{c.user}</span>
                                        <span className="text-[10px] text-gray-400">{c.date}</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400">{c.text}</p>
                                </div>
                            </div>
                        ))
                      )}
                  </div>
                  <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 pb-safe rounded-b-[32px]">
                      <form onSubmit={submitComment} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-full border border-gray-100 dark:border-gray-700">
                          <input 
                            value={commentInput} 
                            onChange={(e) => setCommentInput(e.target.value)} 
                            placeholder="Add a comment..." 
                            className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none dark:text-white" 
                            autoFocus 
                          />
                          <button type="submit" disabled={!commentInput.trim()} className="p-2 bg-synergy-blue text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition shadow-sm">
                              <Send size={16} />
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};