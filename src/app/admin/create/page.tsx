"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowLeft, Save, Code, Layout, MessageSquare, Image as ImageIcon, Calendar, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormField {
  id: string;
  type: "text" | "file" | "select" | "date";
  label: string;
  placeholder: string;
  required: boolean;
}

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [templateHtml, setTemplateHtml] = useState(`<div style="background: white; padding: 20px; border-radius: 12px; font-family: sans-serif; text-align: center;">
  <h1 style="color: #4f46e5;">Welcome, {{name}}!</h1>
  <img src="{{photo}}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 50%; border: 4px solid #4f46e5;" />
  <p style="color: #6b7280; font-size: 18px;">{{message}}</p>
</div>`);
  const [fields, setFields] = useState<FormField[]>([
    { id: "name", type: "text", label: "Doctor Name", placeholder: "e.g. Dr. Jane Smith", required: true },
    { id: "photo", type: "file", label: "Doctor Photo", placeholder: "", required: true },
    { id: "message", type: "text", label: "Custom Message", placeholder: "Enter a personal note...", required: false }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "New Field",
      placeholder: "Enter something...",
      required: false
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return alert("Title and Slug are required.");
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, fields, templateHtml }),
      });
      if (!res.ok) throw new Error("Failed to save event.");
      router.push("/admin");
    } catch (err) {
      alert("Error saving event.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-all">
              <ArrowLeft className="w-5 h-5" />
           </button>
           <h1 className="text-xl font-bold">Create Personalized Event</h1>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          {isSaving ? <Layout className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{isSaving ? "Saving..." : "Save & Publish Event"}</span>
        </button>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* EVENT CONFIG SECTION */}
        <section className="space-y-8 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
           <div className="space-y-6">
              <div className="space-y-1">
                 <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Event Name</label>
                 <input 
                   type="text" 
                   value={title} 
                   onChange={(e) => {
                     setTitle(e.target.value);
                     if (!slug) setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                   }}
                   placeholder="e.g. Women's Day Celebration"
                   className="w-full text-2xl font-black bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Unique URL Prefix (/e/slug)</label>
                 <div className="flex items-center px-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <span className="text-slate-400 font-medium">mrapp.vercel.app/e/</span>
                    <input 
                      type="text" 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
                      placeholder="womens-day"
                      className="flex-1 bg-transparent py-4 text-indigo-600 font-bold outline-none"
                    />
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-lg flex items-center gap-2">
                    <Layout className="w-5 h-5 text-indigo-500" />
                    Custom Form Fields
                 </h3>
                 <button onClick={addField} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all border border-indigo-100">
                    <Plus className="w-4 h-4" />
                    Add Field
                 </button>
              </div>

              <div className="space-y-4">
                 <AnimatePresence>
                    {fields.map((field, idx) => (
                      <motion.div 
                        layout 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={field.id}
                        className="bg-slate-50 border border-slate-200 p-5 rounded-2xl relative group"
                      >
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <label className="text-[10px] uppercase font-bold text-slate-400">Label (What MR Sees)</label>
                               <input 
                                 type="text" 
                                 value={field.label} 
                                 onChange={(e) => updateField(field.id, { label: e.target.value })}
                                 className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                               />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] uppercase font-bold text-slate-400">Field Type</label>
                               <select 
                                 value={field.type} 
                                 onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                                 className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                               >
                                 <option value="text">Text Input</option>
                                 <option value="file">Photo Upload</option>
                                 <option value="date">Date Picker</option>
                               </select>
                            </div>
                         </div>

                         <div className="mt-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                               <input 
                                 type="checkbox" 
                                 checked={field.required} 
                                 onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                 className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                               />
                               <span className="text-xs font-medium text-slate-500">Required Field</span>
                            </div>
                            <div className="flex items-center gap-1">
                               <span className="text-[10px] font-mono text-slate-400">Placeholder: </span>
                               <input 
                                 type="text" 
                                 value={field.id} 
                                 onChange={(e) => updateField(field.id, { id: e.target.value })}
                                 className="bg-transparent border-b border-dashed border-slate-300 text-[10px] font-mono text-indigo-400 focus:border-indigo-400 outline-none w-20 text-center"
                               />
                            </div>
                         </div>

                         <button 
                           onClick={() => removeField(field.id)}
                           className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all"
                         >
                            <Trash2 className="w-3 h-3" />
                         </button>
                      </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
        </section>

        {/* TEMPLATE EDITOR SECTION */}
        <section className="space-y-8 h-full flex flex-col bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />

           <div className="relative z-10 space-y-4 flex flex-col h-full">
              <header className="flex items-center justify-between">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                    <Code className="w-6 h-6 text-indigo-400" />
                    HTML Template Visualizer
                 </h2>
                 <div className="text-[10px] font-mono text-slate-400 animate-pulse">
                    Live Sync Enabled
                 </div>
              </header>

              <div className="flex-1 flex flex-col gap-4">
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-2">
                       <CheckCircle2 className="w-3 h-3" />
                       Use placeholders like {"{{"}id{"}}"} from the form above
                    </div>
                    <textarea 
                      value={templateHtml}
                      onChange={(e) => setTemplateHtml(e.target.value)}
                      className="w-full h-80 bg-slate-950/80 border border-white/5 rounded-2xl p-6 font-mono text-sm leading-relaxed text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none shadow-inner"
                      placeholder="Enter base HTML template here..."
                    />
                 </div>

                 <div className="flex-1 bg-white rounded-2xl border border-white/10 p-4 shadow-2xl overflow-auto group">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                       <Layout className="w-3 h-3" />
                       Real-time Preview (Container Only)
                    </div>
                    {/* Sanitizing normally required, but for admin preview we'll directly inject for now */}
                    <div 
                      className="all-initial" 
                      dangerouslySetInnerHTML={{ __html: templateHtml
                        .replace(/\{\{photo\}\}/g, "https://images.unsplash.com/photo-1559839734-2b71f1e598c6?auto=format&fit=crop&q=80&w=400")
                        .replace(/\{\{(\w+)\}\}/g, "[Dynamic Value: $1]") 
                      }} 
                    />
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
