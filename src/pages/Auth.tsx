import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Zap, Github, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white text-[#1a1a1a] font-sans">
      {/* Left Pane - Branding */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center font-black text-xl">
             <Zap className="fill-black text-black" size={20} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white uppercase">ElevateAI</span>
        </div>

        <div className="relative z-10">
          <blockquote className="text-4xl font-bold text-white mb-8 leading-tight tracking-tighter">
            "Design is the silent ambassador of your brand. ElevateAI helps you curate a presence that resonates."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 p-1 border border-zinc-700">
               <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/initials/svg?seed=Alex" alt="Avatar" />
               </div>
            </div>
            <div>
              <p className="font-bold text-white">Alex Carter</p>
              <p className="text-zinc-500 text-sm">Product Lead at AI Systems</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500 blur-[120px] opacity-10 rounded-full" />
      </div>

      {/* Right Pane - Form */}
      <div className="flex items-center justify-center p-8 md:p-20 bg-[#fdfdfd]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-3">{isLogin ? 'Welcome back' : 'Join thousands of builders'}</h1>
            <p className="text-zinc-500 font-medium">{isLogin ? 'Access your utility suite.' : 'Start crafting your professional future today.'}</p>
          </div>

          <div className="space-y-3 mb-8">
            <button 
              onClick={handleGoogleLogin}
              className="w-full h-12 bg-white border border-zinc-200 text-black rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all active:scale-[0.98] shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="w-full h-12 bg-white border border-zinc-200 text-black rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all active:scale-[0.98] shadow-sm">
              <Github className="w-5 h-5" />
              Github
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">
              <span className="bg-[#fdfdfd] px-4">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-sm focus:ring-1 focus:ring-black focus:outline-none transition-all placeholder:text-zinc-300"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-sm focus:ring-1 focus:ring-black focus:outline-none transition-all placeholder:text-zinc-300"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            <button 
              type="submit"
              className="w-full h-12 bg-[#0a0a0a] text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] mt-6 shadow-xl shadow-zinc-200"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-zinc-400 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-black font-bold hover:underline underline-offset-4"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
