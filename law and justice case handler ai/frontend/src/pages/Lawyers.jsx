import React, { useState, useEffect } from "react";
import api from "../api";
import { User, Briefcase, Mail, Shield, Award } from "lucide-react";

const Lawyers = () => {
  const [lawyers, setLawyers] = useState([]);

  useEffect(() => {
    api.get("/lawyers/").then(res => setLawyers(res.data));
  }, []);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Team <span className="text-brand-600">Roster</span></h1>
        <p className="text-slate-500 mt-2 font-medium">Monitoring firm specializations and professional caseloads.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {lawyers.map(lawyer => (
          <div key={lawyer.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-brand-50/50 transition-all duration-500">
            <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-brand-100">
                    {lawyer.username[0].toUpperCase()}
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900">{lawyer.username}</h3>
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Senior Counsel</p>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-slate-500">
                    <Shield size={16} className="text-brand-600" />
                    <span className="text-sm font-medium">Specialization: Litigation</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-500">
                    <Briefcase size={16} className="text-brand-600" />
                    <span className="text-sm font-medium">Caseload: 12 Active Matters</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-500">
                    <Mail size={16} className="text-brand-600" />
                    <span className="text-sm font-medium">{lawyer.email || "lawyer@legalpro.ai"}</span>
                </div>
            </div>

            <button className="w-full py-4 bg-slate-50 rounded-2xl text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all">
                View Performance Portfolio
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lawyers;
