"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Download, House, Share2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import canvasConfetti from "canvas-confetti";

export default function VisualAdPage() {
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const renderAd = async () => {
      try {
        const submissionRes = await fetch(`/api/submissions?id=${params.submissionId}`);
        const submission = await submissionRes.json();
        
        const eventRes = await fetch(`/api/events/${submission.eventId}`);
        const eventData = await eventRes.json();
        setEvent(eventData);

        let filledHtml = eventData.templateHtml;
        
        // Dynamic replacement based on data map
        const dataMap = submission.data;
        Object.keys(dataMap).forEach(key => {
          const val = dataMap[key];
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          filledHtml = filledHtml.replace(regex, val);
        });

        setHtmlContent(filledHtml);

        // Trigger confetti if enabled
        if (eventData.pageConfig?.showConfetti) {
          setTimeout(() => {
            canvasConfetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: [eventData.pageConfig.primaryColor, '#ffffff', '#ffd700']
            });
          }, 500);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.submissionId) renderAd();
  }, [params.submissionId, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
       <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
       <p className="text-slate-500 font-black tracking-widest uppercase text-[10px]">Generating Masterpiece</p>
    </div>
  );

  const config = event?.pageConfig || {};
  const isDark = config.theme === 'dark';

  return (
    <div 
      className={`min-h-screen p-6 lg:p-12 flex flex-col items-center gap-12 relative overflow-x-hidden transition-colors duration-1000`}
      style={{ backgroundColor: config.backgroundColor || (isDark ? '#020617' : '#f8fafc') }}
    >
       {/* Background Aesthetics */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div 
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-pulse" 
            style={{ backgroundColor: config.primaryColor || '#4f46e5' }}
          />
          <div 
            className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10" 
            style={{ backgroundColor: config.primaryColor || '#4f46e5' }}
          />
       </div>

       <header className="relative z-10 text-center space-y-4">
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-[2rem] shadow-2xl"
            style={{ backgroundColor: config.primaryColor || '#4f46e5' }}
          >
             <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className={`text-4xl font-black italic tracking-tighter uppercase lg:text-7xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
             Visualization Ready
          </h1>
          <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'} text-lg font-bold uppercase tracking-widest text-xs`}>Personalized for your engagement</p>
       </header>

       {/* The Main Visual Container - Takes "Whole Page Design" spirit by giving full width/freedom */}
       <motion.div 
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         className="relative z-10 w-full max-w-5xl flex items-center justify-center"
       >
          <div className="w-full">
             <div 
               dangerouslySetInnerHTML={{ __html: htmlContent }} 
               className="w-full flex items-center justify-center all-initial"
             />
          </div>
       </motion.div>

       <footer className="relative z-10 flex flex-wrap justify-center gap-6 mt-12 mb-20">
          <button 
            onClick={() => window.print()}
            className="px-12 py-6 bg-white text-slate-950 font-black rounded-full hover:scale-105 transition-all shadow-4xl flex items-center gap-3 group"
          >
             <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
             <span className="uppercase tracking-widest text-xs">Download Creative</span>
          </button>
          
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
            className="px-12 py-6 text-white font-black rounded-full transition-all shadow-2xl flex items-center gap-3 group border border-white/10 backdrop-blur-xl hover:bg-white/5"
            style={{ backgroundColor: `${config.primaryColor}22` }}
          >
             <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
             <span className="uppercase tracking-widest text-xs">Share Connection</span>
          </button>

          <button 
            onClick={() => router.push("/admin")}
            className="p-6 bg-slate-800/50 backdrop-blur-xl text-white rounded-full hover:bg-slate-700 transition-all border border-white/5"
          >
             <House className="w-6 h-6" />
          </button>
       </footer>

       {/* Export Helper Instructions */}
       <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">MR Engagement Engine v2.0</p>
       </div>
    </div>
  );
}
