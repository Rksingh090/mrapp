"use client";

import React, { useState } from 'react';
import { 
  motion, 
  AnimatePresence, 
  Reorder,
  useDragControls
} from 'framer-motion';
import { 
  Plus, 
  GripVertical, 
  X, 
  Type, 
  Image as ImageIcon, 
  Calendar, 
  List, 
  Hash, 
  Settings2,
  Trash2,
  ChevronRight,
  Sparkles,
  Layout,
  MousePointer2,
  Eye,
  CheckCircle2,
  Move
} from 'lucide-react';

export type FieldType = 'text' | 'file' | 'select' | 'date' | 'heading' | 'subtext' | 'divider';

export interface VisualField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  style?: React.CSSProperties;
  value?: string; // For fixed elements like headings
}

interface VisualBuilderProps {
  fields: VisualField[];
  onFieldsChange: (fields: VisualField[]) => void;
  title: string;
  description?: string;
}

const FIELD_PALETTE: { type: FieldType; icon: any; label: string; description: string }[] = [
  { type: 'text', icon: Type, label: 'Text Input', description: 'Simple text field for names or titles' },
  { type: 'file', icon: ImageIcon, label: 'Photo Upload', description: 'Image uploader for photos/logos' },
  { type: 'date', icon: Calendar, label: 'Date Picker', description: 'Calendar input for special dates' },
  { type: 'select', icon: List, label: 'Dropdown', description: 'Select from a list of options' },
  { type: 'heading', icon: Sparkles, label: 'Visual Heading', description: 'Bold text to group fields' },
  { type: 'subtext', icon: MousePointer2, label: 'Instructions', description: 'Helpful text for the user' },
];

