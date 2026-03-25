"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Rocket, Ghost, Calendar, PartyPopper } from "lucide-react";
import Image from "next/image";
import confetti from "canvas-confetti";

interface DoctorData {
  _id: string;
  doctorName: string;
  imageUrl: string;
  templateType: string;
}

const templates: Record<string, {
  title: string;
  message: string;
  bg: string;
  accent: string;
  icon: any;
}> = {
  womensday: {
    title: "Happy International Women's Day",
    message: "Thank you for being an inspiration to all women in medicine. Your dedication and compassion are truly remarkable.",
    bg: "bg-pink-900 border-pink-500 shadow-pink-500/20",
    accent: "text-pink-300",
    icon: Heart,
  },
  rakshabandhan: {
    title: "Happy Raksha Bandhan",
    message: "Thank you for the care and protection you provide to your patients. Your selfless service is truly commendable.",
    bg: "bg-orange-900 border-orange-500 shadow-orange-500/20",
    accent: "text-orange-300",
    icon: Sparkles,
  },
  general: {
    title: "Thank You, Doctor!",
    message: "Your hard work and dedication to your patients are truly inspiring. We are grateful for everything you do.",
    bg: "bg-blue-900 border-blue-500 shadow-blue-500/20",
    accent: "text-cyan-300",
    icon: Rocket,
  },
};

export default function DoctorPage() {
  const params = useParams();
  const [data, setData] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const res = await fetch(`/api/responses/${id}`);
        if (!res.ok) throw new Error("Could not fetch data.");
        const json = await res.json();
        setData(json);
        
        // Trigger confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#2563eb", "#8b5cf6", "#f43f5e"]
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchResponse();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="text-slate-400 font-medium animate-pulse">Personalizing your experience...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 gap-6">
        <Ghost className="w-20 h-20 text-slate-800" />
        <h1 className="text-2xl font-bold font-white">Greeting Not Found</h1>
        <button onClick={() => router.push("/")} className="px-6 py-2 bg-blue-600 rounded-lg text-white font-medium">Go Back</button>
      </div>
    );
  }

  const template = templates[data.templateType] || templates.general;
  const Icon = template.icon;

  return (
    <div className={`min-h-screen ${template.bg} overflow-hidden p-6 lg:p-12 text-white relative`}>
      <div className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-50 grayscale mix-blend-overlay" style={{ backgroundImage: `url(${data.imageUrl})` }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring" }}
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-12 h-full justify-center min-h-[85vh]"
      >
        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-2 ${template.bg} shadow-2xl backdrop-blur-xl mb-4`}
          >
            <Icon className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-5xl lg:text-7xl font-black tracking-tight drop-shadow-lg"
          >
            {template.title}
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 1, duration: 0.8 }}
            className="h-1 bg-white mx-auto rounded-full"
          />
        </div>

        <div className="relative group cursor-pointer">
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
            className="relative w-64 h-64 lg:w-96 lg:h-96 rounded-3xl overflow-hidden border-8 border-white/10 shadow-3xl shadow-white/5 group-hover:scale-105 transition-transform duration-500"
          >
            <Image 
              src={data.imageUrl} 
              alt={data.doctorName} 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 256px, 384px"
              priority
            />
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 1.2 }}
             className="absolute -bottom-6 -left-6 bg-white py-4 px-8 rounded-2xl shadow-2xl shadow-black/50"
          >
            <p className="text-slate-900 font-black text-xl lg:text-3xl">
              {data.doctorName}
            </p>
          </motion.div>
          
          <div className="absolute -top-10 -right-10 opacity-20 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
             <PartyPopper className="w-24 h-24" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="max-w-xl mx-auto space-y-8"
        >
          <p className={`text-xl lg:text-2xl font-medium leading-relaxed ${template.accent}`}>
             {template.message}
          </p>
          
          <div className="flex items-center justify-center gap-6 pt-8 border-t border-white/10">
            <div className="flex flex-col items-center gap-1">
               <Calendar className="w-6 h-6 text-slate-400" />
               <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Event Day </p>
            </div>
            <div className="w-1px h-10 bg-white/10" />
            <div className="flex flex-col items-center gap-1">
               <Heart className="w-6 h-6 text-rose-500" />
               <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">With Respect</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4">
         <button 
           onClick={() => window.print()}
           className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all font-bold text-sm"
         >
           Export Greeting
         </button>
         <button 
           onClick={() => navigator.clipboard.writeText(window.location.href)}
           className="px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-500/30 text-sm"
         >
           Share Link
         </button>
      </div>
    </div>
  );
}
