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
  Target,
  UserCheck,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import BrandKitModal from '../components/BrandKitModal';

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [resumeData, setResumeData] = useState<any>({
    title: 'Untitled Resume',
    templateId: 'modern',
    personal: { name: '', email: '', phone: '', location: '', website: '', summary: '', profession: '' },
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
        const data = docSnap.data();
        setResumeData((prev: any) => ({
          ...prev,
          ...data,
          templateId: data.templateId || 'modern',
          personal: { ...prev.personal, ...(data.personal || {}) },
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || [],
          projects: data.projects || []
        }));
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
          <div className="flex border-b border-zinc-50 bg-zinc-50/30 overflow-x-auto custom-scrollbar no-scrollbar">
            {['template', 'personal', 'experience', 'education', 'skills', 'projects'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                className={cn(
                  "flex-1 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
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
            {activeSection === 'template' && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight">Select Template</h3>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed">Choose a layout that best represents your professional brand and industry.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'modern', name: 'Modern Minimal', color: 'bg-blue-600' },
                    { id: 'executive', name: 'Executive Pro', color: 'bg-[#1a1a1a]' },
                    { id: 'elegant', name: 'Elegant Serif', color: 'bg-indigo-600' },
                    { id: 'highimpact', name: 'High Impact', color: 'bg-rose-600' }
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setResumeData({...resumeData, templateId: tpl.id})}
                      className={cn(
                        "group relative aspect-[3/4] rounded-2xl border-2 transition-all overflow-hidden p-2 flex flex-col items-center justify-center gap-3",
                        resumeData.templateId === tpl.id 
                          ? "border-black shadow-xl scale-105" 
                          : "border-zinc-100 hover:border-zinc-300 bg-zinc-50"
                      )}
                    >
                      <div className={cn("w-12 h-16 rounded-lg opacity-20", tpl.color)} />
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", resumeData.templateId === tpl.id ? "text-black" : "text-zinc-400")}>
                        {tpl.name}
                      </span>
                      {resumeData.templateId === tpl.id && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsBrandKitOpen(true)}
                        className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md"
                      >
                        <UserCheck size={10} /> Brand Kit
                      </button>
                      <button 
                        onClick={async () => {
                          const summary = await generateProfessionalSummary(resumeData);
                          setResumeData({...resumeData, personal: {...resumeData.personal, summary}});
                        }}
                        className="text-[10px] flex items-center gap-1 text-zinc-400 hover:text-black font-bold uppercase tracking-widest"
                      >
                        <Sparkles size={10} /> Fast Gen
                      </button>
                    </div>
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
                 {resumeData.experience.length === 0 && (
                   <div className="p-8 border-2 border-dashed border-zinc-100 rounded-3xl text-center space-y-3 bg-zinc-50/50">
                     <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No work experience yet?</p>
                     <p className="text-xs text-zinc-400">If you're a student or first-time job seeker, focus on your <button onClick={() => setActiveSection('projects')} className="text-blue-600 hover:underline">Projects</button> or Academic achievements.</p>
                   </div>
                 )}
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

            {activeSection === 'education' && (
               <div className="space-y-8">
                 {resumeData.education.map((edu: any, idx: number) => (
                   <div key={idx} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50">
                     <button 
                        onClick={() => {
                          const newEdu = [...resumeData.education];
                          newEdu.splice(idx, 1);
                          setResumeData({...resumeData, education: newEdu});
                        }}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-50"
                      >
                       <Trash2 size={14} />
                      </button>
                     <div className="space-y-4">
                       <input 
                         placeholder="School / University"
                         value={edu.school}
                         onChange={(e) => {
                           const newEdu = [...resumeData.education];
                           newEdu[idx].school = e.target.value;
                           setResumeData({...resumeData, education: newEdu});
                         }}
                         className="w-full bg-transparent font-bold focus:outline-none placeholder:text-zinc-300 text-lg tracking-tight"
                       />
                       <input 
                         placeholder="Degree / Certification"
                         value={edu.degree}
                         onChange={(e) => {
                           const newEdu = [...resumeData.education];
                           newEdu[idx].degree = e.target.value;
                           setResumeData({...resumeData, education: newEdu});
                         }}
                         className="w-full bg-transparent text-sm font-semibold text-zinc-500 focus:outline-none placeholder:text-zinc-300"
                       />
                       <div className="grid grid-cols-2 gap-4">
                          <input 
                            placeholder="Duration (e.g. 2018 - 2022)"
                            value={edu.duration}
                            onChange={(e) => {
                              const newEdu = [...resumeData.education];
                              newEdu[idx].duration = e.target.value;
                              setResumeData({...resumeData, education: newEdu});
                            }}
                            className="bg-transparent text-[11px] font-bold uppercase tracking-wider text-zinc-400 focus:outline-none placeholder:text-zinc-200"
                          />
                          <input 
                            placeholder="Location"
                            value={edu.location}
                            onChange={(e) => {
                              const newEdu = [...resumeData.education];
                              newEdu[idx].location = e.target.value;
                              setResumeData({...resumeData, education: newEdu});
                            }}
                            className="bg-transparent text-[11px] font-bold uppercase tracking-wider text-zinc-400 focus:outline-none placeholder:text-zinc-200 text-right"
                          />
                       </div>
                     </div>
                   </div>
                 ))}
                 <button 
                  onClick={() => setResumeData({...resumeData, education: [...resumeData.education, { school: '', degree: '', duration: '', location: '' }]})}
                  className="w-full py-6 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-zinc-300 hover:text-zinc-500 font-bold"
                 >
                   <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-white transition-colors">
                    <Plus size={20} />
                   </div>
                   <span className="text-[11px] uppercase tracking-widest">Add Education</span>
                 </button>
               </div>
            )}

            {activeSection === 'skills' && (
              <div className="space-y-8">
                 <div className="grid grid-cols-1 gap-4">
                    {(resumeData.skills || []).map((skill: any, idx: number) => {
                      const isString = typeof skill === 'string';
                      const skillName = isString ? skill : (skill.name || '');
                      const skillLevel = isString ? 'Intermediate' : (skill.level || 'Intermediate');
                      
                      return (
                        <div key={idx} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between group">
                          <div className="flex-1 space-y-1">
                            <input 
                              value={skillName}
                              onChange={(e) => {
                                const newSkills = [...resumeData.skills];
                                newSkills[idx] = { name: e.target.value, level: skillLevel };
                                setResumeData({...resumeData, skills: newSkills});
                              }}
                              className="bg-transparent font-bold text-sm focus:outline-none w-full"
                              placeholder="Skill name..."
                            />
                            <div className="flex gap-4">
                              {['Beginner', 'Intermediate', 'Expert'].map((lvl) => (
                                <button
                                  key={lvl}
                                  onClick={() => {
                                    const newSkills = [...resumeData.skills];
                                    newSkills[idx] = { name: skillName, level: lvl };
                                    setResumeData({...resumeData, skills: newSkills});
                                  }}
                                  className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest transition-all",
                                    skillLevel === lvl 
                                      ? "text-blue-600" 
                                      : "text-zinc-400 hover:text-zinc-600"
                                  )}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const newSkills = [...resumeData.skills];
                              newSkills.splice(idx, 1);
                              setResumeData({...resumeData, skills: newSkills});
                            }}
                            className="p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-bold"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                 </div>
                 
                 <button 
                  onClick={() => setResumeData({...resumeData, skills: [...resumeData.skills, { name: '', level: 'Intermediate' }]})}
                  className="w-full py-4 border-2 border-dashed border-zinc-100 rounded-2xl flex items-center justify-center gap-2 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-zinc-300 hover:text-zinc-500 font-bold"
                 >
                   <Plus size={16} />
                   <span className="text-[10px] uppercase tracking-widest">Add Skill</span>
                 </button>
              </div>
            )}

            {activeSection === 'projects' && (
              <div className="space-y-8">
                {resumeData.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50">
                    <button 
                       onClick={() => {
                         const newProj = [...resumeData.projects];
                         newProj.splice(idx, 1);
                         setResumeData({...resumeData, projects: newProj});
                       }}
                       className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-50"
                     >
                      <Trash2 size={14} />
                     </button>
                    <div className="space-y-4">
                      <input 
                        placeholder="Project Name (e.g. Portfolio App)"
                        value={proj.name}
                        onChange={(e) => {
                          const newProj = [...resumeData.projects];
                          newProj[idx].name = e.target.value;
                          setResumeData({...resumeData, projects: newProj});
                        }}
                        className="w-full bg-transparent font-bold focus:outline-none placeholder:text-zinc-300 text-lg tracking-tight"
                      />
                      <div className="flex gap-4">
                        <input 
                          placeholder="Technologies (React, Firebase)"
                          value={proj.tech}
                          onChange={(e) => {
                            const newProj = [...resumeData.projects];
                            newProj[idx].tech = e.target.value;
                            setResumeData({...resumeData, projects: newProj});
                          }}
                          className="flex-1 bg-transparent text-sm font-semibold text-blue-600 focus:outline-none placeholder:text-blue-200"
                        />
                        <input 
                          placeholder="Link (Optional)"
                          value={proj.link}
                          onChange={(e) => {
                            const newProj = [...resumeData.projects];
                            newProj[idx].link = e.target.value;
                            setResumeData({...resumeData, projects: newProj});
                          }}
                          className="w-32 bg-transparent text-[11px] font-bold text-zinc-400 focus:outline-none placeholder:text-zinc-200 text-right"
                        />
                      </div>
                      <textarea 
                       placeholder="Describe your role and impact..."
                       value={proj.description}
                       onChange={(e) => {
                         const newProj = [...resumeData.projects];
                         newProj[idx].description = e.target.value;
                         setResumeData({...resumeData, projects: newProj});
                       }}
                       className="w-full h-24 bg-white border border-zinc-100 rounded-xl p-3 text-sm font-medium focus:ring-1 focus:ring-black transition-all resize-none shadow-sm placeholder:text-zinc-200"
                      />
                    </div>
                  </div>
                ))}
                <button 
                 onClick={() => setResumeData({...resumeData, projects: [...resumeData.projects, { name: '', tech: '', link: '', description: '' }]})}
                 className="w-full py-6 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-zinc-300 hover:text-zinc-500 font-bold"
                >
                  <div className="p-2 bg-zinc-50 rounded-lg group-hover:bg-white transition-colors">
                   <Plus size={20} />
                  </div>
                  <span className="text-[11px] uppercase tracking-widest">Add Project</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex-1 bg-zinc-100/50 overflow-y-auto p-12 flex justify-center custom-scrollbar relative">
          <div className="w-[820px] min-h-[1160px] bg-white text-black p-20 shadow-2xl origin-top transition-all border border-zinc-100 scale-[0.8] xl:scale-[0.85] 2xl:scale-100">
             {resumeData.templateId === 'modern' && <ModernMinimal resumeData={resumeData} />}
             {resumeData.templateId === 'executive' && <ExecutivePro resumeData={resumeData} />}
             {resumeData.templateId === 'elegant' && <ElegantSerif resumeData={resumeData} />}
             {resumeData.templateId === 'highimpact' && <HighImpact resumeData={resumeData} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isBrandKitOpen && (
          <BrandKitModal 
            isOpen={isBrandKitOpen} 
            onClose={() => setIsBrandKitOpen(false)} 
            userData={resumeData}
            onApplySummary={(summary) => {
              setResumeData({...resumeData, personal: {...resumeData.personal, summary}});
              setIsBrandKitOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ModernMinimal({ resumeData }: { resumeData: any }) {
  return (
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
             {(resumeData.experience || []).map((exp: any, i: number) => (
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

       {resumeData.projects && resumeData.projects.length > 0 && (
        <section className="space-y-10">
          <div className="grid grid-cols-[140px_1fr] gap-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300 mt-1">Projects</h3>
            <div className="space-y-10">
              {(resumeData.projects || []).map((proj: any, i: number) => (
                <div key={i} className="space-y-3">
                   <div className="flex justify-between items-start">
                     <p className="font-bold text-lg leading-none tracking-tight">{proj.name || 'Project Title'}</p>
                     {proj.link && <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">{proj.link}</span>}
                   </div>
                   <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{proj.tech || 'Technologies Used'}</p>
                   <p className="text-[14px] leading-relaxed text-zinc-600 font-medium whitespace-pre-wrap">{proj.description || 'Description of what you built...'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
       )}

      {resumeData.education && resumeData.education.length > 0 && (
        <section className="space-y-10">
           <div className="grid grid-cols-[140px_1fr] gap-10">
               <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300 mt-1">Education</h3>
               <div className="space-y-8">
                 {(resumeData.education || []).map((edu: any, i: number) => (
                   <div key={i} className="space-y-2">
                       <div className="flex justify-between items-start">
                         <p className="font-bold text-[15px] tracking-tight">{edu.degree || 'Degree Title'}</p>
                         <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{edu.duration || '2020 - 2024'}</span>
                       </div>
                       <div className="flex justify-between items-center">
                         <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{edu.school || 'University Name'}</p>
                         <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">{edu.location}</span>
                       </div>
                   </div>
                 ))}
               </div>
           </div>
        </section>
      )}

      {resumeData.skills.length > 0 && (
        <section className="grid grid-cols-[140px_1fr] gap-10">
           <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300 mt-1">Foundations</h3>
           <div className="grid grid-cols-2 gap-4">
             {(resumeData.skills || []).map((skill: any, i: number) => {
               const name = typeof skill === 'string' ? skill : skill.name;
               const level = typeof skill === 'string' ? null : skill.level;
               return (
                 <div key={i} className="space-y-1">
                   <p className="text-[11px] font-bold uppercase tracking-widest">{name}</p>
                   {level && (
                     <div className="flex gap-1">
                       {[1, 2, 3].map(dot => (
                         <div 
                           key={dot} 
                           className={cn(
                             "h-1 w-4 rounded-full",
                             (level === 'Beginner' && dot <= 1) || 
                             (level === 'Intermediate' && dot <= 2) || 
                             (level === 'Expert' && dot <= 3)
                               ? "bg-blue-500" 
                               : "bg-zinc-100"
                           )} 
                         />
                       ))}
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
        </section>
      )}
    </div>
  );
}

function ExecutivePro({ resumeData }: { resumeData: any }) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full font-sans">
      <header className="bg-[#1a1a1a] text-white p-12 -mx-20 -mt-20 mb-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">{resumeData.personal.name || 'Your Name'}</h2>
            <p className="text-xl text-zinc-400 font-medium">{resumeData.personal.profession || 'Professional Title'}</p>
          </div>
          <div className="text-right space-y-1 text-sm text-zinc-400">
            <p>{resumeData.personal.email}</p>
            <p>{resumeData.personal.phone}</p>
            <p>{resumeData.personal.location}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_250px] gap-12">
        <div className="space-y-12">
          {resumeData.personal.summary && (
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] border-b pb-2">Professional Summary</h3>
              <p className="text-[14px] leading-relaxed text-zinc-700">{resumeData.personal.summary}</p>
            </section>
          )}

          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] border-b pb-2">Experience</h3>
            <div className="space-y-10">
              {(resumeData.experience || []).map((exp: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-[16px]">{exp.role}</p>
                    <span className="text-xs text-zinc-400 italic">{exp.duration}</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{exp.company}</p>
                  <p className="text-sm leading-relaxed text-zinc-600">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          {resumeData.projects && resumeData.projects.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] border-b pb-2">Select Projects</h3>
              <div className="grid grid-cols-2 gap-8">
                {(resumeData.projects || []).map((proj: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <p className="font-bold text-sm tracking-tight">{proj.name}</p>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase">{proj.tech}</p>
                    <p className="text-xs text-zinc-600 leading-normal">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-12 border-l pl-12">
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Contact</h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-zinc-400 mb-1">Email</p>
                <p className="font-medium">{resumeData.personal.email}</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-1">Phone</p>
                <p className="font-medium">{resumeData.personal.phone}</p>
              </div>
              <div>
                <p className="text-zinc-400 mb-1">Location</p>
                <p className="font-medium">{resumeData.personal.location}</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Education</h3>
            <div className="space-y-6">
              {(resumeData.education || []).map((edu: any, i: number) => (
                <div key={i} className="space-y-1">
                  <p className="font-bold text-xs">{edu.degree}</p>
                  <p className="text-[11px] text-zinc-500">{edu.school}</p>
                  <p className="text-[10px] italic text-zinc-400">{edu.duration}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Expertise</h3>
            <div className="flex flex-col gap-2">
              {(resumeData.skills || []).map((skill: any, i: number) => {
                const name = typeof skill === 'string' ? skill : skill.name;
                return (
                  <div key={i} className="text-xs font-medium py-1 border-b border-zinc-50 flex items-center justify-between">
                    <span>{name}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ElegantSerif({ resumeData }: { resumeData: any }) {
  return (
    <div className="max-w-3xl mx-auto space-y-10 text-center font-serif">
      <header className="space-y-4 border-b-2 border-zinc-900 pb-12">
        <h2 className="text-5xl font-black italic tracking-tight">{resumeData.personal.name || 'Your Name'}</h2>
        <p className="text-xl text-zinc-600 font-medium tracking-wide uppercase">{resumeData.personal.profession || 'Professional Title'}</p>
        <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-zinc-400 tracking-widest uppercase mt-6">
          <span>{resumeData.personal.email}</span>
          <span>•</span>
          <span>{resumeData.personal.phone}</span>
          <span>•</span>
          <span>{resumeData.personal.location}</span>
        </div>
      </header>

      <div className="text-left space-y-12">
        {resumeData.personal.summary && (
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] border-b pb-1 inline-block">Objective</h3>
            <p className="text-lg leading-relaxed text-zinc-700 italic">{resumeData.personal.summary}</p>
          </section>
        )}

        <section className="space-y-8">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] border-b pb-1 inline-block">Career History</h3>
          <div className="space-y-12">
            {(resumeData.experience || []).map((exp: any, i: number) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="text-left">
                    <p className="text-xl font-bold italic">{exp.role}</p>
                    <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">{exp.company}</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-400">{exp.duration}</span>
                </div>
                <p className="text-[15px] leading-relaxed text-zinc-600 font-serif">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-16">
          <div className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] border-b pb-1 inline-block">Education</h3>
            <div className="space-y-6">
              {(resumeData.education || []).map((edu: any, i: number) => (
                <div key={i} className="text-left space-y-1">
                  <p className="font-bold italic text-base">{edu.degree}</p>
                  <p className="text-xs font-bold uppercase text-zinc-500">{edu.school}</p>
                  <p className="text-xs text-zinc-400 italic">{edu.duration}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] border-b pb-1 inline-block">Specialties</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-start">
              {(resumeData.skills || []).map((skill: any, i: number) => {
                const name = typeof skill === 'string' ? skill : skill.name;
                return (
                  <span key={i} className="text-xs font-bold uppercase tracking-widest text-zinc-600">{name}</span>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HighImpact({ resumeData }: { resumeData: any }) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col font-sans">
      <div className="grid grid-cols-[280px_1fr] flex-1 -mx-20 -my-20">
        {/* Left Column */}
        <div className="bg-[#f0f0f0] p-12 space-y-12 shrink-0">
          <div className="space-y-4">
             <div className="w-20 h-2 bg-rose-600 mb-6" />
             <h2 className="text-4xl font-black leading-[0.9] tracking-tighter uppercase break-words">{resumeData.personal.name || 'Your Name'}</h2>
             <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{resumeData.personal.profession || 'Professional Title'}</p>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 border-b-2 border-zinc-200 pb-2">Connect</h3>
              <div className="space-y-4 text-[11px] font-medium text-zinc-600">
                <div className="space-y-1">
                  <p className="text-zinc-400">Email</p>
                  <p className="text-black">{resumeData.personal.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-400">Phone</p>
                  <p className="text-black">{resumeData.personal.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-400">Location</p>
                  <p className="text-black">{resumeData.personal.location}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 border-b-2 border-zinc-200 pb-2">Education</h3>
              <div className="space-y-6">
                {(resumeData.education || []).map((edu: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs font-bold leading-tight">{edu.degree}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{edu.school}</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{edu.duration}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 border-b-2 border-zinc-200 pb-2">Foundations</h3>
              <div className="flex flex-wrap gap-2">
                {(resumeData.skills || []).map((skill: any, i: number) => {
                  const name = typeof skill === 'string' ? skill : skill.name;
                  return (
                    <span key={i} className="px-2 py-1 bg-white text-[9px] font-bold uppercase tracking-widest border border-zinc-100">{name}</span>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white p-12 space-y-12">
          {resumeData.personal.summary && (
            <section className="space-y-4">
               <h3 className="text-lg font-black uppercase tracking-tighter italic text-rose-600">The Mission</h3>
               <p className="text-[16px] leading-[1.6] font-medium text-zinc-800 tracking-tight">{resumeData.personal.summary}</p>
            </section>
          )}

          <section className="space-y-8">
             <h3 className="text-lg font-black uppercase tracking-tighter italic border-b-4 border-black inline-block">The Journey</h3>
             <div className="space-y-10">
                {(resumeData.experience || []).map((exp: any, i: number) => (
                  <div key={i} className="flex gap-8">
                    <div className="w-32 shrink-0 pt-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{exp.duration}</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                         <p className="text-lg font-black tracking-tighter uppercase">{exp.role}</p>
                         <div className="h-[1px] flex-1 bg-zinc-100" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">{exp.company}</p>
                      <p className="text-[14px] leading-relaxed text-zinc-600 font-medium">{exp.description}</p>
                    </div>
                  </div>
                ))}
             </div>
          </section>

          {resumeData.projects && resumeData.projects.length > 0 && (
            <section className="space-y-8">
               <h3 className="text-lg font-black uppercase tracking-tighter italic border-b-4 border-black inline-block">Artifacts</h3>
               <div className="grid grid-cols-1 gap-6">
                {(resumeData.projects || []).map((proj: any, i: number) => (
                  <div key={i} className="p-6 bg-[#f9f9f9] border border-zinc-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-black uppercase tracking-widest">{proj.name}</p>
                      <span className="text-[10px] font-bold text-zinc-300">{proj.tech}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">{proj.description}</p>
                  </div>
                ))}
               </div>
            </section>
          )}
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
