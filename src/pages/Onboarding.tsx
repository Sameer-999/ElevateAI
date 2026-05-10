import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, GraduationCap, Target, MapPin, Sparkles, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    profession: '',
    experienceLevel: '',
    industry: '',
    location: '',
    careerGoals: [] as string[],
    skills: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      if (!auth.currentUser) return;
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...formData,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'The Basics', desc: 'Tell us a bit about your professional identity' },
    { title: 'Career Goals', desc: 'What are you aiming for next?' },
    { title: 'Your Toolkit', desc: 'What skills define your superpower?' }
  ];

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1a1a1a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-xl w-full relative z-10">
        {/* Progress Bar */}
        <div className="flex gap-3 mb-16">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-700",
                s <= step ? "bg-black" : "bg-zinc-100"
              )} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl font-bold mb-4 tracking-tighter">{steps[step-1].title}</h1>
            <p className="text-zinc-500 font-medium mb-12">{steps[step-1].desc}</p>

            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-3">Current Profession</label>
                  <input 
                    type="text" 
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    placeholder="e.g. Software Engineer, Designer"
                    className="w-full bg-white border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-1 focus:ring-black focus:outline-none transition-all shadow-sm placeholder:text-zinc-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-3">Exp Level</label>
                    <div className="relative">
                      <select 
                        value={formData.experienceLevel}
                        onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                        className="w-full bg-white border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-1 focus:ring-black focus:outline-none transition-all appearance-none shadow-sm"
                      >
                        <option value="">Select Level</option>
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior Level</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-3">Industry</label>
                    <input 
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="e.g. Fintech"
                      className="w-full bg-white border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-1 focus:ring-black focus:outline-none transition-all shadow-sm placeholder:text-zinc-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-4">
                 {['Internship', 'Full-time Role', 'Freelance Projects', 'Remote Only', 'Growth at Current Job'].map((goal) => (
                   <button
                    key={goal}
                    onClick={() => {
                      const goals = formData.careerGoals.includes(goal) 
                        ? formData.careerGoals.filter(g => g !== goal)
                        : [...formData.careerGoals, goal];
                      setFormData({...formData, careerGoals: goals});
                    }}
                    className={cn(
                      "flex items-center justify-between p-6 border rounded-2xl transition-all font-bold text-sm uppercase tracking-widest text-left",
                      formData.careerGoals.includes(goal) 
                        ? "border-black bg-zinc-50 text-black shadow-lg shadow-zinc-100" 
                        : "border-zinc-100 bg-white hover:border-zinc-300 text-zinc-400 shadow-sm"
                    )}
                   >
                     {goal}
                     {formData.careerGoals.includes(goal) && <CheckCircle size={18} className="text-black" />}
                   </button>
                 ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {formData.skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                      >
                        {skill}
                        <button onClick={() => setFormData({...formData, skills: formData.skills.filter(s => s !== skill)})} className="opacity-50 hover:opacity-100">×</button>
                      </span>
                    ))}
                  </div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 block mb-3">Add Skills (Press Enter)</label>
                  <input 
                    type="text" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value;
                        if (val && !formData.skills.includes(val)) {
                          setFormData({...formData, skills: [...formData.skills, val]});
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    placeholder="e.g. React, UI Design, Strategy"
                    className="w-full bg-white border border-zinc-200 rounded-2xl p-5 text-sm font-medium focus:ring-1 focus:ring-black focus:outline-none transition-all shadow-sm placeholder:text-zinc-300"
                  />
                </div>
                <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 flex gap-4 shadow-sm items-start">
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Sparkles size={16} />
                   </div>
                   <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    <span className="font-bold text-black uppercase tracking-widest text-[9px] block mb-1">Coach Suggestion</span>
                    AI Tip: Adding 'Problem Solving' and 'Cross-functional Collaboration' increases ATS match rates by 15% in your industry.
                   </p>
                </div>
              </div>
            )}

            <div className="mt-16 flex items-center justify-between">
              {step > 1 ? (
                <button 
                  onClick={handlePrev}
                  className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors font-bold text-sm uppercase tracking-widest"
                >
                  <ChevronLeft size={18} /> Back
                </button>
              ) : <div />}
              
              <button
                disabled={loading}
                onClick={step === 3 ? completeOnboarding : handleNext}
                className="group px-10 py-4 bg-[#0a0a0a] text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 shadow-2xl shadow-zinc-200 active:scale-95"
              >
                {loading ? 'Processing...' : step === 3 ? 'Sync Dashboard' : 'Continue'}
                {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
