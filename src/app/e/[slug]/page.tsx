"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Upload, Loader2, PartyPopper, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface EventData {
  _id: string;
  title: string;
  steps: any[];
  pageConfig: any;
}

export default function PublicEventForm() {
  const params = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${params.slug}`);
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) fetchEvent();
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
       <div className="relative">
         <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
         <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-10 h-10 bg-indigo-500/10 rounded-full animate-pulse" />
         </div>
       </div>
       <p className="mt-8 text-slate-400 font-black tracking-widest uppercase text-xs">Loading Event Engine</p>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
       <div className="space-y-4">
          <h1 className="text-4xl font-black text-white italic tracking-tighter">EVENT NOT FOUND</h1>
          <p className="text-slate-500 font-medium">The link you're trying to access is invalid or expired.</p>
          <button onClick={() => router.push('/')} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold">Return Home</button>
       </div>
    </div>
  );

  const steps = event.steps || [];
  const currentStep = steps[currentStepIdx];
  const isLastStep = currentStepIdx === steps.length - 1;

  const handleNext = async () => {
    // Validate current step fields
    const stepFields = currentStep.fields;
    for (const field of stepFields) {
      if (field.required && !formData[field.id]) {
        return alert(`${field.label} is required.`);
      }
    }

    if (!isLastStep) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const finalData = { ...formData };
      
      // Handle all file uploads across all steps
      for (const step of steps) {
        for (const field of step.fields) {
          if (field.type === 'file' && formData[field.id] instanceof File) {
            const file = formData[field.id];
            const uploadData = new FormData();
            uploadData.append('file', file);
            
            const res = await fetch(`/api/upload-simple`, { 
              method: 'POST', 
              body: uploadData 
            });
            const { url } = await res.json();
            finalData[field.id] = url;
          }
        }
      }

      // Submit response
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event._id,
          data: finalData
        }),
      });
      const submission = await response.json();
      router.push(`/v/${submission._id}`);
    } catch (err) {
      alert("Error submitting. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-indigo-500/30">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1.5 bg-white/5 z-50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
              className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
            />
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div 
            key={currentStepIdx}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-2xl w-full bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 lg:p-16 shadow-4xl relative overflow-hidden"
          >
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />

             <header className="mb-12 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      Step {currentStepIdx + 1} of {steps.length}
                   </div>
                   <div className="h-px flex-1 bg-white/5" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase">{currentStep.title}</h1>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">{currentStep.description}</p>
             </header>

             <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-10">
                <div className="space-y-8">
                   {currentStep.fields.map((field: any) => (
                      <div key={field.id} className="space-y-3">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                         
                         {field.type === 'text' && (
                           <input 
                             type="text"
                             required={field.required}
                             value={formData[field.id] || ""}
                             onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-800"
                             placeholder={field.placeholder || "Type here..."}
                           />
                         )}

                         {field.type === 'file' && (
                           <label className="relative group block cursor-pointer transition-all">
                             <input 
                               type="file"
                               required={field.required}
                               className="hidden"
                               onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setFormData({ ...formData, [field.id]: file });
                               }}
                             />
                             <div className={`flex items-center gap-6 p-6 rounded-2xl border-2 border-dashed transition-all ${formData[field.id] ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                                {formData[field.id] ? (
                                  <>
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-2xl">
                                      <Image 
                                        src={URL.createObjectURL(formData[field.id])} 
                                        alt="Preview" 
                                        fill 
                                        className="object-cover" 
                                      />
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-sm font-bold text-white mb-1">Photo Selection</p>
                                       <p className="text-xs font-medium text-slate-500 truncate max-w-[200px]">{formData[field.id].name}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                       <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                       <Upload className="w-8 h-8" />
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold text-white mb-1">Upload Required Photo</p>
                                       <p className="text-xs font-medium text-slate-500">Tap to select from gallery</p>
                                    </div>
                                  </>
                                )}
                             </div>
                           </label>
                         )}

                         {field.type === 'date' && (
                           <input 
                             type="date"
                             required={field.required}
                             onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                           />
                         )}
                      </div>
                   ))}
                </div>

                <div className="flex gap-4 pt-10 border-t border-white/5">
                  {currentStepIdx > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setCurrentStepIdx(currentStepIdx - 1)}
                      className="px-8 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-[1.5rem] transition-all font-black text-xs uppercase tracking-widest"
                    >
                      Back
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-20 flex items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-4 rounded-[2rem] shadow-2xl shadow-indigo-600/20 active:translate-y-1 transition-all group"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                        <span className="uppercase tracking-[0.2em] text-sm">PROCESSING...</span>
                      </>
                    ) : (
                      <>
                        <span className="uppercase tracking-[0.2em] text-sm">{isLastStep ? "GENERATE VISUAL" : "CONTINUE JOURNEY"}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
             </form>
          </motion.div>
        </div>
    </div>
  );
}
