import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { generateResumeScore, generateProfessionalSummary } from '../lib/gemini';
import Layout from '../components/Layout';
import { 
  Save, 
  Sparkles, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Download, 
  Eye, 
  Layout as LayoutIcon,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [resumeData, setResumeData] = useState<any>({
    title: 'Untitled Resume',
    personal: { name: '', email: '', phone: '', location: '', website: '', summary: '' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    atsScore: 0,
    aiSuggestions: []
  });

  useEffect(() => {
    const fetchResume = async () => {
      if (!id || !auth.currentUser) {
        setLoading(false);
        return;
      }
      const docRef = doc(db, 'users', auth.currentUser.uid, 'resumes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setResumeData(docSnap.data());
      }
      setLoading(false);
    };
    fetchResume();
  }, [id]);

  const saveResume = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    const resumeId = id || Math.random().toString(36).substr(2, 9);
    const docRef = doc(db, 'users', auth.currentUser.uid, 'resumes', resumeId);
    
    const updatedData = {
      ...resumeData,
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(docRef, updatedData, { merge: true });
    setSaving(false);
    if (!id) navigate(`/resumes/${resumeId}`);
  };

  const runAiOptimization = async () => {
    setSaving(true);
    try {
      const result = await generateResumeScore(JSON.stringify(resumeData));
      setResumeData({
        ...resumeData,
        atsScore: result.score,
        aiSuggestions: result.improvements
      });
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <div className="h-screen flex flex-col bg-[#fdfdfd] text-[#1a1a1a] font-sans">
      {/* Builder Sub-Header */}
      <div className="h-16 border-b border-zinc-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-zinc-100 rounded-lg transition-all text-zinc-400 hover:text-black">
             <ChevronLeft size={20} />
          </button>
          <div className="h-6 w-[1px] bg-zinc-100 mx-2" />
          <input 
            value={resumeData.title}
            onChange={(e) => setResumeData({...resumeData, title: e.target.value})}
            className="bg-transparent border-none focus:outline-none font-bold text-sm min-w-[200px] tracking-tight"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={runAiOptimization}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all shadow-sm"
          >
            <Sparkles size={14} />
            AI Score: {resumeData.atsScore || '--'}%
          </button>
          <button 
            onClick={saveResume}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#0a0a0a] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-zinc-200"
          >
            <Save size={14} />
            {saving ? 'Syncing...' : 'Save Changes'}
          </button>
          <button className="p-2.5 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all shadow-sm">
            <Download size={16} className="text-zinc-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor */}
        <div className="w-[450px] border-r border-zinc-100 flex flex-col bg-white shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-10">
          <div className="flex border-b border-zinc-50 bg-zinc-50/30">
            {['personal', 'experience', 'education', 'skills'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                className={cn(
                  "flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative",
                  activeSection === tab ? "text-black" : "text-zinc-300 hover:text-zinc-500"
                )}
              >
                {tab}
                {activeSection === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {activeSection === 'personal' && (
              <div className="space-y-6">
                <EditorField label="Full Name" value={resumeData.personal.name} onChange={(v) => setResumeData({...resumeData, personal: {...resumeData.personal, name: v}})} />
                <EditorField label="Job Title" value={resumeData.personal.profession} onChange={(v) => setResumeData({...resumeData, personal: {...resumeData.personal, profession: v}})} />
                <div className="grid grid-cols-2 gap-4">
                  <EditorField label="Email" value={resumeData.personal.email} onChange={(v) => setResumeData({...resumeData, personal: {...resumeData.personal, email: v}})} />
                  <EditorField label="Phone" value={resumeData.personal.phone} onChange={(v) => setResumeData({...resumeData, personal: {...resumeData.personal, phone: v}})} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Profile Summary</label>
                    <button 
                      onClick={async () => {
                        const summary = await generateProfessionalSummary(resumeData);
                        setResumeData({...resumeData, personal: {...resumeData.personal, summary}});
                      }}
                      className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold uppercase tracking-widest"
                    >
                      <Sparkles size={10} /> AI Generate
                    </button>
                  </div>
                  <textarea 
                    value={resumeData.personal.summary}
                    onChange={(e) => setResumeData({...resumeData, personal: {...resumeData.personal, summary: e.target.value}})}
                    className="w-full h-32 bg-white border border-zinc-200 rounded-xl p-4 text-sm font-medium focus:ring-1 focus:ring-black focus:outline-none transition-all resize-none shadow-sm placeholder:text-zinc-300"
                    placeholder="Brief professional overview..."
                  />
                </div>
              </div>
            )}

            {activeSection === 'experience' && (
               <div className="space-y-8">
                 {resumeData.experience.map((exp: any, idx: number) => (
                   <div key={idx} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50">
                     <button 
                        onClick={() => {
                          const newExp = [...resumeData.experience];
                          newExp.splice(idx, 1);
                          setResumeData({...resumeData, experience: newExp});
                        }}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-50"
                      >
                       <Trash2 size={14} />
                      </button>
                     <div className="space-y-4">
                       <input 
                         placeholder="Company Name"
                         value={exp.company}
                         onChange={(e) => {
                           const newExp = [...resumeData.experience];
                           newExp[idx].company = e.target.value;
                           setResumeData({...resumeData, experience: newExp});
                         }}
                         className="w-full bg-transparent font-bold focus:outline-none placeholder:text-zinc-300 text-lg tracking-tight"
                       />
                       <input 
                         placeholder="Role / Position"
                         value={exp.role}
                         onChange={(e) => {
                           const newExp = [...resumeData.experience];
                           newExp[idx].role = e.target.value;
                           setResumeData({...resumeData, experience: newExp});
                         }}
                         className="w-full bg-transparent text-sm font-semibold text-zinc-500 focus:outline-none placeholder:text-zinc-300"
                       />
                       <div className="flex items-center gap-2">
                          <input 
                            placeholder="2021 - Present"
                            value={exp.duration}
                            onChange={(e) => {
                              const newExp = [...resumeData.experience];
                              newExp[idx].duration = e.target.value;
                              setResumeData({...resumeData, experience: newExp});
                            }}
                            className="bg-transparent text-[11px] font-bold uppercase tracking-wider text-zinc-400 focus:outline-none placeholder:text-zinc-200"
                          />
                       </div>
                       <textarea 
                        placeholder="Key accomplishments..."
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience];
                          newExp[idx].description = e.target.value;
                          setResumeData({...resumeData, experience: newExp});
                        }}
                        className="w-full h-24 bg-white border border-zinc-100 rounded-xl p-3 text-sm font-medium focus:ring-1 focus:ring-black transition-all resize-none shadow-sm placeholder:text-zinc-200"
                       />
                     </div>
                   </div>
                 ))}
                 <button 
                  onClick={() => setResumeData({...resumeData, experience: [...resumeData.experience, { company: '', role: '', duration: '', description: '' }]})}
                  className="w-full py-6 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-zinc-300 hover:text-zinc-500 font-bold"
                 >
                   <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-white transition-colors">
                    <Plus size={20} />
                   </div>
                   <span className="text-[11px] uppercase tracking-widest">Add Experience</span>
                 </button>
               </div>
            )}

            {activeSection === 'skills' && (
              <div className="space-y-6">
                 <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill: string) => (
                      <span key={skill} className="px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold text-zinc-600 flex items-center gap-2 shadow-sm">
                        {skill}
                        <button 
                          onClick={() => setResumeData({...resumeData, skills: resumeData.skills.filter((s: string) => s !== skill)})}
                          className="text-zinc-300 hover:text-red-500"
                        >×</button>
                      </span>
                    ))}
                 </div>
                 <div className="relative">
                   <input 
                      placeholder="Type a skill and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const v = (e.target as HTMLInputElement).value;
                          if (v && !resumeData.skills.includes(v)) {
                            setResumeData({...resumeData, skills: [...resumeData.skills, v]});
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className="w-full h-14 bg-white border border-zinc-200 rounded-2xl px-6 text-sm font-medium focus:ring-1 focus:ring-black focus:outline-none shadow-sm placeholder:text-zinc-300"
                   />
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-300 uppercase tracking-widest pointer-events-none">Press Enter</div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex-1 bg-zinc-100/50 overflow-y-auto p-12 flex justify-center custom-scrollbar">
          <div className="w-[820px] min-h-[1160px] bg-white text-black p-20 shadow-2xl origin-top transition-all border border-zinc-100">
             {/* Modern Minimal Template */}
             <div className="max-w-3xl mx-auto space-y-12 font-sans">
               <header className="space-y-6 border-b border-zinc-100 pb-10">
                 <div className="space-y-2">
                    <h2 className="text-5xl font-bold tracking-tighter mb-2">{resumeData.personal.name || 'Your Name'}</h2>
                    <p className="text-lg font-bold text-blue-600 uppercase tracking-[0.2em] text-[13px]">{resumeData.personal.profession || 'Professional Title'}</p>
                 </div>
                 <div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
                   {resumeData.personal.email && (
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-300">Email</span>
                      <span className="text-black">{resumeData.personal.email}</span>
                    </div>
                   )}
                   {resumeData.personal.phone && (
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-300">Phone</span>
                      <span className="text-black">{resumeData.personal.phone}</span>
                    </div>
                   )}
                   {resumeData.personal.location && (
                    <div className="flex flex-col gap-1">
                      <span className="text-zinc-300">Location</span>
                      <span className="text-black">{resumeData.personal.location}</span>
                    </div>
                   )}
                 </div>
               </header>

               {resumeData.personal.summary && (
                 <section className="grid grid-cols-[140px_1fr] gap-10">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300 mt-1">Profile</h3>
                    <p className="text-[14px] leading-relaxed text-zinc-800 font-medium">{resumeData.personal.summary}</p>
                 </section>
               )}

               <section className="space-y-10">
                 <div className="grid grid-cols-[140px_1fr] gap-10">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300 mt-1">Experience</h3>
                    <div className="space-y-10">
                      {resumeData.experience.map((exp: any, i: number) => (
                        <div key={i} className="space-y-3">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-lg leading-none tracking-tight">{exp.role || 'Job Position'}</p>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{exp.duration || 'Date Range'}</span>
                            </div>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{exp.company || 'Organization'}</p>
                            <p className="text-[14px] leading-relaxed text-zinc-600 font-medium whitespace-pre-wrap">{exp.description || 'Description of your impact...'}</p>
                        </div>
                      ))}
                    </div>
                 </div>
               </section>

               {resumeData.skills.length > 0 && (
                 <section className="grid grid-cols-[140px_1fr] gap-10">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300 mt-1">Foundations</h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 text-black text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm">{skill}</span>
                      ))}
                    </div>
                 </section>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 focus:ring-1 focus:ring-black focus:outline-none transition-all text-sm font-medium shadow-sm placeholder:text-zinc-300"
      />
    </div>
  );
}
