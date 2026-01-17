import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Wand2, Image as ImageIcon, Send, Sparkles, X, AlertTriangle, Loader2, Video, Film, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

export const CreateContent: React.FC = () => {
  const { createPost } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [mood, setMood] = useState('Excited');
  
  // Media States
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isMediaValid, setIsMediaValid] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  const moods = ['Excited', 'Professional', 'Funny', 'Relaxed', 'Persuasive'];

  const handleMediaClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
        alert("Please upload an image or video file.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64 = reader.result as string;
        
        if (isVideo) {
            // Check video duration
            const videoElement = document.createElement('video');
            videoElement.preload = 'metadata';
            videoElement.onloadedmetadata = () => {
                window.URL.revokeObjectURL(videoElement.src);
                const duration = videoElement.duration;
                setVideoDuration(duration);
                
                if (duration > 60) {
                    setIsMediaValid(false);
                    alert("Video must be 60 seconds or less.");
                    setMedia(null);
                    setMediaType(null);
                } else {
                    setIsMediaValid(true);
                    setMedia(base64);
                    setMediaType('video');
                }
            };
            videoElement.src = URL.createObjectURL(file);
        } else {
            setIsMediaValid(true);
            setMedia(base64);
            setMediaType('image');
            setVideoDuration(0);
        }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = (e: React.MouseEvent) => { 
    e.stopPropagation(); 
    setMedia(null); 
    setMediaType(null);
    setVideoDuration(0);
    setIsMediaValid(true);
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  const handleGenerate = async () => {
      if (!topic || !details) { alert("Please enter topic and details."); return; }
      setIsGenerating(true);
      setApiError(null);
      
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `Write a short, engaging social media caption for a ${mediaType === 'video' ? 'video' : 'photo'} about "${topic}". Key details: ${details}. Mood/Tone: ${mood}. Include emojis and 3-4 relevant hashtags. Keep it under 200 characters.`;

          const response = await ai.models.generateContent({
             model: 'gemini-3-flash-preview',
             contents: prompt,
             config: {
                 temperature: 0.8,
                 topP: 0.95,
                 topK: 40
             }
          });

          const resultText = response.text;
          if (resultText) {
            setGeneratedContent(resultText.trim());
          } else {
            throw new Error("Result content is missing");
          }
      } catch (error: any) {
          console.error("AI Generation failed:", error);
          setApiError("AI Engine busy. Using high-conversion fallback template.");
          setGeneratedContent(`✨ Check out this amazing ${topic}! ${details} 🤩 Grab yours before it's gone! #SynergyFlow #Review #Affiliate`);
      } finally {
          setIsGenerating(false);
      }
  };

  const handlePost = () => {
      if (!media || !generatedContent) return;
      // In a real app, you'd send mediaType as well. 
      // Current context createPost expects { image, caption, mood } 
      // but FeedItem supports 'image' | 'video'. 
      // We will cast/send appropriately.
      createPost({ image: media, caption: generatedContent, mood });
      navigate('/feed');
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">Content Studio</h1>
      </div>

      <div className="space-y-6">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
        
        <div 
            onClick={handleMediaClick}
            className={`w-full h-72 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden group ${media ? 'border-transparent' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
        >
            {media ? (
                <>
                    {mediaType === 'video' ? (
                        <video src={media} className="w-full h-full object-cover" controls playsInline />
                    ) : (
                        <img src={media} alt="Selected" className="w-full h-full object-cover" />
                    )}
                    <button onClick={handleRemoveMedia} className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition z-10"><X size={18} /></button>
                    
                    {mediaType === 'video' && (
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black flex items-center space-x-1 border border-white/20">
                            <div className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span>{videoDuration.toFixed(1)}s / 60s</span>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center text-gray-400 p-8">
                    <div className="flex justify-center space-x-4 mb-3">
                        <ImageIcon size={32} className="opacity-40" />
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                        <Film size={32} className="opacity-40 text-synergy-blue" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">Upload Photo or Video</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Video length max 60 seconds</p>
                </div>
            )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-soft dark:shadow-none border border-transparent dark:border-gray-700 space-y-5">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Subject</label>
                <input 
                    value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex. Ultra Slim Powerbank"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-synergy-blue/20 dark:text-white font-medium"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Key Selling Points</label>
                <textarea 
                    value={details} onChange={(e) => setDetails(e.target.value)} placeholder="20,000mAh, PD charging, LED display..."
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3.5 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-synergy-blue/20 dark:text-white font-medium"
                />
            </div>
            
            <div className="flex flex-wrap gap-2">
                {moods.map(m => (
                    <button 
                        key={m} onClick={() => setMood(m)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition ${mood === m ? 'bg-synergy-blue text-white shadow-glow' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleGenerate} disabled={isGenerating || !topic || !details}
                className="w-full bg-gradient-to-r from-purple-600 via-synergy-blue to-indigo-600 text-white font-black py-4 rounded-xl shadow-glow flex items-center justify-center space-x-2 active:scale-[0.98] transition disabled:opacity-50 uppercase tracking-widest text-xs h-14"
            >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <><Sparkles size={20} /><span>Generate {mediaType === 'video' ? 'Video' : ''} Captions</span></>}
            </button>
        </div>

        {generatedContent && (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-soft dark:shadow-none border border-transparent dark:border-gray-700 animate-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-synergy-blue">
                        <div className="w-6 h-6 bg-blue-50 dark:bg-blue-900/30 rounded flex items-center justify-center"><Sparkles size={14} /></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Strategy Optimized</span>
                    </div>
                    {mediaType === 'video' && (
                        <div className="flex items-center space-x-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded text-[8px] font-black uppercase">
                            <CheckCircle2 size={10} />
                            <span>Duration OK</span>
                        </div>
                    )}
                </div>
                {apiError && (
                    <div className="mb-4 flex items-center space-x-2 p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px] font-bold rounded-lg border border-amber-100 dark:border-amber-800">
                        <AlertTriangle size={12} />
                        <span>{apiError}</span>
                    </div>
                )}
                <textarea 
                    value={generatedContent} onChange={(e) => setGeneratedContent(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl text-sm text-gray-700 dark:text-gray-200 leading-relaxed mb-5 border border-gray-100 dark:border-gray-700 focus:outline-none h-36 resize-none font-medium"
                />
                <button 
                    onClick={handlePost} disabled={!media || !isMediaValid}
                    className={`w-full h-14 rounded-xl font-black uppercase tracking-widest text-xs transition ${(!media || !isMediaValid) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl'}`}
                >
                    Publish to Feed
                </button>
            </div>
        )}
      </div>
    </div>
  );
};