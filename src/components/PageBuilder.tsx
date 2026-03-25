"use client";

import React, { useState } from 'react';
import { 
  motion, 
  AnimatePresence, 
  Reorder
} from 'framer-motion';
import { 
  Plus, 
  GripVertical, 
  X, 
  Type, 
  Image as ImageIcon, 
  Settings2,
  Trash2,
  Sparkles,
  Layout,
  MousePointer2,
  Move,
  Maximize2,
  Palette,
  Eye
} from 'lucide-react';

export type ElementType = 'text_block' | 'image_block' | 'spacer' | 'container' | 'decoration';

export interface PageElement {
  id: string;
  type: ElementType;
  content: string; // Placeholder or text
  style: React.CSSProperties;
}

interface VisualPageBuilderProps {
  elements: PageElement[];
  onElementsChange: (elements: PageElement[]) => void;
  availablePlaceholders: string[];
}

const ELEMENT_PALETTE: { type: ElementType; icon: any; label: string; defaultContent: string }[] = [
  { type: 'text_block', icon: Type, label: 'Text / Variable', defaultContent: 'Dr. {{name}}' },
  { type: 'image_block', icon: ImageIcon, label: 'Dynamic Photo', defaultContent: '{{photo}}' },
  { type: 'spacer', icon: Move, label: 'Vertical Spacer', defaultContent: '' },
  { type: 'decoration', icon: Sparkles, label: 'Decorative Line', defaultContent: '' },
];

