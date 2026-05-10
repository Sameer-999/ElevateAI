import Layout from '../components/Layout';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, Save, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'profile' | 'notifications' | 'security' | 'billing';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    profession: '',
    industry: '',
    onboardingComplete: true
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as any);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), profile);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Settings</h1>
          <p className="text-zinc-500 font-medium">Manage your account preferences and professional identity.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12">
          {/* Sidebar Tabs */}
          <div className="space-y-1">
            <TabButton 
              icon={<User size={18} />} 
              label="Profile" 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
            />
            <TabButton 
              icon={<Bell size={18} />} 
              label="Notifications" 
              active={activeTab === 'notifications'} 
              onClick={() => setActiveTab('notifications')}
            />
            <TabButton 
              icon={<Shield size={18} />} 
              label="Security" 
              active={activeTab === 'security'} 
              onClick={() => setActiveTab('security')}
            />
            <TabButton 
              icon={<CreditCard size={18} />} 
              label="Billing" 
              active={activeTab === 'billing'} 
              onClick={() => setActiveTab('billing')}
            />
          </div>

          {/* Form Content */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-sm relative overflow-hidden min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <section>
                    <h3 className="text-lg font-bold mb-6 tracking-tight">Professional Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Display Name</label>
                        <input 
                          type="text" 
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-sm font-medium focus:ring-1 focus:ring-black outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Profession</label>
                        <input 
                          type="text" 
                          value={profile.profession}
                          onChange={(e) => setProfile({...profile, profession: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-sm font-medium focus:ring-1 focus:ring-black outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Industry</label>
                        <input 
                          type="text" 
                          value={profile.industry}
                          onChange={(e) => setProfile({...profile, industry: e.target.value})}
                          className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-sm font-medium focus:ring-1 focus:ring-black outline-none transition-all"
                        />
                      </div>
                    </div>
                  </section>

                  <div className="pt-8 border-t border-zinc-100 flex items-center justify-between">
                    <p className="text-xs text-zinc-400 font-medium">Last updated: Just now</p>
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-[#0a0a0a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      <Save size={14} />
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div 
                  key="notifications"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <h3 className="text-lg font-bold mb-6 tracking-tight">Email Notifications</h3>
                  <div className="space-y-4">
                    <NotificationToggle label="Resume Tips" desc="Weekly insights on resume optimization." defaultChecked />
                    <NotificationToggle label="Portfolio Views" desc="Get notified when someone views your site." defaultChecked />
                    <NotificationToggle label="Market Updates" desc="Briefings on industry recruitment trends." />
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <h3 className="text-lg font-bold mb-6 tracking-tight">Security & Privacy</h3>
                  <div className="space-y-6">
                    <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">Two-Factor Authentication</p>
                        <p className="text-xs text-zinc-400">Add an extra layer of security to your account.</p>
                      </div>
                      <button className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-all">Enable</button>
                    </div>
                    <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold">Session Management</p>
                        <p className="text-xs text-zinc-400">View and manage your active sessions.</p>
                      </div>
                      <button className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-all">View</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'billing' && (
                <motion.div 
                  key="billing"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <h3 className="text-lg font-bold mb-6 tracking-tight">Plan & Billing</h3>
                  <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Current Plan</p>
                        <p className="text-2xl font-bold">Premium Pro</p>
                      </div>
                      <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase">Active</div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs opacity-60">Renews on August 12, 2026</p>
                        <p className="text-sm font-bold">$12.00 / mo</p>
                      </div>
                      <button className="px-6 py-2 bg-white text-indigo-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-95 transition-all">View Stats</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Payment Method</p>
                    <div className="flex items-center justify-between p-5 border border-zinc-100 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-6 bg-zinc-100 rounded border border-zinc-200"></div>
                        <p className="text-sm font-bold">•••• •••• •••• 4242</p>
                      </div>
                      <button className="text-xs font-bold text-blue-600 hover:underline">Edit</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all",
        active ? "bg-zinc-100 text-black shadow-sm" : "text-zinc-400 hover:text-black hover:bg-zinc-50"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {active && <ChevronRight size={14} />}
    </button>
  );
}

function NotificationToggle({ label, desc, defaultChecked = false }: { label: string, desc: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-zinc-400">{desc}</p>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={cn(
          "w-10 h-5 rounded-full relative transition-all",
          checked ? "bg-black" : "bg-zinc-200"
        )}
      >
        <div className={cn(
          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
          checked ? "left-6" : "left-1"
        )} />
      </button>
    </div>
  );
}

