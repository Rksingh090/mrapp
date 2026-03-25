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

  const renderField = (fieldId: string) => {
    const field = currentStep.fields.find((f: any) => f.id === fieldId);
    if (!field) return <span className="text-rose-500 font-bold underline">Field "{fieldId}" not found</span>;

    return (
      <div key={field.id} className="inline-block w-full max-w-md text-left align-middle mx-auto">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">{field.label}</label>
        {field.type === 'text' && (
          <input 
            type="text"
            required={field.required}
            value={formData[field.id] || ""}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-800"
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
                  <div className="flex items-center gap-4 w-full">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={URL.createObjectURL(formData[field.id])} alt="Preview" fill className="object-cover" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 truncate flex-1">{formData[field.id].name}</p>
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                     <Upload className="w-6 h-6 text-slate-500" />
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select {field.label}</p>
                  </div>
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
    );
  };

  const renderStepContent = () => {
    if (!currentStep.templateHtml) {
      return (
        <div className="space-y-8">
           {currentStep.fields.map((field: any) => (
              <div key={field.id}>{renderField(field.id)}</div>
           ))}
        </div>
      );
    }

    // Split HTML by template placeholders {{field:id}}
    const parts = currentStep.templateHtml.split(/\{\{field:(.*?)\}\}/g);
    
    return (
      <div className="custom-step-html">
        {parts.map((part: string, i: number) => {
          if (i % 2 === 0) {
            // This is raw HTML
            return <div key={i} dangerouslySetInnerHTML={{ __html: part }} className="inline" />;
          } else {
            // This is a field index
            return <div key={i} className="my-4">{renderField(part)}</div>;
          }
        })}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden"
      style={{ 
        backgroundColor: event.pageConfig?.backgroundColor || '#020617',
        color: event.pageConfig?.theme === 'light' ? '#0f172a' : '#ffffff' 
      }}
    >
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1.5 bg-white/5 z-50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
              className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
            />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative p-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStepIdx}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
               {/* Fixed Header Overlay (Optional, but useful to keep context) */}
               <div className="mb-8 text-center opacity-30 pointer-events-none sticky top-12 z-10">
                  <p className="text-[10px] font-black tracking-[0.4em] uppercase">Step {currentStepIdx + 1} / {steps.length}</p>
               </div>

               <div className="w-full">
                  {renderStepContent()}
               </div>

               {/* Navigation Buttons - Always Float or Sticky at Bottom */}
               <div className="mt-12 w-full max-w-2xl flex flex-col items-center gap-6 px-6">
                  <button 
                    onClick={handleNext}
                    disabled={submitting}
                    className="w-full h-20 flex items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-4 rounded-full shadow-4xl shadow-indigo-600/20 active:translate-y-1 transition-all group"
                  >
                    {submitting ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                    ) : (
                      <>
                        <span className="uppercase tracking-[0.2em] text-sm">{isLastStep ? "FINALIZE CREATIVE" : "NEXT STEP"}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>

                  {currentStepIdx > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setCurrentStepIdx(currentStepIdx - 1)}
                      className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
                    >
                      &larr; GO BACK
                    </button>
                  )}
               </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dynamic Footer Aesthetic */}
        <div className="fixed bottom-6 w-full text-center pointer-events-none opacity-20">
           <p className="text-[9px] font-black tracking-widest uppercase">MR Personalization Cloud v2.1</p>
        </div>
    </div>
  );
}