export default function VisualPageBuilder({ elements, onElementsChange, availablePlaceholders }: VisualPageBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedElement = elements.find(e => e.id === selectedId);

  const addElement = (type: ElementType) => {
    const paletteItem = ELEMENT_PALETTE.find(i => i.type === type);
    const newElement: PageElement = {
      id: `element_${Date.now()}`,
      type,
      content: paletteItem?.defaultContent || '',
      style: type === 'text_block' ? { 
        fontSize: '32px', 
        fontWeight: '900', 
        color: 'white', 
        textAlign: 'center',
        background: 'linear-gradient(to right, #818cf8, #c084fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1rem'
      } : type === 'image_block' ? {
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        margin: '0 auto',
        border: '4px solid white',
        objectFit: 'cover'
      } : type === 'spacer' ? {
        height: '40px'
      } : {
        height: '2px',
        width: '100px',
        margin: '40px auto',
        background: 'linear-gradient(to right, transparent, #4f46e5, transparent)'
      }
    };
    onElementsChange([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const removeElement = (id: string) => {
    onElementsChange(elements.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateElement = (id: string, updates: Partial<PageElement>) => {
    onElementsChange(elements.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const updateStyle = (id: string, styleUpdates: React.CSSProperties) => {
    onElementsChange(elements.map(e => e.id === id ? { ...e, style: { ...e.style, ...styleUpdates } } : e));
  };

  return (
    <div className="flex h-[800px] bg-slate-950/40 rounded-4xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-3xl">
      {/* Element Library */}
      <aside className="w-72 bg-slate-900/30 border-r border-white/5 p-6 flex flex-col gap-4">
        <div className="mb-4">
           <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
             <Plus className="w-3.5 h-3.5" />
             Layout Components
           </h3>
           <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">DRAG OR CLICK TO ADD</p>
        </div>

        <div className="grid gap-3">
          {ELEMENT_PALETTE.map((item) => (
            <button
              key={item.type}
              onClick={() => addElement(item.type)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-slate-200 truncate">{item.label}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Available Variables</p>
           <div className="flex flex-wrap gap-2">
              {availablePlaceholders.map(p => (
                <code key={p} className="text-[9px] bg-white/5 text-indigo-400 px-2 py-1 rounded border border-white/5">{"{{"}{p}{"}}"}</code>
              ))}
           </div>
        </div>
      </aside>

      {/* Page Canvas */}
      <div className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar">
         <div className="min-h-full p-20 flex flex-col items-center">
            <Reorder.Group axis="y" values={elements} onReorder={onElementsChange} className="w-full max-w-[600px] space-y-2">
               {elements.map((el) => (
                 <Reorder.Item 
                    key={el.id} 
                    value={el} 
                    onClick={() => setSelectedId(el.id)}
                    className={`relative p-2 group rounded-xl border-2 transition-all cursor-pointer ${selectedId === el.id ? 'border-indigo-500 bg-indigo-50/50' : 'border-transparent hover:border-slate-200'}`}
                 >
                    {/* Element Controls */}
                    <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2">
                       <div className="p-1.5 bg-white shadow-xl rounded-md cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-600">
                          <GripVertical className="w-4 h-4" />
                       </div>
                    </div>
                    <button 
                       onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}
                       className="absolute -right-3 -top-3 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                    >
                       <X className="w-4 h-4" />
                    </button>

                    {/* Element Render */}
                    <div style={el.style} className="pointer-events-none select-none">
                       {el.type === 'image_block' ? (
                          <div style={{ width: el.style.width, height: el.style.height, borderRadius: el.style.borderRadius, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', border: el.style.border, margin: '0 auto', overflow: 'hidden' }}>
                             <img src="https://images.unsplash.com/photo-1559839734-2b71f1e598c6?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" />
                          </div>
                       ) : el.type === 'text_block' ? (
                          <div className="whitespace-pre-wrap">{el.content}</div>
                       ) : el.type === 'spacer' ? (
                          <div className="w-full border-t border-dashed border-slate-200 flex items-center justify-center">
                             <span className="text-[8px] font-black text-slate-300 uppercase absolute bg-white px-2">Spacer</span>
                          </div>
                       ) : (
                          <div style={el.style} />
                       )}
                    </div>
                 </Reorder.Item>
               ))}

               {elements.length === 0 && (
                 <div className="h-96 border-4 border-dashed border-slate-200 rounded-4xl flex flex-col items-center justify-center text-slate-300 gap-4">
                    <Maximize2 className="w-12 h-12" />
                    <span className="font-black uppercase tracking-widest text-xs">Canvas Area</span>
                 </div>
               )}
            </Reorder.Group>
         </div>
         
         {/* Preview Banner */}
         <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/10 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 flex items-center gap-2 pointer-events-none shadow-sm">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Canvas Designer</span>
         </div>
      </div>

      {/* Properties Panel */}
      <aside className={`w-80 bg-slate-900 border-l border-white/5 overflow-y-auto transition-transform duration-300 ${selectedId ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>
         {selectedElement ? (
           <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black text-indigo-400 flex items-center gap-2 uppercase">
                   <Settings2 className="w-4 h-4" />
                   Element Design
                 </h3>
                 <button onClick={() => setSelectedId(null)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-6">
                 {selectedElement.type === 'text_block' && (
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Content / Variable</label>
                      <textarea 
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-24"
                      />
                      <p className="text-[9px] text-slate-600 leading-relaxed italic">Insert <code className="text-indigo-400">{"{{"}name{"}}"}</code> etc. to pull data from form.</p>
                   </div>
                 )}

                 <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Typography & Spacing</label>
                    <div className="grid grid-cols-2 gap-4">
                       {selectedElement.type === 'text_block' && (
                         <>
                           <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-600 uppercase">Text Align</label>
                              <select 
                                value={selectedElement.style.textAlign as any}
                                onChange={(e) => updateStyle(selectedElement.id, { textAlign: e.target.value as any })}
                                className="w-full bg-slate-950 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] outline-none"
                              >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-600 uppercase">Size</label>
                              <input 
                                type="text"
                                value={selectedElement.style.fontSize}
                                onChange={(e) => updateStyle(selectedElement.id, { fontSize: e.target.value })}
                                className="w-full bg-slate-950 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] outline-none text-indigo-400 font-mono"
                              />
                           </div>
                         </>
                       )}
                       {selectedElement.type === 'image_block' && (
                         <div className="grid col-span-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-600 uppercase">Size (Width x Height)</label>
                              <div className="flex gap-2">
                                <input 
                                   type="text"
                                   value={selectedElement.style.width}
                                   onChange={(e) => updateStyle(selectedElement.id, { width: e.target.value, height: e.target.value })}
                                   className="flex-1 bg-slate-950 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] outline-none text-indigo-400 font-mono"
                                />
                              </div>
                           </div>
                         </div>
                       )}
                       <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase">Margin Bottom</label>
                          <input 
                            type="text"
                            value={String(selectedElement.style.marginBottom || '0')}
                            onChange={(e) => updateStyle(selectedElement.id, { marginBottom: e.target.value })}
                            className="w-full bg-slate-950 border border-white/5 rounded-lg px-2 py-1.5 text-[10px] outline-none text-indigo-400 font-mono"
                          />
                       </div>
                    </div>
                 </div>

                 {selectedElement.type === 'text_block' && (
                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Color Effect</label>
                      <div className="bg-white/5 p-4 rounded-xl space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Gradient Text</span>
                            <div className="w-10 h-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full" />
                         </div>
                         <button 
                           onClick={() => updateStyle(selectedElement.id, { 
                             background: 'linear-gradient(to right, #818cf8, #c084fc)',
                             WebkitBackgroundClip: 'text',
                             WebkitTextFillColor: 'transparent'
                           })}
                           className="w-full py-2 bg-indigo-600 rounded-lg text-[10px] font-black uppercase text-white hover:bg-indigo-500 transition-all"
                         >
                           Apply Magic Gradient
                         </button>
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
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Select an element to customize</p>
           </div>
         )}
      </aside>
    </div>
  );
}
