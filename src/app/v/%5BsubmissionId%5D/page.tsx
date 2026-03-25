"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Download, House, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export default function VisualAdPage() {
  const params = useParams();
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const renderAd = async () => {
      try {
        const submissionRes = await fetch(`/api/submissions?id=${params.submissionId}`);
        const submission = await submissionRes.json();
        
        const eventRes = await fetch(`/api/events/${submission.eventId}`);
        const event = await eventRes.json();

        let filledHtml = event.templateHtml;
        
        // Dynamic replacement based on data map
        const dataMap = submission.data;
        Object.keys(dataMap).forEach(key => {
          const val = dataMap[key];
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          filledHtml = filledHtml.replace(regex, val);
        });

        // Add a print-only style to ensure it fits on A4 or similar
        filledHtml = `
          <style>
            @media print {
              body * { visibility: hidden; }
              #ad-container, #ad-container * { visibility: visible; }
              #ad-container { position: absolute; left: 0; top: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            }
          </style>
          <div id="ad-container" class="all-initial w-full flex items-center justify-center min-h-[500px]">
            ${filledHtml}
          </div>
        `;

        setHtmlContent(filledHtml);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.submissionId) renderAd();
  }, [params.submissionId, router]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
       <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
       <p className="mt-4 text-slate-400 font-medium">Finalizing your visual ad...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-12 text-white flex flex-col items-center gap-12 relative overflow-hidden">
       {/* Background effect */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[150px]" />
       </div>

       <header className="relative z-10 text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600 shadow-lg shadow-blue-500/20"
          >
             <Download className="w-6 h-6" />
          </motion.div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
             Personalization Complete
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80">Download or Export your personalized visual below</p>
       </header>

       <div className="relative z-10 w-full max-w-4xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-4xl shadow-black/50 overflow-hidden min-h-[600px] flex items-center justify-center group">
          <div className="w-full flex items-center justify-center p-8 lg:p-12 all-initial">
             <div 
               dangerouslySetInnerHTML={{ __html: htmlContent }} 
               className="w-full flex items-center justify-center"
             />
          </div>
       </div>

       <footer className="relative z-10 flex gap-4">
          <button 
            onClick={() => window.print()}
            className="px-10 py-5 bg-white text-slate-950 font-black rounded-full hover:scale-105 transition-all shadow-xl shadow-white/10 flex items-center gap-2 group"
          >
             <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
             <span>Export as PDF/Image</span>
          </button>
          
          <button 
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="px-10 py-5 bg-blue-600 text-white font-black rounded-full border border-blue-400 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 group"
          >
             <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
             <span>Share Connection</span>
          </button>

          <button 
            onClick={() => router.push("/admin")}
            className="p-5 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-all border border-slate-700"
          >
             <House className="w-5 h-5" />
          </button>
       </footer>
    </div>
  );
}
