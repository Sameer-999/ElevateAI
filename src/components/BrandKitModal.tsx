import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Copy, Check, X, Shield, Globe, Linkedin, MessageSquare, Zap } from 'lucide-react';
import { generateProfessionalBrandKit } from '../lib/gemini';
import { cn } from '../lib/utils';

interface BrandKit {
  mainSummary: string;
  linkedinHeadline: string;
  portfolioBio: string;
  brandStatement: string;
}

export default function BrandKitModal({ isOpen, onClose, userData, onApplySummary }: { 
  isOpen: boolean, 
  onClose: () => void, 
  userData: any,
  onApplySummary: (summary: string) => void
}) {
  const [loading, setLoading] = useState(false);
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [tone, setTone] = useState('modern');
  const [copied, setCopied] = useState<string | null>(null);

  const generateKit = async () => {
    setLoading(true);
    try {
      const data = await generateProfessionalBrandKit(userData, tone);
      setKit(data);
    } catch (error) {
      console.error('Error generating brand kit:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const TONES = [
    { id: 'modern', name: 'Modern', desc: 'Clean & Confident' },
    { id: 'corporate', name: 'Corporate', desc: 'Polished & Executive' },
    { id: 'creative', name: 'Creative', desc: 'Bold & Expressive' },
    { id: 'technical', name: 'Technical', desc: 'Sharp & Specialized' },
    { id: 'minimal', name: 'Minimal', desc: 'Concise & Premium' },
    { id: 'founder', name: 'Founder', desc: 'Visionary & Strategic' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-zinc-100"
      >
        <div className="w-full md:w-80 bg-zinc-50 p-8 border-r border-zinc-100 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
               <Shield size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold tracking-tight">Identity Engine</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Brand Kit 1.0</p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
             <div>
               <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-4">Strategic Tone</label>
               <div className="space-y-3">
                 {TONES.map((t) => (
                   <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={cn(
                      "w-full p-4 rounded-2xl text-left transition-all border",
                      tone === t.id 
                        ? "bg-white border-black shadow-lg shadow-zinc-200" 
                        : "bg-transparent border-zinc-100 hover:border-zinc-300"
                    )}
                   >
                     <p className={cn("text-xs font-bold uppercase tracking-widest", tone === t.id ? "text-black" : "text-zinc-600")}>{t.name}</p>
                     <p className="text-[10px] font-medium text-zinc-400 mt-1">{t.desc}</p>
                   </button>
                 ))}
               </div>
             </div>
          </div>

          <button 
            onClick={generateKit}
            disabled={loading}
            className="w-full py-4 bg-[#0a0a0a] text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl mt-8 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
            ) : (
              <>
                <Sparkles size={16} />
                Optimize Identity
              </>
            )}
          </button>
        </div>

        <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[85vh] bg-white custom-scrollbar">
          <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-400 hover:text-black">
            <X size={20} />
          </button>

          {!kit && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                 <Zap size={32} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Build Your Professional Core</h2>
                <p className="text-zinc-500 max-w-sm mx-auto">Select a tone and generate optimized content for your resume, LinkedIn, and personal website.</p>
              </div>
            </div>
          )}

          {loading && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-50 rounded-full" />
                  <div className="absolute inset-0 w-20 h-20 border-4 border-blue-600 border-t-transparent animate-spin rounded-full" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight animate-pulse">Analyzing Experience...</h2>
                  <p className="text-sm text-zinc-400 font-medium italic">"Identifying high-value achievements and keywords"</p>
                </div>
             </div>
          )}

          {kit && !loading && (
            <div className="space-y-12">
               {/* Main Resume Summary */}
               <section className="space-y-4 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-zinc-300" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ATS Optimized Summary</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyToClipboard(kit.mainSummary, 'summary')}
                        className="p-2 hover:bg-zinc-50 rounded-lg transition-all text-zinc-400 hover:text-blue-600"
                      >
                        {copied === 'summary' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button 
                         onClick={() => onApplySummary(kit.mainSummary)}
                         className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all"
                      >
                        Apply to Resume
                      </button>
                    </div>
                  </div>
                  <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100 relative group/box">
                    <p className="text-base leading-relaxed text-zinc-800 font-medium">{kit.mainSummary}</p>
                  </div>
               </section>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* LinkedIn Headline */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Linkedin size={16} className="text-zinc-300" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">LinkedIn Headline</h4>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(kit.linkedinHeadline, 'li')}
                        className="p-2 hover:bg-zinc-50 rounded-lg transition-all text-zinc-400 hover:text-blue-600"
                      >
                        {copied === 'li' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 italic">
                      <p className="text-sm font-bold text-zinc-700 leading-relaxed">"{kit.linkedinHeadline}"</p>
                    </div>
                  </section>

                  {/* Portfolio Bio */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-zinc-300" />
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Portfolio Bio</h4>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(kit.portfolioBio, 'bio')}
                        className="p-2 hover:bg-zinc-50 rounded-lg transition-all text-zinc-400 hover:text-blue-600"
                      >
                        {copied === 'bio' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-sm font-medium text-zinc-600 leading-relaxed">{kit.portfolioBio}</p>
                    </div>
                  </section>
               </div>

               {/* Brand Statement */}
               <section className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-zinc-300" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">One-Line Brand</h4>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(kit.brandStatement, 'brand')}
                      className="p-2 hover:bg-zinc-50 rounded-lg transition-all text-zinc-400 hover:text-blue-600"
                    >
                      {copied === 'brand' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="p-8 bg-[#0a0a0a] rounded-3xl text-center">
                    <p className="text-xl font-bold text-white tracking-tight uppercase">"{kit.brandStatement}"</p>
                  </div>
               </section>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