export default function VisualBuilder({ fields, onFieldsChange, title, description }: VisualBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const selectedField = fields.find(f => f.id === selectedFieldId);

  const addField = (type: FieldType) => {
    const newField: VisualField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      label: type === 'heading' ? 'New Heading' : type === 'subtext' ? 'Provide some instructions...' : `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: 'Enter value...',
      required: false,
      style: type === 'heading' ? { fontSize: '24px', fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: '1rem' } : {},
      value: type === 'heading' ? 'Design Your Step' : ''
    };
    onFieldsChange([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const removeField = (id: string) => {
    onFieldsChange(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const updateField = (id: string, updates: Partial<VisualField>) => {
    onFieldsChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const updateFieldStyle = (id: string, updates: React.CSSProperties) => {
    onFieldsChange(fields.map(f => f.id === id ? { ...f, style: { ...f.style, ...updates } } : f));
  };

  return (
    <div className="flex h-[750px] bg-slate-950/50 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl">
      {/* Field Palette */}
      <aside className="w-72 bg-slate-900/30 border-r border-white/5 p-6 flex flex-col gap-4">
        <div className="mb-4">
           <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
             <Plus className="w-3.5 h-3.5" />
             Field Library
           </h3>
           <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">DRAG OR CLICK TO ADD</p>
        </div>

        <div className="grid gap-3">
          {FIELD_PALETTE.map((item) => (
            <button
              key={item.type}
              onClick={() => addField(item.type)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-slate-200 truncate">{item.label}</p>
                <p className="text-[9px] text-slate-500 truncate">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
          <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Visual Canvas</p>
          <p className="text-[10px] text-slate-400 leading-relaxed italic">The canvas represents exactly how the MR will see this step.</p>
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20">
        <header className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
           <div className="space-y-1">
             <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">{title || "Untitled Step"}</h2>
             <p className="text-xs text-slate-500 font-medium">{description || "Visual preview of your form step"}</p>
           </div>
           <div className="flex items-center gap-2">
             <div className="flex bg-slate-900 rounded-lg p-1">
                <button className="px-3 py-1 text-[10px] font-black bg-indigo-600 rounded-md text-white">DESIGNER</button>
                <button className="px-3 py-1 text-[10px] font-black text-slate-500 hover:text-white transition-colors">LIVE PREVIEW</button>
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <Reorder.Group 
            axis="y" 
            values={fields} 
            onReorder={onFieldsChange}
            className="space-y-6 max-w-2xl mx-auto"
          >
            <AnimatePresence>
              {fields.length === 0 ? (
                <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   className="h-64 rounded-4xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-slate-600"
                >
                   <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                      <Layout className="w-8 h-8" />
                   </div>
                   <p className="font-bold text-sm tracking-tight capitalize">Your canvas is empty</p>
                   <p className="text-[10px] uppercase font-black tracking-widest bg-white/5 px-4 py-1.5 rounded-full">Add fields from the library</p>
                </motion.div>
              ) : (
                fields.map((field) => (
                  <Reorder.Item
                    key={field.id}
                    value={field}
                    className={`relative group ${selectedFieldId === field.id ? 'z-10' : 'z-0'}`}
                  >
                    <div 
                      onClick={() => setSelectedFieldId(field.id)}
                      className={`
                        w-full rounded-4xl transition-all duration-300 border backdrop-blur-xl cursor-pointer
                        ${selectedFieldId === field.id 
                          ? 'bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-600/20 ring-4 ring-indigo-500/10' 
                          : 'bg-white/3 border-white/5 hover:border-white/20'
                        }
                        p-8
                      `}
                    >
                      {/* Drag Handle */}
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-slate-500">
                         <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Delete Button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                        className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 hover:rotate-12"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Field Render */}
                      <div className="space-y-4">
                        {(field.type === 'heading') ? (
                          <div style={field.style} className="font-black italic tracking-tighter uppercase whitespace-pre-wrap">
                             {field.value || field.label}
                          </div>
                        ) : (field.type === 'subtext') ? (
                          <div style={field.style} className="text-sm font-medium text-slate-500 text-center italic">
                             {field.label}
                          </div>
                        ) : (
                          <div className="space-y-2">
                             <div className="flex items-center justify-between">
                               <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                 {field.label}
                                 {field.required && <span className="text-rose-500 ml-1">*</span>}
                               </label>
                               <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded text-slate-600 uppercase">Field ID: {field.id}</span>
                             </div>
                             
                             {field.type === 'text' && (
                               <div className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-500 opacity-50 flex items-center justify-between">
                                  <span>{field.placeholder || "Enter value..."}</span>
                                  <Type className="w-4 h-4" />
                               </div>
                             )}

                             {field.type === 'file' && (
                               <div className="w-full h-32 bg-slate-950 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 opacity-50">
                                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                     <ImageIcon className="w-5 h-5 text-indigo-400" />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DRAG OR CLICK TO UPLOAD</span>
                               </div>
                             )}

                             {field.type === 'date' && (
                               <div className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-500 opacity-50 flex items-center justify-between">
                                  <span>Select Date</span>
                                  <Calendar className="w-4 h-4" />
                               </div>
                             )}

                             {field.type === 'select' && (
                               <div className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-500 opacity-50 flex items-center justify-between">
                                  <span>Choose an option...</span>
                                  <ChevronRight className="w-4 h-4 rotate-90" />
                               </div>
                             )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Reorder.Item>
                ))
              )}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      </div>

      {/* Properties Sidebar */}
      <aside className={`w-80 bg-slate-900 border-l border-white/5 overflow-y-auto transition-all duration-300 ${selectedFieldId ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>
         {selectedField ? (
           <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black text-indigo-400 flex items-center gap-2">
                   <Settings2 className="w-4 h-4" />
                   PROPERTIES
                 </h3>
                 <button onClick={() => setSelectedFieldId(null)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-6">
                 {/* ID Property */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                       System ID
                       <span className="text-[9px] text-indigo-500/50 normal-case">(Used for mapping)</span>
                    </label>
                    <input 
                      value={selectedField.id}
                      onChange={(e) => updateField(selectedField.id, { id: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-indigo-400 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                 </div>

                 {/* Label / Value Property */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                       {selectedField.type === 'heading' ? 'Heading Text' : selectedField.type === 'subtext' ? 'Instruction Text' : 'Field Label'}
                    </label>
                    <textarea 
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-24"
                    />
                 </div>

                 {/* Placeholder for Inputs */}
                 {!['heading', 'subtext', 'divider'].includes(selectedField.type) && (
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Placeholder</label>
                      <input 
                        value={selectedField.placeholder}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                   </div>
                 )}

                 {/* Settings for Select */}
                 {selectedField.type === 'select' && (
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Options (One per line)</label>
                       <textarea 
                         value={selectedField.options?.join('\n')}
                         onChange={(e) => updateField(selectedField.id, { options: e.target.value.split('\n') })}
                         className="w-full h-32 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-slate-400 outline-none focus:ring-1 focus:ring-indigo-500"
                         placeholder="Option 1\nOption 2"
                       />
                    </div>
                 )}

                 {/* Constraints */}
                 {!['heading', 'subtext'].includes(selectedField.type) && (
                   <div className="space-y-2 pt-4">
                      <label className="flex items-center gap-3 bg-white/3 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
                         <input 
                           type="checkbox" 
                           checked={selectedField.required}
                           onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                           className="w-4 h-4 rounded-md accent-indigo-600"
                         />
                         <span className="text-xs font-bold text-slate-300">Required Field</span>
                      </label>
                   </div>
                 )}

                 {/* Styling Tab Selection */}
                 {selectedField.type === 'heading' && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                       <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Design Settings</label>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[8px] font-black text-slate-600 uppercase">Size</label>
                             <select 
                               value={selectedField.style?.fontSize}
                               onChange={(e) => updateFieldStyle(selectedField.id, { fontSize: e.target.value })}
                               className="w-full bg-slate-950 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] outline-none"
                             >
                               <option value="18px">Small</option>
                               <option value="24px">Medium</option>
                               <option value="32px">Large</option>
                               <option value="48px">Extra Large</option>
                             </select>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-black text-slate-600 uppercase">Align</label>
                             <select 
                               value={selectedField.style?.textAlign as any}
                               onChange={(e) => updateFieldStyle(selectedField.id, { textAlign: e.target.value as any })}
                               className="w-full bg-slate-950 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] outline-none"
                             >
                               <option value="left">Left</option>
                               <option value="center">Center</option>
                               <option value="right">Right</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center p-12 text-center gap-4 text-slate-700">
              <div className="w-12 h-12 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center">
                 <MousePointer2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Select a field to configure its properties</p>
           </div>
         )}
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
