import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import Layout from '../components/Layout';
import { 
  Globe, 
  Smartphone, 
  Monitor, 
  Palette, 
  Eye, 
  ExternalLink, 
  Check, 
  Sparkles,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const THEMES = [
  { id: 'modern', name: 'Minimalist', color: 'bg-white', text: 'text-black', preview: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97' },
  { id: 'dark', name: 'Technical', color: 'bg-black', text: 'text-white', preview: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c' },
  { id: 'creative', name: 'Editorial', color: 'bg-purple-100', text: 'text-purple-900', preview: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085' },
];

export default function PortfolioBuilder() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('modern');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!auth.currentUser) return;
      const docRef = doc(db, 'users', auth.currentUser.uid, 'portfolios', 'default');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPortfolio(docSnap.data());
        setCurrentTheme(docSnap.data().themeId || 'modern');
      } else {
        // Initial setup
        const initial = {
          userId: auth.currentUser.uid,
          slug: auth.currentUser.email?.split('@')[0].replace(/[^a-z0-9]/g, ''),
          themeId: 'modern',
          isPublished: false,
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, initial);
        setPortfolio(initial);
      }
      setLoading(false);
    };
    fetchPortfolio();
  }, []);

  const togglePublish = async () => {
    if (!auth.currentUser || !portfolio) return;
    setPublishing(true);
    const docRef = doc(db, 'users', auth.currentUser.uid, 'portfolios', 'default');
    await updateDoc(docRef, { isPublished: !portfolio.isPublished });
    setPortfolio({ ...portfolio, isPublished: !portfolio.isPublished });
    setPublishing(false);
  };

  const updateTheme = async (themeId: string) => {
    if (!auth.currentUser || !portfolio) return;
    setCurrentTheme(themeId);
    const docRef = doc(db, 'users', auth.currentUser.uid, 'portfolios', 'default');
    await updateDoc(docRef, { themeId });
  };

  if (loading) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Portfolio Engine</h1>
            <p className="text-zinc-500 font-medium font-medium">Manage your public presence and professional themes.</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={togglePublish}
              disabled={publishing}
              className={cn(
                "px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2",
                portfolio?.isPublished ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
              )}
             >
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", portfolio?.isPublished ? "bg-red-500" : "bg-green-500")} />
               {portfolio?.isPublished ? 'Live' : 'Draft'}
             </button>
             {portfolio?.isPublished && (
               <a 
                href={`#`} 
                className="flex items-center gap-2 px-6 py-2 bg-[#0a0a0a] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-zinc-200"
               >
                 View Live <ExternalLink size={14} />
               </a>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
          {/* Controls */}
          <div className="space-y-8">
            <section className="p-8 rounded-3xl bg-white border border-zinc-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="text-blue-500" size={18} />
                <h3 className="font-bold text-sm tracking-tight">Select Identity</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => updateTheme(theme.id)}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-2xl transition-all",
                      currentTheme === theme.id 
                        ? "border-black bg-zinc-50" 
                        : "border-zinc-100 bg-white hover:border-zinc-300"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-lg overflow-hidden border border-zinc-100", theme.color)}>
                         <img src={theme.preview} className="w-full h-full object-cover opacity-50 filter grayscale" referrerPolicy="no-referrer" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-bold block">{theme.name}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Utility V1</span>
                      </div>
                    </div>
                    {currentTheme === theme.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            </section>

            <section className="p-8 rounded-3xl bg-white border border-zinc-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <LayoutGrid className="text-zinc-400" size={18} />
                <h3 className="font-bold text-sm tracking-tight">Layout Config</h3>
              </div>
              <div className="space-y-6">
                 <ToggleOption label="Project Deck" defaultChecked />
                 <ToggleOption label="Testimonials" defaultChecked />
                 <ToggleOption label="Theme Sync" />
                 <ToggleOption label="Social Nodes" defaultChecked />
              </div>
            </section>

            <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                   <Globe className="text-white" size={12} />
                 </div>
                 <h4 className="text-sm font-bold text-white uppercase tracking-widest">Domains</h4>
               </div>
               <p className="text-xs text-zinc-500 mb-6 leading-relaxed font-medium">Link your custom professional domain for maximum authority.</p>
               <button className="w-full py-3 bg-zinc-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 transition-all">
                 Configure Domain
               </button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-4 mb-4 text-zinc-300">
               <Monitor size={16} className="text-black" />
               <Smartphone size={16} />
               <div className="h-4 w-[1px] bg-zinc-100 mx-2" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Canvas Preview</span>
            </div>
            <div className="flex-1 min-h-[650px] rounded-[2.5rem] bg-white border border-zinc-100 overflow-hidden shadow-2xl relative group">
                {/* Simulated Iframe for portfolio content */}
                <div className={cn(
                  "w-full h-full overflow-y-auto p-16 transition-all duration-500 scroll-smooth",
                  currentTheme === 'modern' ? 'bg-white text-black' : 
                  currentTheme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-[#f4f4f5] text-zinc-900'
                )}>
                  <header className="py-24 text-center space-y-8">
                    <motion.div 
                      key={currentTheme}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-block px-4 py-1.5 rounded-full border border-current opacity-20 text-[10px] font-bold uppercase tracking-widest"
                    >
                      Infrastructure Designer
                    </motion.div>
                    <h1 className="text-7xl font-bold tracking-tighter uppercase leading-[0.85]">
                      Building <br/><span className="text-blue-600 italic font-medium">performant</span> <br/>solutions.
                    </h1>
                    <p className="text-lg opacity-60 font-medium max-w-lg mx-auto leading-relaxed">
                      Transforming complex data into simple, high-utility interfaces for the modern web.
                    </p>
                  </header>

                  <section className="py-24 border-t border-current/10">
                    <div className="flex items-center justify-between mb-12">
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Selection • 01</h2>
                      <div className="h-[1px] flex-1 bg-current opacity-10 mx-6" />
                    </div>
                    <div className="grid grid-cols-2 gap-12">
                       {[1, 2].map(i => (
                         <div key={i} className="space-y-6 group/card cursor-pointer">
                           <div className="aspect-[4/3] bg-zinc-100 rounded-3xl overflow-hidden relative border border-current/5 shadow-sm transform transition-transform duration-700 hover:scale-[1.02]">
                              <img src={`https://images.unsplash.com/photo-${i === 1 ? '1460925895917' : '1498050108023'}?auto=format&fit=crop&q=80&w=2426`} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 filter grayscale" referrerPolicy="no-referrer" />
                           </div>
                           <div>
                             <h3 className="font-bold text-2xl tracking-tight mb-2 uppercase">Project Alpha {i}</h3>
                             <p className="text-[11px] font-bold opacity-30 uppercase tracking-[0.2em]">Architecture • Utility • 2026</p>
                           </div>
                         </div>
                       ))}
                    </div>
                  </section>
                </div>

                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10">
                  <div className="text-center space-y-4">
                    <button className="px-10 py-4 bg-[#0a0a0a] text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 mx-auto transform transition-transform hover:scale-105">
                      <ExternalLink size={14} /> Global View
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Visualized in real-time</p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ToggleOption({ label, defaultChecked = false }: { label: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{label}</span>
      <button 
        onClick={() => setChecked(!checked)}
        className={cn(
        "w-10 h-5 rounded-full relative transition-all shadow-inner",
        checked ? "bg-black" : "bg-zinc-100"
      )}>
        <div className={cn(
          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm",
          checked ? "left-6" : "left-1"
        )} />
      </button>
    </div>
  );
}
