"use client";

import { useState, useEffect } from "react";
import { Plus, Layout, Users, FileText, Trash2, Edit2, Link as LinkIcon, ExternalLink, Settings, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface EventItem {
  _id: string;
  title: string;
  slug: string;
  fields: any[];
  active: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-3 text-indigo-600 font-bold text-xl px-2">
           <Layout className="w-8 h-8" />
           <span>Engagement AdHub</span>
        </div>

        <nav className="space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium transition-all group">
             <LayoutDashboard className="w-5 h-5" />
             <span>Events</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-all">
             <Users className="w-5 h-5" />
             <span>Responses</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-all">
             <Settings className="w-5 h-5" />
             <span>Settings</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex items-center justify-between mb-12">
           <div>
              <h1 className="text-3xl font-bold text-slate-900">Events Gallery</h1>
              <p className="text-slate-500 mt-1">Design and manage multi-page engagement forms</p>
           </div>
           
           <Link href="/admin/create" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
             <Plus className="w-5 h-5" />
             <span>Create New Event</span>
           </Link>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded-2xl shadow-sm border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {events.map((event) => (
                <motion.div 
                  key={event._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                       <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                         <FileText className="w-6 h-6" />
                       </div>
                       <button className="text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{event.title}</h3>
                      <p className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-1">
                        <LinkIcon className="w-3 h-3" />
                        /e/{event.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-6">
                     <Link 
                       href={`/e/${event.slug}`}
                       target="_blank"
                       className="flex-1 flex items-center justify-center gap-2 h-10 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-sm font-bold transition-all"
                     >
                       <ExternalLink className="w-4 h-4" />
                       <span>Open URL</span>
                     </Link>
                     <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4" />
                     </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="w-10 h-10 text-slate-300" />
             </div>
             <h2 className="text-xl font-bold text-slate-900">No events yet</h2>
             <p className="text-slate-500 max-w-sm mt-2">Start creating your first engagement event and share unique URLs with MRs.</p>
             <Link href="/admin/create" className="mt-8 text-indigo-600 font-bold hover:underline">Create One Now &rarr;</Link>
          </div>
        )}
      </main>
    </div>
  );
}
