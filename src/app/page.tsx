"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle2, Loader2, Sparkles, Heart, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

const templates = [
  { id: "general", name: "General Appreciation", icon: Sparkles, color: "from-blue-500 to-cyan-500" },
  { id: "womensday", name: "International Women's Day", icon: Heart, color: "from-pink-500 to-rose-500" },
  { id: "rakshabandhan", name: "Raksha Bandhan", icon: Rocket, color: "from-orange-500 to-amber-500" },
];

export default function MRDashboard() {
  const [doctorName, setDoctorName] = useState("");
  const [template, setTemplate] = useState("general");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setError("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !file) {
      setError("Please provide doctor name and photo.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/upload?doctorName=${encodeURIComponent(doctorName)}&templateType=${template}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed.");

      const data = await res.json();
      router.push(`/doctor/${data._id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0f172a] to-[#0f172a]">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl"
      >
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mb-4 shadow-lg shadow-blue-500/20">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">Engagement Hub</h1>
          <p className="text-slate-400 mt-2">Personalize greetings for doctors in seconds</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Doctor Name</label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr. John Doe"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Select Event Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                    template === t.id 
                    ? `bg-gradient-to-br ${t.color} border-transparent shadow-lg` 
                    : "bg-slate-900/50 border-white/10 hover:bg-slate-800"
                  }`}
                >
                  <t.icon className={`w-5 h-5 ${template === t.id ? "text-white" : "text-slate-400"}`} />
                  <span className={`text-xs font-semibold ${template === t.id ? "text-white" : "text-slate-300"}`}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Doctor Photo</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragActive ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20 bg-slate-900/50"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center animate-in fade-in duration-300">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500 mb-2">
                    <Image src={URL.createObjectURL(file)} alt="Preview" fill className="object-cover" />
                  </div>
                  <div className="flex items-center gap-1 text-blue-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{file.name}</span>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-500 mb-3" />
                  <p className="text-slate-400 text-sm">Drag & drop or <span className="text-blue-400">browse</span></p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm italic">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Personalization...</span>
              </>
            ) : (
              <>
                <span>Generate Template</span>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
