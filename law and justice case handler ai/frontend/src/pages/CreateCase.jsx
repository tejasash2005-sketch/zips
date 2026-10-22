import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, User, AlignLeft, Check } from "lucide-react";

const CreateCase = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/clients/").then(res => setClients(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/cases/", { title, description, client: clientId, status: "OPEN" });
      navigate("/cases");
    } catch (err) {
      alert("Failed to initiate case file.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button onClick={() => navigate("/cases")} className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-brand-600 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Return to Registry
      </button>

      <div className="text-left">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Case <span className="text-brand-600">Initiation</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Provision a new digital matter folder and assign a client representative.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-brand-100/50 border border-slate-100 relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-[5rem] -z-0"></div>

        <div className="relative z-10 space-y-8">
          <div>
            <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">
                <Briefcase size={14} className="text-brand-600" />
                <span>Matter Title</span>
            </label>
            <input
              type="text"
              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all font-bold text-slate-800"
              placeholder="e.g., Johnson vs. Global Logistics Corp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">
                <User size={14} className="text-brand-600" />
                <span>Assigned Client</span>
            </label>
            <div className="relative">
                <select
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                >
                <option value="">Select a registered client...</option>
                {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.username}</option>
                ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <AlignLeft size={18} />
                </div>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">
                <AlignLeft size={14} className="text-brand-600" />
                <span>Executive Summary</span>
            </label>
            <textarea
              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all font-medium text-slate-700 h-40 resize-none"
              placeholder="Provide a brief overview of the case background and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
            <button
                type="submit"
                className="flex-1 bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center space-x-2"
            >
                <Check size={18} />
                <span>Confirm Initiation</span>
            </button>
            <button
                type="button"
                onClick={() => navigate("/cases")}
                className="px-8 py-5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
                Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCase;