import { useState, useRef, useEffect } from 'react';
import { aiCareerCoach } from '../lib/gemini';
import Layout from '../components/Layout';
import { 
  Send, 
  Sparkles, 
  User, 
  Zap, 
  Target, 
  BookOpen, 
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function CareerCoach() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your ElevateAI Career Coach. How can I help you accelerate your professional journey today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await aiCareerCoach(userMessage, messages);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const SUGGESTIONS = [
    { label: 'Critique my Resume', icon: <Target size={14} /> },
    { label: 'Mock Interview', icon: <BrainCircuit size={14} /> },
    { label: 'Salary Negotiation', icon: <TrendingUp size={14} /> },
    { label: 'Skill Recommendations', icon: <BookOpen size={14} /> },
  ];

  return (
    <Layout>
      <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 tracking-tight">
              Career Coach
              <Sparkles className="text-blue-500" />
            </h1>
            <p className="text-zinc-500 font-medium">AI-powered mentorship for the modern workforce.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none">
            <Zap size={14} className="fill-blue-600" />
            Utility Engine Active
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Chat Window */}
          <div className="flex flex-col rounded-3xl bg-white border border-zinc-100 shadow-sm overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-4 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      msg.role === 'user' ? "bg-[#0a0a0a] border-[#0a0a0a] text-white" : "bg-zinc-100 border-zinc-200 text-zinc-400"
                    )}>
                      {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                    </div>
                    <div className={cn(
                      "p-5 rounded-2xl text-sm leading-relaxed font-medium shadow-sm",
                      msg.role === 'user' ? "bg-white border border-zinc-100 text-zinc-800" : "bg-blue-50 text-zinc-900 border border-blue-100"
                    )}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <div className="flex gap-4 max-w-[80%]">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center animate-pulse">
                    <Sparkles size={20} />
                  </div>
                  <div className="flex items-center gap-1 p-5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
              <div className="flex flex-wrap gap-2 mb-4">
                {SUGGESTIONS.map((s) => (
                  <button 
                    key={s.label}
                    onClick={() => setInput(s.label)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-50 hover:border-zinc-300 transition-all text-zinc-400 hover:text-black shadow-sm"
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Coach anything..."
                  className="w-full h-14 bg-white border border-zinc-200 rounded-2xl pl-6 pr-16 focus:ring-1 focus:ring-black focus:outline-none transition-all text-sm font-medium"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-2 w-10 h-10 bg-[#0a0a0a] text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 active:scale-95 shadow-lg"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Tips Sidebar */}
          <div className="hidden lg:block space-y-6">
             <div className="p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm">
               <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                 <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-[10px] underline">AI</div>
                 Coach Insights
               </h4>
               <p className="text-xs text-zinc-500 leading-relaxed mb-4 font-medium">
                "Based on the current market, adding 'Data-Driven Decision Making' to your skills could increase recruitment interest by 20%."
               </p>
               <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                 <div className="w-2/3 h-full bg-blue-600" />
               </div>
               <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">Goal completion: 66%</p>
             </div>

             <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-300 px-2">Market Trends</p>
                <TrendCard label="Remote Roles" value="+12%" up />
                <TrendCard label="Entry Salary" value="$75k" flat />
                <TrendCard label="Cloud Demand" value="+45%" up />
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function TrendCard({ label, value, up, flat }: { label: string, value: string, up?: boolean, flat?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-zinc-100 shadow-sm">
      <span className="text-xs font-bold text-zinc-400">{label}</span>
      <span className={cn(
        "text-xs font-bold",
        up ? "text-green-600" : flat ? "text-blue-600" : "text-zinc-600"
      )}>{value}</span>
    </div>
  );
}
