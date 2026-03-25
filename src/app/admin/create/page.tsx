"use client";

import { useState } from "react";
import { 
  Plus, Trash2, ArrowLeft, Save, Code, Layout, 
  MessageSquare, Image as ImageIcon, Calendar, 
  CheckCircle2, Palette, Settings, Layers, Eye,
  Type, MousePointer2, Sparkles, MoveUp, MoveDown
} from "lucide-react";
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

interface Step {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  templateHtml: string;
}

export default function CreateEvent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "steps" | "design" | "html">("general");
  const [editingStepHtml, setEditingStepHtml] = useState<string | null>(null); // Current step being designed
  
  // General State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Steps State
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "step_1",
      title: "Doctor Details",
      description: "Gather basic information about the doctor",
      fields: [
        { id: "name", type: "text", label: "Doctor Name", placeholder: "e.g. Dr. Jane Smith", required: true },
        { id: "photo", type: "file", label: "Doctor Photo", placeholder: "", required: true },
      ],
      templateHtml: `<div style="padding: 60px 40px; text-align: center;">
  <h1 style="font-size: 42px; font-weight: 900; tracking: tight; margin-bottom: 8px;">Let's get started!</h1>
  <p style="color: #64748b; font-size: 18px; margin-bottom: 60px;">First, we need to know who we're celebrating.</p>
  
  <div style="max-width: 400px; margin: 0 auto; space-y: 24px;">
    <div style="margin-bottom: 24px;">
       {{field:name}}
    </div>
    <div style="margin-bottom: 24px;">
       {{field:photo}}
    </div>
  </div>
</div>`
    }
  ]);

  // Design State
  const [pageConfig, setPageConfig] = useState({
    theme: 'dark' as 'dark' | 'light',
    primaryColor: '#4f46e5',
    backgroundColor: '#020617',
    fontFamily: 'Inter, sans-serif',
    showConfetti: true,
  });

  // HTML Template State
  const [templateHtml, setTemplateHtml] = useState(`<div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 30px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); text-align: center; color: white;">
  <span style="display: inline-block; padding: 6px 16px; background: rgba(79, 70, 229, 0.2); color: #818cf8; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px;">Special Recognition</span>
  
  <h1 style="font-size: 48px; font-weight: 900; margin-bottom: 16px; background: linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Dr. {{name}}</h1>
  
  <div style="position: relative; width: 300px; height: 300px; margin: 40px auto;">
    <div style="position: absolute; inset: -4px; background: linear-gradient(45deg, #4f46e5, #9333ea); border-radius: 50%; blur: 8px; opacity: 0.5;"></div>
    <img src="{{photo}}" style="position: relative; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid white;" />
  </div>

  <p style="font-size: 20px; color: rgba(255,255,255,0.7); line-height: 1.6; font-style: italic;">"{{message}}"</p>
  
  <div style="margin-top: 40px; height: 2px; width: 100px; background: linear-gradient(to right, transparent, #4f46e5, transparent); margin-left: auto; margin-right: auto;"></div>
  
  <p style="margin-top: 24px; font-size: 14px; font-weight: bold; color: #4f46e5; letter-spacing: 1px;">MADE FOR YOU BY MR APP</p>
</div>`);

  const addStep = () => {
    const newStep: Step = {
      id: `step_${Date.now()}`,
      title: "New Step",
      description: "Briefly describe what this step is for",
      fields: [],
      templateHtml: `<div style="padding: 60px 40px; text-align: center;">
  <h1 style="font-size: 32px; font-weight: 900;">Step Canvas</h1>
  <p style="color: #64748b; margin-top: 12px;">Customize this step to your liking.</p>
</div>`
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<Step>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addField = (stepId: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "New Field",
      placeholder: "Enter value",
      required: false
    };
    setSteps(steps.map(s => s.id === stepId ? { ...s, fields: [...s.fields, newField] } : s));
  };

  const removeField = (stepId: string, fieldId: string) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) } : s));
  };

  const updateField = (stepId: string, fieldId: string, updates: Partial<FormField>) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, fields: s.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) } : s));
  };

  const handleSave = async () => {
    if (!title || !slug) return alert("Title and Slug are required.");
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          slug, 
          steps, 
          templateHtml,
          pageConfig
        }),
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
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <button onClick={() => router.back()} className="p-2.5 hover:bg-white/5 rounded-2xl transition-all group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
             <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-indigo-400" />
               CREATE NEW EVENT
             </h1>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Custom Personalization Engine</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-2xl shadow-indigo-600/30 transition-all active:scale-95"
          >
            {isSaving ? <Layout className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{isSaving ? "PUBLISHING..." : "PUBLISH EVENT"}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-72 bg-slate-900/30 border-r border-white/5 p-6 flex flex-col gap-2">
          <NavItem active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={<Settings className="w-5 h-5" />} label="General Info" />
          <NavItem active={activeTab === "steps"} onClick={() => setActiveTab("steps")} icon={<Layers className="w-5 h-5" />} label="Form Steps" />
          <NavItem active={activeTab === "design"} onClick={() => setActiveTab("design")} icon={<Palette className="w-5 h-5" />} label="Page Design" />
          <NavItem active={activeTab === "html"} onClick={() => setActiveTab("html")} icon={<Code className="w-5 h-5" />} label="HTML Template" />
          
          <div className="mt-12 pt-8 border-t border-white/5">
             <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">QUICK TIP</p>
                <p className="text-xs text-slate-400 leading-relaxed">Use placeholders like <code className="text-white bg-white/10 px-1 rounded">{"{{"}name{"}}"}</code> in your HTML to inject form data.</p>
             </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-12">
           <AnimatePresence mode="wait">
              {activeTab === "general" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl mx-auto space-y-12"
                >
                  <section className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black italic tracking-tighter">BASIC INFORMATION</h2>
                      <p className="text-slate-500">Define the core identity of your event page.</p>
                    </div>

                    <div className="grid gap-8">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Event Name</label>
                        <input 
                          type="text" 
                          value={title} 
                          onChange={(e) => {
                            setTitle(e.target.value);
                            if (!slug) setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                          }}
                          placeholder="e.g. Women's Day Celebration"
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl px-8 py-5 text-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Custom Link (Slug)</label>
                        <div className="flex items-center px-8 bg-slate-900 border border-white/10 rounded-2xl group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                           <span className="text-slate-600 font-bold mr-1">mrapp.com/e/</span>
                           <input 
                             type="text" 
                             value={slug} 
                             onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
                             placeholder="womens-day"
                             className="flex-1 bg-transparent py-5 text-indigo-400 font-bold outline-none"
                           />
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === "steps" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl mx-auto space-y-12"
                >
                   <div className="flex items-center justify-between">
                     <div className="space-y-2">
                       <h2 className="text-3xl font-black italic tracking-tighter uppercase">Form Journey</h2>
                       <p className="text-slate-500">Break down the data collection into manageable steps.</p>
                     </div>
                     <button onClick={addStep} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm border border-white/10 transition-all">
                       <Plus className="w-4 h-4" />
                       ADD STEP
                     </button>
                   </div>

                   <div className="space-y-6">
                     {steps.map((step, sIdx) => (
                       <div key={step.id} className="bg-slate-900/50 border border-white/10 rounded-[2rem] overflow-hidden">
                          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                             <div className="space-y-1 flex-1 mr-8">
                                <input 
                                  value={step.title}
                                  onChange={(e) => updateStep(step.id, { title: e.target.value })}
                                  className="bg-transparent text-xl font-black tracking-tight text-white outline-none w-full placeholder:text-slate-700"
                                  placeholder="Step Title"
                                />
                                <input 
                                  value={step.description}
                                  onChange={(e) => updateStep(step.id, { description: e.target.value })}
                                  className="bg-transparent text-sm font-medium text-slate-500 outline-none w-full placeholder:text-slate-800"
                                  placeholder="Step description (optional)"
                                />
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-slate-800 px-3 py-1 rounded-full text-slate-400">STEP {sIdx + 1}</span>
                                <button onClick={() => removeStep(step.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                  <Trash2 className="w-5 h-5" />
                                </button>
                             </div>
                          </div>

                          <div className="p-8 space-y-4">
                             <div className="grid grid-cols-1 gap-4">
                                {step.fields.map((field) => (
                                  <div key={field.id} className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex items-center gap-6 group hover:border-indigo-500/30 transition-all">
                                     <div className="flex-1 grid grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Label</label>
                                          <input 
                                            value={field.label}
                                            onChange={(e) => updateField(step.id, field.id, { label: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Type</label>
                                          <select 
                                            value={field.type}
                                            onChange={(e) => updateField(step.id, field.id, { type: e.target.value as any })}
                                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none"
                                          >
                                            <option value="text">Text Input</option>
                                            <option value="file">Photo Upload</option>
                                            <option value="date">Date Picker</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">ID (Mapping)</label>
                                          <input 
                                            value={field.id}
                                            onChange={(e) => updateField(step.id, field.id, { id: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-mono text-indigo-400 outline-none"
                                          />
                                        </div>
                                     </div>
                                     <button onClick={() => removeField(step.id, field.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                  </div>
                                ))}
                             </div>
                             <button 
                               onClick={() => addField(step.id)}
                               className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-slate-600 font-bold text-sm hover:border-indigo-500/50 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
                             >
                               <Plus className="w-4 h-4" />
                               ADD FIELD TO STEP
                             </button>
                          </div>
                       </div>
                     ))}
                   </div>
                </motion.div>
              )}

              {activeTab === "design" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl mx-auto space-y-12"
                >
                   <div className="space-y-2">
                     <h2 className="text-3xl font-black italic tracking-tighter uppercase">Visual Experience</h2>
                     <p className="text-slate-500">Configure how the final personalized page looks.</p>
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-8">
                         <div className="bg-slate-900/50 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                            <h3 className="font-bold flex items-center gap-2">
                               <Palette className="w-5 h-5 text-indigo-400" />
                               Theme & Colors
                            </h3>
                            
                            <div className="space-y-6">
                               <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                                  <label className="text-sm font-bold">Base Theme</label>
                                  <div className="flex bg-black rounded-lg p-1">
                                     <button 
                                       onClick={() => setPageConfig({...pageConfig, theme: 'dark'})}
                                       className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${pageConfig.theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                     >
                                       DARK
                                     </button>
                                     <button 
                                       onClick={() => setPageConfig({...pageConfig, theme: 'light'})}
                                       className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${pageConfig.theme === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                     >
                                       LIGHT
                                     </button>
                                  </div>
                               </div>

                               <div className="space-y-3">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Primary Brand Color</label>
                                  <div className="flex gap-3">
                                     <input 
                                       type="color" 
                                       value={pageConfig.primaryColor}
                                       onChange={(e) => setPageConfig({...pageConfig, primaryColor: e.target.value})}
                                       className="w-16 h-12 bg-transparent border-none outline-none cursor-pointer"
                                     />
                                     <input 
                                       type="text" 
                                       value={pageConfig.primaryColor}
                                       onChange={(e) => setPageConfig({...pageConfig, primaryColor: e.target.value})}
                                       className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 text-sm font-mono text-indigo-400"
                                     />
                                  </div>
                               </div>

                               <div className="space-y-3">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Background Color</label>
                                  <div className="flex gap-3">
                                     <input 
                                       type="color" 
                                       value={pageConfig.backgroundColor}
                                       onChange={(e) => setPageConfig({...pageConfig, backgroundColor: e.target.value})}
                                       className="w-16 h-12 bg-transparent border-none outline-none cursor-pointer"
                                     />
                                     <input 
                                       type="text" 
                                       value={pageConfig.backgroundColor}
                                       onChange={(e) => setPageConfig({...pageConfig, backgroundColor: e.target.value})}
                                       className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 text-sm font-mono text-indigo-400"
                                     />
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="bg-slate-900/50 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                            <h3 className="font-bold flex items-center gap-2">
                               <MousePointer2 className="w-5 h-5 text-indigo-400" />
                               Interactivity
                            </h3>
                            <label className="flex items-center justify-between bg-white/5 p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                               <div className="flex items-center gap-3">
                                  <Sparkles className="w-5 h-5 text-yellow-400" />
                                  <span className="text-sm font-bold">Confetti Celebration on Load</span>
                               </div>
                               <input 
                                 type="checkbox" 
                                 checked={pageConfig.showConfetti}
                                 onChange={(e) => setPageConfig({...pageConfig, showConfetti: e.target.checked})}
                                 className="w-5 h-5 rounded-md accent-indigo-600"
                               />
                            </label>
                         </div>
                      </div>

                      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col">
                         <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <h3 className="text-xs font-black tracking-widest uppercase text-slate-500">Style Preview</h3>
                            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                         </div>
                         <div 
                           className="flex-1 flex flex-col items-center justify-center p-12 gap-6 transition-all duration-700"
                           style={{ backgroundColor: pageConfig.backgroundColor }}
                         >
                            <div 
                              className="w-24 h-24 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl"
                              style={{ backgroundColor: pageConfig.primaryColor }}
                            >
                               <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-2 text-center">
                               <h4  className={`text-xl font-black ${pageConfig.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Demo Headline</h4>
                               <p className={`text-sm ${pageConfig.theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>This is how your colors feel.</p>
                            </div>
                            <button 
                              className="px-8 py-3 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95"
                              style={{ backgroundColor: pageConfig.primaryColor, color: 'white' }}
                            >
                               Action Button
                            </button>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === "html" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-6xl mx-auto space-y-8"
                >
                   <div className="flex items-center justify-between">
                     <div className="space-y-2">
                       <h2 className="text-3xl font-black italic tracking-tighter uppercase">Canvas Content</h2>
                       <p className="text-slate-500">Inject raw HTML with dynamic variables to build the visual ad.</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
                      <div className="flex flex-col gap-4">
                         <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col flex-1">
                            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <Code className="w-4 h-4 text-indigo-400" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Template Editor</span>
                               </div>
                            </div>
                            <textarea 
                              value={templateHtml}
                              onChange={(e) => setTemplateHtml(e.target.value)}
                              className="flex-1 bg-transparent p-8 font-mono text-sm leading-relaxed text-slate-300 outline-none resize-none"
                              placeholder="<div>Your HTML here...</div>"
                            />
                         </div>
                      </div>

                      <div className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
                         <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <Eye className="w-4 h-4 text-slate-400" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans">Live Visual Preview</span>
                            </div>
                         </div>
                         <div className="flex-1 overflow-auto bg-slate-50 p-8 flex items-center justify-center">
                            <div 
                              className="w-full h-full"
                              dangerouslySetInnerHTML={{ 
                                __html: templateHtml
                                  .replace(/\{\{photo\}\}/g, "https://images.unsplash.com/photo-1559839734-2b71f1e598c6?auto=format&fit=crop&q=80&w=600")
                                  .replace(/\{\{name\}\}/g, "Dr. John Doe")
                                  .replace(/\{\{message\}\}/g, "You are making a difference every single day.")
                                  .replace(/\{\{(\w+)\}\}/g, "[Dynamic: $1]") 
                              }} 
                            />
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm ${
        active 
          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1" 
          : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
    </button>
  );
}
