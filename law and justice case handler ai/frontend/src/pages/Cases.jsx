import React, { useState, useEffect } from "react";
import api from "../api";
import { Plus, Search, Briefcase, ChevronRight, Filter, Gavel, Scale, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/cases/").then(res => setCases(res.data));
  }, []);

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    (c.client_detail?.username || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Case <span className="text-brand-600">Tracking</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Monitoring {cases.length} active legal trajectories.</p>
        </div>
        <Link to="/cases/create" className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 active:scale-95 font-black text-[10px] uppercase tracking-widest">
          <Plus size={16} /> <span>New Matter</span>
        </Link>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
            type="text"
            placeholder="Filter dossiers by title or counsel..."
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-500/5 transition-all font-bold text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Dossier / Title</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Stage</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Lawyer</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Next Action Date</th>
                    <th className="px-10 py-6 text-right"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {filteredCases.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 font-black shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all">
                                    {c.title[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.title}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">ID: #{c.id.toString().padStart(5, '0')}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-8">
                            <span className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {c.stage || "INTAKE"}
                            </span>
                        </td>
                        <td className="px-10 py-8">
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-[9px] font-black text-brand-600">
                                    {(c.lawyer_detail?.username || "L")[0].toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-slate-700">{c.lawyer_detail?.username || "Firm Partner"}</span>
                            </div>
                        </td>
                        <td className="px-10 py-8">
                            <div className="flex items-center space-x-2 text-slate-900 font-black text-xs">
                                <Calendar size={14} className="text-brand-600" />
                                <span>{c.next_date ? new Date(c.next_date).toLocaleDateString() : "Pending"}</span>
                            </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                            <Link to={`/cases/${c.id}`} className="p-3 text-slate-300 hover:text-brand-600 transition-colors">
                                <ChevronRight size={20} />
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filteredCases.length === 0 && (
            <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-slate-200" size={30} />
                </div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching dossiers</p>
            </div>
        )}
      </div>
    </div>
  );
};

const Calendar = ({ size, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
);

const SummaryCard = ({ icon, label, value, color, bgColor }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-slate-900">{value}</p>
        </div>
    </div>
);

export default Cases;
