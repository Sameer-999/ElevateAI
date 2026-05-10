import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  FileText, 
  Globe, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Zap,
  Sparkles,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText size={20} />, label: 'Resumes', path: '/resumes' },
    { icon: <Globe size={20} />, label: 'Portfolio', path: '/portfolio' },
    { icon: <MessageSquare size={20} />, label: 'AI Coach', path: '/coach' },
  ];

  return (
    <div className="flex h-screen bg-[#fdfdfd] text-[#1a1a1a] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-[#0a0a0a] text-white">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="fill-white text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">ElevateAI</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-zinc-800 text-white" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-zinc-800">
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 rounded-xl border border-zinc-700 relative overflow-hidden group cursor-pointer mb-6">
            <div className="absolute top-0 right-0 p-2 opacity-30">
              <Sparkles size={14} />
            </div>
            <p className="text-xs text-zinc-400 mb-2 font-semibold uppercase tracking-wider">Pro Plan</p>
            <p className="text-sm mb-3 text-white leading-snug">Unlimited AI Generations & Custom Domains</p>
            <button className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-100 transition-all">
              Manage Billing
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <button className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition-all">
              <Settings size={20} />
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-100 flex items-center justify-between px-8 bg-white shrink-0">
          <div className="relative w-96 max-w-full">
            <div className="flex items-center bg-zinc-100 rounded-full px-4 py-2 border border-zinc-200">
              <Search className="text-zinc-400 w-4 h-4 mr-2" />
              <input 
                type="text" 
                placeholder="Search your assets..."
                className="bg-transparent border-none outline-none text-sm w-full text-zinc-800 placeholder:text-zinc-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{auth.currentUser?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none">Pro Member</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden flex items-center justify-center">
                <img src={auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${auth.currentUser?.email}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fa] custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
