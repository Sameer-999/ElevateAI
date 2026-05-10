import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Layout, FileText, Zap, Globe, Users, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1a1a1a] selection:bg-blue-100 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">ElevateAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-500">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#templates" className="hover:text-black transition-colors">Templates</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
          </div>
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-2 bg-[#0a0a0a] text-white rounded-xl text-sm font-semibold transition-all active:scale-95"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-8"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI-Powered Career System</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-6xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.95]"
              >
                Curate your <br/>professional <br/><span className="text-blue-600 italic font-medium">presence</span>.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-zinc-500 max-w-lg mb-10 leading-relaxed font-medium"
              >
                The utility platform for builders and creators to craft high-impact resumes 
                and stunning portfolios in minutes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <button 
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto px-8 py-3 bg-[#0a0a0a] text-white rounded-xl font-bold text-sm shadow-xl shadow-zinc-200 transition-all hover:opacity-90 active:scale-95"
                >
                  Start Building Free
                </button>
                <button className="w-full sm:w-auto px-8 py-3 bg-white border border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all">
                  Watch Demo
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-2xl overflow-hidden">
                 <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100" />
                   <div className="space-y-2">
                     <div className="w-32 h-3 bg-zinc-100 rounded-full" />
                     <div className="w-20 h-2 bg-zinc-50 rounded-full" />
                   </div>
                 </div>
                 <div className="space-y-4">
                   <div className="w-full h-32 bg-zinc-50 rounded-2xl border border-zinc-100 p-4">
                      <div className="w-full h-2 bg-zinc-200 rounded-full mb-4" />
                      <div className="w-2/3 h-2 bg-zinc-100 rounded-full mb-4" />
                      <div className="w-1/2 h-2 bg-zinc-100 rounded-full" />
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                     {[1,2,3].map(i => (
                       <div key={i} className="aspect-video bg-zinc-50 rounded-xl border border-zinc-100" />
                     ))}
                   </div>
                 </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400 blur-[120px] opacity-10 rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-zinc-300 mb-8 font-mono">Trusted by builders at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-20 filter grayscale">
            <span className="text-xl font-black">GOOGLE</span>
            <span className="text-xl font-black">APPLE</span>
            <span className="text-xl font-black">META</span>
            <span className="text-xl font-black">AMAZON</span>
            <span className="text-xl font-black">STRIPE</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-[#fdfdfd]">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Built for utility.</h2>
          <p className="text-zinc-500 max-w-xl mx-auto font-medium">Professional instruments for the modern workforce. Clean, fast, and driven by intelligence.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<FileText className="w-6 h-6 text-indigo-600" />}
            title="Resume Engine"
            description="ATS-friendly output with precision auditing to ensure you pass through every automated gate."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6 text-indigo-600" />}
            title="Live Portfolios"
            description="Transform your data into a performant web experience. Zero configuration, maximum impact."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-indigo-600" />}
            title="Career AI"
            description="Intelligent coaching that maps the market and aligns your skills with the highest global demand."
            delay={0.3}
          />
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 border-t border-zinc-100 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#0a0a0a] rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-lg tracking-tight uppercase">ElevateAI</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium">© 2026 ElevateAI. Professional career tools.</p>
          </div>
          <div className="flex gap-10 text-sm font-bold text-zinc-400">
            <a href="#" className="hover:text-black transition-colors">Twitter</a>
            <a href="#" className="hover:text-black transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-10 rounded-[2.5rem] bg-white border border-zinc-100 hover:shadow-2xl hover:shadow-zinc-200 transition-all group text-left"
    >
      <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-8 border border-zinc-100 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-zinc-500 leading-relaxed text-sm font-medium">{description}</p>
    </motion.div>
  );
}
