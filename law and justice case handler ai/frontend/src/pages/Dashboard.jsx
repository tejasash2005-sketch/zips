import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../AuthContext";
import { Link } from "react-router-dom";
import {
  Briefcase, Users, CheckCircle, TrendingUp, Calendar,
  ArrowUpRight, Plus, ExternalLink, Shield, AlertCircle, Clock, MessageSquare, ChevronRight
} from "lucide-react";

const BotIcon = ({ size = 24, className = "" }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
);

const TimelineNode = ({ label, date, completed, active }) => (
    <div className="relative">
        <div className={`absolute -left-10 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 transition-all ${completed ? "bg-emerald-500" : active ? "bg-brand-600 scale-125" : "bg-slate-300"}`}></div>
        <div className={active ? "bg-white p-6 rounded-3xl border border-slate-100 shadow-lg -mt-4 ml-2" : "ml-2"}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${completed ? "text-emerald-600" : active ? "text-brand-600" : "text-slate-400"}`}>
                {date} {completed && "• Completed"}
            </p>
            <h4 className={`text-sm font-black uppercase tracking-tight ${active ? "text-slate-900" : "text-slate-500"}`}>{label}</h4>
        </div>
    </div>
);

const KpiCard = ({ icon, label, value, trend }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] group hover:shadow-xl hover:shadow-brand-50/50 transition-all duration-500">
    <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-brand-600 group-hover:text-white rounded-2xl transition-all duration-500 shadow-sm">
            {icon}
        </div>
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50">{trend}</span>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

const CaseRow = ({ c, isAdmin }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-center space-x-5">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 rounded-2xl flex items-center justify-center transition-colors">
                <Briefcase size={20} />
            </div>
            <div>
                <p className="text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors">{c?.title || "Untitled Matter"}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest flex items-center">
                    <span className="w-1 h-1 bg-slate-300 rounded-full mr-2"></span>
                    Matter #{c?.id?.toString().padStart(5, '0')} • {c?.stage || 'INTAKE'}
                </p>
            </div>
        </div>
        <div className="flex items-center space-x-8">
            <div className="hidden md:block text-right">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{isAdmin ? 'Client' : 'Counsel'}</p>
                <div className="flex items-center justify-end space-x-2">
                    <div className="w-5 h-5 rounded-lg bg-brand-50 flex items-center justify-center text-[8px] font-black text-brand-600 border border-brand-100">
                        {(isAdmin ? (c?.client_detail?.username || "U") : (c?.lawyer_detail?.username || "L"))[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                        {isAdmin ? (c?.client_detail?.username || "N/A") : (c?.lawyer_detail?.username || "Firm Counsel")}
                    </span>
                </div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${c?.status === "OPEN" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                {c?.status || "OPEN"}
            </div>
            <ChevronRight size={18} className="text-slate-200 group-hover:text-brand-600 transition-colors" />
        </div>
    </div>
);

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get("/cases/").then((res) => {
        setCases(Array.isArray(res.data) ? res.data : []);
    }).catch(() => setCases([]));

    api.get("/hearings/").then((res) => {
        setHearings(Array.isArray(res.data) ? res.data : []);
    }).catch(() => setHearings([]));
  }, []);

  const isAdmin = user?.is_lawyer;

  return (
    <div className="space-y-12">
      {/* Welcome Header */}
      <section className="relative rounded-[3rem] overflow-hidden shadow-2xl min-h-[340px] flex items-center">
        {/* Professional Legal Background Image */}
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop"
          alt="Professional Legal background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Sophisticated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/40"></div>

        <div className="relative z-10 w-full p-12 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-brand-600/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-brand-500/30">
                      <Shield className="text-brand-400" size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-300">Certified Legal Terminal</span>
              </div>
              <h1 className="text-6xl font-black tracking-tighter mb-4 leading-none">
                Welcome back, <span className="text-brand-400">{user?.username}</span>
              </h1>
              <p className="text-slate-300 text-lg font-medium leading-relaxed">
                {isAdmin ? "Overseeing active litigation and intelligence operations." : "Your secure legal portfolio is active with real-time updates."}
              </p>
            </div>

            {!isAdmin && (
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] min-w-[280px] shadow-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-2">Portfolio Status</p>
                  <div className="text-5xl font-black mb-2">{cases.length}</div>
                  <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Operational</span>
                  </div>
              </div>
            )}

            {isAdmin && (
              <Link to="/cases/create" className="bg-brand-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all shadow-xl flex items-center space-x-3">
                <Plus size={18} />
                <span>Initiate New Matter</span>
              </Link>
            )}
          </div>
        </div>
      </section>
      
      {!isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Case Summary Card */}
            <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Briefcase size={120} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Primary Case Summary</h2>
                {cases && cases.length > 0 ? (
                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Dossier</p>
                            <h3 className="text-xl font-black text-brand-600 uppercase tracking-tight">{cases[0]?.title || "Case Detail"}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Counsel</p>
                                <p className="font-bold text-slate-900">{cases[0]?.lawyer_detail?.username || "Senior Partner"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Stage</p>
                                <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    {cases[0]?.stage || "Discovery"}
                                </span>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-50">
                             <Link to={`/cases/${cases[0]?.id}`} className="inline-flex items-center space-x-2 text-[10px] font-black text-brand-600 uppercase tracking-widest hover:translate-x-2 transition-transform">
                                <span>Full Case File</span>
                                <ArrowUpRight size={14} />
                             </Link>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-400 font-medium">No active matters found.</p>
                )}
            </div>

            {/* Visual Timeline */}
            <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
                <h2 className="text-xl font-black text-slate-900 tracking-tight mb-10 flex items-center">
                    <Clock size={20} className="mr-3 text-brand-600" />
                    Case Progress Timeline
                </h2>
                <div className="relative pl-8 space-y-12 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-slate-200 before:rounded-full">
                    <TimelineNode label="Case Intake" date="Oct 12, 2023" completed />
                    <TimelineNode label="Discovery Phase" date="Nov 05, 2023" completed />
                    <TimelineNode label="Preliminary Hearing" date="Dec 20, 2023" active />
                    <TimelineNode label="Trial Commencement" date="Mar 15, 2024" />
                </div>
            </div>
          </div>

          <div className="space-y-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight px-2">Upcoming Events</h2>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                {hearings && hearings.length > 0 ? hearings.slice(0, 3).map(h => (
                    <div key={h.id} className="flex items-center space-x-4 p-5 hover:bg-slate-50 rounded-3xl transition-all border border-transparent hover:border-slate-100 group">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 line-clamp-1">{h.title || "Hearing"}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{h.date ? new Date(h.date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 opacity-30">
                        <AlertCircle className="mx-auto mb-4" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Events</p>
                    </div>
                )}
              </div>

              <div className="bg-brand-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-brand-200">
                  <BotIcon size={28} className="mb-4 text-white" />
                  <h3 className="text-lg font-black mb-2">AI Summary</h3>
                  <p className="text-xs font-medium text-brand-50 leading-relaxed mb-6">Need a quick brief? Our AI can summarize your case status in seconds.</p>
                  <Link to="/ai-assistant" className="block w-full py-4 bg-slate-900 text-white rounded-xl text-center font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all">
                      Open AI Assistant
                  </Link>
              </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard icon={<Briefcase size={20}/>} label="Matters" value={cases.length} trend="+12%" />
              <KpiCard icon={<CheckCircle size={20}/>} label="Success" value="94%" trend="Firm Peak" />
              <KpiCard icon={<TrendingUp size={20}/>} label="Revenue" value="$420k" trend="+8.4%" />
              <KpiCard icon={<Users size={20}/>} label="Growth" value="+15" trend="Monthly" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Dossiers</h2>
                    <Link to="/cases" className="text-[10px] font-black text-brand-600 uppercase tracking-widest flex items-center hover:underline">
                        Registry <ArrowUpRight size={14} className="ml-1" />
                    </Link>
                </div>

                <div className="grid gap-4">
                    {cases.slice(0, 4).map(c => (
                        <CaseRow key={c.id} c={c} isAdmin={isAdmin} />
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                <h2 className="text-xl font-black text-slate-900 tracking-tight px-2">Timeline</h2>
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                    {hearings.length > 0 ? (
                        <div className="space-y-6">
                            {hearings.slice(0, 3).map(h => (
                                <div key={h.id} className="flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
                                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-brand-600 shadow-sm">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 line-clamp-1">{h.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{h.date ? new Date(h.date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <AlertCircle className="mx-auto text-slate-200 mb-4" size={40} />
                            <p className="text-xs font-bold text-slate-400">Chronology empty.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
