"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Upload, Loader2, PartyPopper } from "lucide-react";
import Image from "next/image";

interface EventData {
  _id: string;
  title: string;
  fields: any[];
}

export default function PublicEventForm() {
  const params = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
       <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
       <p className="mt-4 text-slate-500 font-medium">Preparing forms...</p>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
       <div>
          <h1 className="text-2xl font-bold font-slate-900">Event Not Found</h1>
          <p className="text-slate-500 mt-2">The link you're trying to access is invalid or expired.</p>
       </div>
    </div>
  );

  const fields = event.fields;
  const currentField = fields[currentStep];

  const handleNext = async () => {
    if (currentStep < fields.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Handle file uploads first if any
      const finalData = { ...formData };
      for (const field of fields) {
        if (field.type === 'file' && formData[field.id] instanceof File) {
          const file = formData[field.id];
          const uploadData = new FormData();
          uploadData.append('file', file);
          
          // Using a generic upload route or the existing one
          const res = await fetch(`/api/upload-simple`, { 
            method: 'POST', 
            body: uploadData 
          });
          const { url } = await res.json();
          finalData[field.id] = url;
        }
      }

      // 2. Submit response
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
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
       <div className="absolute top-0 left-0 w-full h-2 bg-slate-200">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${((currentStep + 1) / fields.length) * 100}%` }}
             className="h-full bg-indigo-600"
           />
       </div>

       <motion.div 
         key={currentStep}
         initial={{ opacity: 0, x: 20 }}
         animate={{ opacity: 1, x: 0 }}
         className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-12 relative overflow-hidden"
       >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600 rounded-full blur-[80px] opacity-10 pointer-events-none" />

          <header className="mb-10 flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                <PartyPopper className="w-6 h-6" />
             </div>
             <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">Step {currentStep + 1} of {fields.length}</h2>
             <h1 className="text-2xl font-bold text-slate-900">{currentField.label}</h1>
             <p className="text-slate-400 mt-2 text-sm">{currentField.placeholder || "Please provide the details below"}</p>
          </header>

          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
             <div className="min-h-[140px] flex items-center">
                {currentField.type === 'text' && (
                  <input 
                    autoFocus
                    type="text"
                    required={currentField.required}
                    value={formData[currentField.id] || ""}
                    onChange={(e) => setFormData({ ...formData, [currentField.id]: e.target.value })}
                    className="w-full text-center text-2xl font-bold bg-white border-b-2 border-indigo-100 focus:border-indigo-600 outline-none transition-all py-4 placeholder:text-slate-200"
                    placeholder="Type here..."
                  />
                )}

                {currentField.type === 'file' && (
                  <label className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-100 rounded-3xl cursor-pointer hover:bg-slate-50 transition-all">
                    <input 
                      type="file"
                      required={currentField.required}
                      className="hidden"
                      onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) setFormData({ ...formData, [currentField.id]: file });
                      }}
                    />
                    {formData[currentField.id] ? (
                      <div className="flex flex-col items-center group">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden mb-3 ring-4 ring-indigo-50 border-2 border-indigo-400 group-hover:scale-105 transition-transform duration-500">
                          <Image 
                            src={URL.createObjectURL(formData[currentField.id])} 
                            alt="Preview" 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <span className="text-xs font-bold text-indigo-600 truncate max-w-[150px]">{formData[currentField.id].name}</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                           <Upload className="w-8 h-8 text-indigo-400" />
                        </div>
                        <span className="text-sm font-bold text-indigo-400">Click to Upload</span>
                      </>
                    )}
                  </label>
                )}
                
                {currentField.type === 'date' && (
                  <input 
                    type="date"
                    required={currentField.required}
                    onChange={(e) => setFormData({ ...formData, [currentField.id]: e.target.value })}
                    className="w-full text-center text-xl font-bold bg-indigo-50 rounded-2xl p-6 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
                )}
             </div>

             <div className="flex gap-4 pt-4 border-t border-slate-50">
               {currentStep > 0 && (
                 <button 
                   type="button" 
                   onClick={() => setCurrentStep(currentStep - 1)}
                   className="p-4 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
                 >
                   <ArrowLeft className="w-6 h-6" />
                 </button>
               )}
               <button 
                 type="submit"
                 disabled={submitting}
                 className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-3xl shadow-xl shadow-indigo-600/20 active:translate-y-1 transition-all"
               >
                 {submitting ? (
                   <>
                     <Loader2 className="w-6 h-6 animate-spin" />
                     <span>Processing...</span>
                   </>
                 ) : (
                   <>
                     <span>{currentStep === fields.length - 1 ? "Get Final Visual" : "Next Step"}</span>
                     <ArrowRight className="w-6 h-6" />
                   </>
                 )}
               </button>
             </div>
          </form>
       </motion.div>
    </div>
  );
}
