import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import Layout from '../components/Layout';
import { 
  FileText, 
  Globe, 
  Target, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  Sparkles,
  Award,
  Eye
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const MOCK_DATA = [
  { name: 'Jan', views: 40 },
  { name: 'Feb', views: 300 },
  { name: 'Mar', views: 200 },
  { name: 'Apr', views: 450 },
  { name: 'May', views: 600 },
];

export default function Dashboard() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, 'users', auth.currentUser.uid, 'resumes'),
        orderBy('updatedAt', 'desc'),
        limit(3)
      );
      const snapshot = await getDocs(q);
      setResumes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Morning, {auth.currentUser?.email?.split('@')[0]}.</h1>
            <p className="text-zinc-500 text-sm">Your career profile is <span className="text-blue-600 font-semibold">82% complete</span>. 4 new AI suggestions available.</p>
          </div>
          <button 
            onClick={() => navigate('/resumes')}
            className="bg-[#0a0a0a] text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-zinc-200"
          >
            <Plus size={20} />
            + New Project
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            label="ATS Score" 
            value="94" 
            change="+5.2%" 
            icon={<Target className="text-zinc-400" size={16} />} 
          />
          <StatCard 
            label="Portfolio Views" 
            value="1.2k" 
            change="+18%" 
            icon={<Eye className="text-zinc-400" size={16} />} 
          />
          <StatCard 
            label="Job Matches" 
            value="24" 
            change="Weekly" 
            icon={<TrendingUp className="text-zinc-400" size={16} />} 
          />
          <StatCard 
            label="Readiness" 
            value="Gold" 
            icon={<Award className="text-zinc-400" size={16} />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-zinc-100 shadow-sm h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold">Portfolio Engagement</h3>
              <select className="bg-transparent border-none text-xs font-bold uppercase tracking-wider text-blue-600 focus:outline-none cursor-pointer">
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_DATA}>
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4, stroke: '#fff' }} 
                  />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f4f4f5', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm underline">AI</div>
              <h3 className="font-bold text-sm tracking-tight">Career Assistant</h3>
            </div>
            <div className="space-y-4 flex-1">
              <SuggestionItem 
                title="Resume Optimization" 
                desc="I've found 3 keywords missing from your recent resume: Scalability, Accessibility Audit..."
                isAI
              />
              <SuggestionItem 
                title="Networking Prompt" 
                desc="Need an intro message for the hiring manager at Stripe? I can draft one..."
                isAI
              />
            </div>
            <button className="mt-8 text-xs text-blue-600 font-bold underline underline-offset-4 w-full text-center">
              View All Suggestions
            </button>
          </div>
        </div>

        {/* Recent Resumes */}
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-50 flex justify-between items-center">
            <h3 className="font-bold text-sm">Recent Resumes</h3>
            <button className="text-blue-600 text-xs font-bold uppercase tracking-wider">View All</button>
          </div>
          <div className="divide-y divide-zinc-50">
            {resumes.length > 0 ? resumes.map((resume) => (
              <div 
                key={resume.id}
                className="p-6 flex items-center justify-between hover:bg-zinc-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/resumes/${resume.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-12 bg-zinc-100 rounded border border-zinc-200 flex flex-col p-1 gap-1">
                    <div className="h-1 bg-zinc-300 w-full"></div>
                    <div className="h-1 bg-zinc-300 w-2/3"></div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{resume.title}</h4>
                    <p className="text-xs text-zinc-500">Modified {new Date(resume.updatedAt).toLocaleTimeString()} • ATS: {resume.atsScore || '--'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold hover:bg-zinc-100">Edit</button>
                  <button className="px-3 py-1.5 bg-zinc-100 rounded-lg text-xs font-semibold hover:bg-zinc-200">Export</button>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center">
                <FileText className="mx-auto text-zinc-200 mb-4" size={40} />
                <p className="text-zinc-500 text-sm">No resumes yet. Start building one today!</p>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Status Banner */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">Portfolio is Live: alex-carter.design</h3>
              <p className="text-white/80 text-xs leading-relaxed max-w-md">Generate a custom portfolio website in 30 seconds using your existing resume data.</p>
            </div>
            <button className="px-8 py-3 bg-white text-indigo-700 rounded-xl text-xs font-bold tracking-wide uppercase transition-all hover:scale-105 active:scale-95 shadow-xl">
              Edit Website
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 blur-[100px] rounded-full pointer-events-none" />
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, change, icon }: { label: string, value: string, change?: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm transition-all hover:shadow-md">
      <p className="text-zinc-400 text-[10px] font-bold uppercase mb-1 tracking-[0.1em]">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-3xl font-light tracking-tight">{value}</span>
        {change && (
          <span className={cn(
             "text-[10px] font-bold",
             change.startsWith('+') ? "text-green-500" : "text-zinc-400"
          )}>{change}</span>
        )}
      </div>
      <div className="w-full bg-zinc-100 h-1 rounded-full mt-4">
        <div className={cn(
          "h-1 rounded-full",
          label.includes("ATS") ? "bg-green-500 w-[94%]" : 
          label.includes("Views") ? "bg-blue-500 w-[65%]" : "bg-indigo-500 w-[45%]"
        )}></div>
      </div>
    </div>
  );
}

function SuggestionItem({ title, desc, isAI }: { title: string, desc: string, isAI?: boolean }) {
  return (
    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-wider">{title}</p>
      <p className="text-[13px] text-zinc-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
      <button className="mt-3 text-[11px] text-blue-600 font-bold underline underline-offset-4">Apply Suggestion</button>
    </div>
  );
}
