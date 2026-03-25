"use client";

import { useState } from "react";
import { 
  Plus, Trash2, ArrowLeft, Save, Code, Layout, 
  ImageIcon, Calendar, Palette, Settings, Layers, Eye,
  Type, MousePointer2, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import VisualBuilder, { VisualField } from "@/components/VisualBuilder";

interface FormField extends VisualField {}

interface Step {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  templateHtml: string;
  designMode: 'visual' | 'code';
}

import VisualPageBuilder, { PageElement } from "@/components/PageBuilder";

export default function CreateEvent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "steps" | "design" | "html">("general");
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [pageDesignMode, setPageDesignMode] = useState<'visual' | 'code'>('code');
  
  // General State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Steps State
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "step_1",
      title: "Introduction",
      description: "Gather basic information about the doctor",
      designMode: 'visual',
      fields: [
        { id: "heading_1", type: "heading", label: "Special Celebration", value: "Let's Celebrate!", style: { fontSize: '32px', textAlign: 'center', marginBottom: '2rem' }, required: false },
        { id: "name", type: "text", label: "Doctor Name", placeholder: "e.g. Dr. Jane Smith", required: true },
        { id: "photo", type: "file", label: "Upload Photo", placeholder: "", required: true },
        { id: "subtext_1", type: "subtext", label: "We'll use these to generate the visual ad.", required: false },
      ],
      templateHtml: ""
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

  // Final Page Visual State
  const [pageElements, setPageElements] = useState<PageElement[]>([
    { id: '1', type: 'text_block', content: 'Special Recognition', style: { padding: '6px 16px', background: 'rgba(79, 70, 229, 0.2)', color: '#818cf8', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', textAlign: 'center' } },
    { id: '2', type: 'text_block', content: 'Dr. {{name}}', style: { fontSize: '48px', fontWeight: '900', marginBottom: '16px', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center' } },
    { id: '3', type: 'image_block', content: '{{photo}}', style: { width: '300px', height: '300px', margin: '40px auto', borderRadius: '50%', border: '4px solid white', objectFit: 'cover' } },
    { id: '4', type: 'text_block', content: '"{{message}}"', style: { fontSize: '20px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', fontStyle: 'italic', textAlign: 'center', marginBottom: '40px' } },
    { id: '5', type: 'decoration', content: '', style: { height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #4f46e5, transparent)', margin: '40px auto' } },
    { id: '6', type: 'text_block', content: 'MADE FOR YOU BY MR APP', style: { marginTop: '24px', fontSize: '14px', fontWeight: 'bold', color: '#4f46e5', letterSpacing: '1px', textAlign: 'center' } },
  ]);

  // HTML Template State
  const [templateHtml, setTemplateHtml] = useState(``);

  const generatePageHtml = (elements: PageElement[]) => {
    let html = `<div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 30px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); text-align: center; color: white; display: flex; flex-direction: column; align-items: center;">`;
    
    elements.forEach(el => {
      const styleStr = Object.entries(el.style)
        .map(([k, v]) => `${k.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}: ${v}`)
        .join("; ");
      
      if (el.type === 'text_block') {
        html += `<div style="${styleStr}">${el.content}</div>`;
      } else if (el.type === 'image_block') {
        html += `<div style="position: relative; ${styleStr}; overflow: hidden;"><img src="${el.content}" style="width: 100%; height: 100%; object-fit: cover;" /></div>`;
      } else if (el.type === 'spacer') {
        html += `<div style="${styleStr}"></div>`;
      } else if (el.type === 'decoration') {
        html += `<div style="${styleStr}"></div>`;
      }
    });

    html += `</div>`;
    return html;
  };

  // Sync HTML when pageElements changes
  const [lastGeneratedPageHtml, setLastGeneratedPageHtml] = useState("");
  if (pageDesignMode === 'visual') {
    const newHtml = generatePageHtml(pageElements);
    if (newHtml !== templateHtml && newHtml !== lastGeneratedPageHtml) {
      setTemplateHtml(newHtml);
      setLastGeneratedPageHtml(newHtml);
    }
  }

  const generateStepHtml = (fields: FormField[]) => {
    let html = `<div style="padding: 60px 40px; text-align: center; color: white; display: flex; flex-direction: column; align-items: center; gap: 32px; width: 100%;">`;
    
    fields.forEach(field => {
      if (field.type === 'heading') {
        html += `<h1 style="font-size: ${field.style?.fontSize || '32px'}; font-weight: 900; text-align: ${field.style?.textAlign || 'center'}; margin-bottom: ${field.style?.marginBottom || '16px'}; color: white; width: 100%; line-height: 1.1;">${field.label}</h1>`;
      } else if (field.type === 'subtext') {
        html += `<p style="color: #64748b; font-size: 14px; margin-top: -16px; text-align: center; max-width: 400px;">${field.label}</p>`;
      } else {
        html += `<div style="width: 100%; max-width: 400px;">{{field:${field.id}}}</div>`;
      }
    });

    html += `</div>`;
    return html;
  };

  const addStep = () => {
    const newStep: Step = {
      id: `step_${Date.now()}`,
      title: "New Step",
      description: "Custom step description",
      fields: [],
      templateHtml: "",
      designMode: 'visual'
    };
    setSteps([...steps, newStep]);
    setEditingStepId(newStep.id);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
    if (editingStepId === id) setEditingStepId(null);
  };

  const updateStep = (id: string, updates: Partial<Step>) => {
    setSteps(steps.map(s => {
      if (s.id === id) {
        const newStep = { ...s, ...updates };
        if (newStep.designMode === 'visual' && updates.fields) {
          newStep.templateHtml = generateStepHtml(updates.fields);
        }
        return newStep;
      }
      return s;
    }));
  };

  const handleSave = async () => {
    if (!title || !slug) return alert("Title and Slug are required.");
    
    setIsSaving(true);
    try {
      const finalizedSteps = steps.map(s => ({
        ...s,
        templateHtml: s.designMode === 'visual' ? generateStepHtml(s.fields) : s.templateHtml
      }));

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          slug, 
          steps: finalizedSteps, 
          templateHtml,
          pageConfig
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save event.");
      }
      router.push("/admin");
    } catch (err: any) {
      alert(`Error saving event: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <button onClick={() => router.back()} className="p-2.5 hover:bg-white/5 rounded-2xl transition-all group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
             <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-indigo-400" />
               DESIGN STUDIO
             </h1>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Custom Event Engine v2.0</p>
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
        <aside className="w-72 bg-slate-900/30 border-r border-white/5 p-6 flex flex-col gap-2">
          <NavItem active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={<Settings className="w-5 h-5" />} label="General" />
          <NavItem active={activeTab === "steps"} onClick={() => setActiveTab("steps")} icon={<Layers className="w-5 h-5" />} label="Form Steps" />
          <NavItem active={activeTab === "design"} onClick={() => setActiveTab("design")} icon={<Palette className="w-5 h-5" />} label="Global Design" />
          <NavItem active={activeTab === "html"} onClick={() => setActiveTab("html")} icon={<Code className="w-5 h-5" />} label="Final Result" />
        </aside>

        <div className="flex-1 overflow-y-auto bg-slate-950">
           <AnimatePresence mode="wait">
              {activeTab === "general" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl mx-auto space-y-12 p-12"
                >
                  <section className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase whitespace-pre-wrap">Basic{'\n'}Identification</h2>
                      <p className="text-slate-500">Define how users will access this event.</p>
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
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Public URL</label>
                        <div className="flex items-center px-8 bg-slate-900 border border-white/10 rounded-2xl group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                           <span className="text-slate-600 font-bold mr-1 italic">mrapp.com/e/</span>
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
                   initial={{ opacity: 0, scale: 0.98 }} 
                   animate={{ opacity: 1, scale: 1 }} 
                   exit={{ opacity: 0, scale: 0.98 }}
                   className="h-full flex flex-col"
                >
                   {editingStepId ? (
                     <div className="flex-1 flex flex-col">
                        <div className="p-8 pb-0 flex items-center justify-between">
                           <button 
                             onClick={() => setEditingStepId(null)}
                             className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                           >
                             <ArrowLeft className="w-4 h-4" />
                             Back to Steps List
                           </button>
                           
                           <div className="flex bg-slate-900 rounded-xl p-1">
                              <button 
                                onClick={() => updateStep(editingStepId, { designMode: 'visual' })}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${steps.find(s => s.id === editingStepId)?.designMode === 'visual' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                              >
                                VISUAL DESIGNER
                              </button>
                              <button 
                                onClick={() => updateStep(editingStepId, { designMode: 'code' })}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${steps.find(s => s.id === editingStepId)?.designMode === 'code' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                              >
                                RAW HTML
                              </button>
                           </div>
                        </div>

                        <div className="flex-1 p-8">
                          {steps.find(s => s.id === editingStepId)?.designMode === 'visual' ? (
                            <VisualBuilder 
                               fields={steps.find(s => s.id === editingStepId)?.fields || []}
                               onFieldsChange={(fields) => updateStep(editingStepId, { fields })}
                               title={steps.find(s => s.id === editingStepId)?.title || ""}
                               description={steps.find(s => s.id === editingStepId)?.description}
                            />
                          ) : (
                            <div className="h-[750px] bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
                               <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                                  <div className="flex items-center gap-2">
                                     <Code className="w-4 h-4 text-indigo-400" />
                                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step Source Code</span>
                                  </div>
                               </div>
                               <textarea 
                                 value={steps.find(s => s.id === editingStepId)?.templateHtml}
                                 onChange={(e) => updateStep(editingStepId, { templateHtml: e.target.value })}
                                 className="flex-1 bg-transparent p-8 font-mono text-sm leading-relaxed text-slate-400 outline-none resize-none"
                                 placeholder="<div style='...'>{{field:id}}</div>"
                               />
                            </div>
                          )}
                        </div>
                     </div>
                   ) : (
                     <div className="p-12 max-w-5xl mx-auto w-full space-y-12">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-[0.9]">Form{'\n'}Journey</h2>
                            <p className="text-slate-500">Add beautiful, functional steps to collect data.</p>
                          </div>
                          <button onClick={addStep} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-3xl font-black text-sm border border-white/10 transition-all shadow-xl">
                            <Plus className="w-5 h-5" />
                            ADD NEW STEP
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {steps.map((step, idx) => (
                             <div 
                               key={step.id} 
                               className="group bg-slate-900/50 border border-white/5 rounded-[3rem] p-10 hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden"
                               onClick={() => setEditingStepId(step.id)}
                             >
                                <div className="absolute top-0 right-0 p-8">
                                   <span className="text-[64px] font-black text-white/5 leading-none">{idx + 1}</span>
                                </div>
                                
                                <div className="space-y-6 relative z-10">
                                   <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                      <Layout className="w-8 h-8" />
                                   </div>
                                   <div className="space-y-2">
                                      <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">{step.title}</h3>
                                      <p className="text-sm text-slate-500 font-medium line-clamp-2">{step.description || "No description provided."}</p>
                                   </div>
                                   
                                   <div className="flex items-center gap-4 pt-4">
                                      <div className="flex -space-x-2">
                                         {step.fields.slice(0, 3).map(f => (
                                           <div key={f.id} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                                              {f.type === 'text' && <Type className="w-3 h-3 text-slate-400" />}
                                              {f.type === 'file' && <ImageIcon className="w-3 h-3 text-slate-400" />}
                                              {f.type === 'date' && <Calendar className="w-3 h-3 text-slate-400" />}
                                           </div>
                                         ))}
                                      </div>
                                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{step.fields.length} Elements</span>
                                   </div>
                                </div>

                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                                  className="absolute right-8 bottom-8 p-3 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                </motion.div>
              )}

              {activeTab === "design" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl mx-auto space-y-12 p-12"
                >
                   <div className="space-y-2">
                     <h2 className="text-4xl font-black italic tracking-tighter uppercase whitespace-pre-wrap">Visual{'\n'}Language</h2>
                     <p className="text-slate-500">Define the global aesthetic for your personalized micro-sites.</p>
                   </div>

                   <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-12">
                         <div className="space-y-8">
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                               <Palette className="w-4 h-4" />
                               Colors & Themes
                            </h3>
                            
                            <div className="space-y-6">
                               <div className="flex items-center justify-between bg-white/3 p-6 rounded-[2rem] border border-white/5">
                                  <label className="text-sm font-black uppercase tracking-tight">Theme</label>
                                  <div className="flex bg-black rounded-xl p-1.5">
                                     <button 
                                       onClick={() => setPageConfig({...pageConfig, theme: 'dark'})}
                                       className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${pageConfig.theme === 'dark' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
                                     >
                                       DARK
                                     </button>
                                     <button 
                                       onClick={() => setPageConfig({...pageConfig, theme: 'light'})}
                                       className={`px-6 py-2 rounded-lg text-[10px] font-black transition-all ${pageConfig.theme === 'light' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
                                     >
                                       LIGHT
                                     </button>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Accent Color</label>
                                  <div className="flex gap-4 p-4 bg-white/2 border border-white/5 rounded-3xl items-center">
                                     <input 
                                       type="color" 
                                       value={pageConfig.primaryColor}
                                       onChange={(e) => setPageConfig({...pageConfig, primaryColor: e.target.value})}
                                       className="w-12 h-12 bg-transparent border-none outline-none cursor-pointer rounded-xl overflow-hidden"
                                     />
                                     <input 
                                       type="text" 
                                       value={pageConfig.primaryColor}
                                       onChange={(e) => setPageConfig({...pageConfig, primaryColor: e.target.value})}
                                       className="bg-transparent text-xl font-black text-white italic tracking-tighter outline-none"
                                     />
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Background Color</label>
                                  <div className="flex gap-4 p-4 bg-white/2 border border-white/5 rounded-3xl items-center">
                                     <input 
                                       type="color" 
                                       value={pageConfig.backgroundColor}
                                       onChange={(e) => setPageConfig({...pageConfig, backgroundColor: e.target.value})}
                                       className="w-12 h-12 bg-transparent border-none outline-none cursor-pointer rounded-xl overflow-hidden"
                                     />
                                     <input 
                                       type="text" 
                                       value={pageConfig.backgroundColor}
                                       onChange={(e) => setPageConfig({...pageConfig, backgroundColor: e.target.value})}
                                       className="bg-transparent text-xl font-black text-white italic tracking-tighter outline-none"
                                     />
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="bg-slate-900 border border-white/5 rounded-[4rem] overflow-hidden flex flex-col shadow-2xl relative group">
                         <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
                         <div className="p-8 border-b border-white/5 bg-white/2 flex items-center justify-between relative z-10">
                            <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">Live Preview</h3>
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                         </div>
                         <div 
                           className="flex-1 flex flex-col items-center justify-center p-12 gap-10 transition-all duration-1000 relative z-10"
                           style={{ backgroundColor: pageConfig.backgroundColor }}
                         >
                            <div 
                              className="w-20 h-20 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl group-hover:rotate-20 group-hover:scale-110 transition-all duration-700"
                              style={{ backgroundColor: pageConfig.primaryColor }}
                            >
                               <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-4 text-center">
                               <h4  className={`text-2xl font-black italic tracking-tighter uppercase ${pageConfig.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Visual Styling</h4>
                               <p className={`text-xs font-medium ${pageConfig.theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Atmosphere of your event site.</p>
                            </div>
                            <button 
                              className="px-10 py-4 rounded-3xl font-black text-[10px] shadow-2xl transition-all active:scale-95 uppercase tracking-widest"
                              style={{ 
                                backgroundColor: pageConfig.primaryColor, 
                                color: 'white',
                                boxShadow: `0 20px 40px ${pageConfig.primaryColor}33`
                              }}
                            >
                              Sample Button
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
                  className="h-full flex flex-col p-12 gap-12"
                >
                   <div className="flex items-center justify-between">
                     <div className="space-y-2">
                       <h2 className="text-4xl font-black italic tracking-tighter uppercase whitespace-pre-wrap leading-[0.9]">Resulting{'\n'}Masterpiece</h2>
                       <p className="text-slate-500">Craft the final visual ad. Use placeholders for personal data.</p>
                     </div>
                     <div className="flex bg-slate-900 rounded-xl p-1">
                        <button 
                          onClick={() => setPageDesignMode('visual')}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${pageDesignMode === 'visual' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                        >
                          VISUAL CANVAS
                        </button>
                        <button 
                          onClick={() => setPageDesignMode('code')}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${pageDesignMode === 'code' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
                        >
                          HTML SOURCE
                        </button>
                     </div>
                   </div>

                   {pageDesignMode === 'visual' ? (
                     <VisualPageBuilder 
                       elements={pageElements} 
                       onElementsChange={setPageElements}
                       availablePlaceholders={steps.flatMap(s => s.fields).filter(f => !['heading', 'subtext'].includes(f.type)).map(f => f.id)}
                     />
                   ) : (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 min-h-[600px]">
                        <div className="flex flex-col gap-6">
                           <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col flex-1 shadow-2xl relative">
                              <div className="px-8 py-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <Code className="w-4 h-4 text-orange-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Template Editor</span>
                                 </div>
                                 <div className="flex gap-2">
                                    {steps.flatMap(s => s.fields).filter(f => !['heading', 'subtext'].includes(f.type)).slice(0, 5).map(f => (
                                        <span key={f.id} className="text-[9px] font-black bg-white/5 px-2 py-1 rounded text-slate-600">{"{{"}{f.id}{"}}"}</span>
                                    ))}
                                 </div>
                              </div>
                              <textarea 
                                value={templateHtml}
                                onChange={(e) => setTemplateHtml(e.target.value)}
                                className="flex-1 bg-transparent p-10 font-mono text-[13px] leading-relaxed text-slate-400 outline-none resize-none custom-scrollbar"
                              />
                           </div>
                        </div>

                        <div className="bg-white rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border-4 border-slate-900 transition-transform duration-700">
                           <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                              <div className="flex items-center gap-3">
                                 <Eye className="w-4 h-4 text-indigo-600" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visual Preview</span>
                              </div>
                           </div>
                           <div className="flex-1 overflow-auto bg-[#fafafa] p-12 flex items-center justify-center custom-scrollbar">
                              <div 
                                className="w-full h-full max-w-[500px]"
                                dangerouslySetInnerHTML={{ 
                                  __html: templateHtml
                                    .replace(/\{\{photo\}\}/g, "https://images.unsplash.com/photo-1559839734-2b71f1e598c6?auto=format&fit=crop&q=80&w=600")
                                    .replace(/\{\{name\}\}/g, "Smith")
                                    .replace(/\{\{message\}\}/g, "You are a remarkable inspiration.")
                                    .replace(/\{\{(\w+)\}\}/g, "[Dynamic: $1]") 
                                }} 
                              />
                           </div>
                        </div>
                     </div>
                   )}
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-5 px-8 py-5 rounded-[2rem] font-black transition-all text-xs tracking-widest uppercase ${
        active 
          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-3 scale-105" 
          : "text-slate-500 hover:text-slate-300 hover:bg-white/3"
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="ml-auto w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse" />}
    </button>
  );
}
