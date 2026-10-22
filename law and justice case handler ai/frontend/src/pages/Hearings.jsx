import React, { useState, useEffect } from "react";
import api from "../api";
import { Gavel, Calendar, MapPin, User, Clock, AlertTriangle } from "lucide-react";

const Hearings = () => {
  const [hearings, setHearings] = useState([]);

  useEffect(() => {
    api.get("/hearings/").then(res => setHearings(res.data));
  }, []);

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Court <span className="text-brand-600">Hearings</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Strategic schedule for judicial proceedings and motions.</p>
        </div>
      </header>

      {hearings.length > 0 && (
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Clock size={160} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-brand-400">
                          <AlertTriangle size={20} />
                          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Countdown to Imminent Hearing</span>
                      </div>
                      <h2 className="text-4xl font-black tracking-tight">{hearings[0].title}</h2>
                      <div className="flex items-center space-x-6 text-slate-400">
                           <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest">
                               <MapPin size={14} className="text-brand-500" />
                               <span>Room {hearings[0].courtroom}</span>
                           </div>
                           <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest">
                               <User size={14} className="text-brand-500" />
                               <span>Judge {hearings[0].judge}</span>
                           </div>
                      </div>
                  </div>
                  <div className="flex space-x-4">
                      <CountdownUnit value="02" label="Days" />
                      <CountdownUnit value="14" label="Hrs" />
                      <CountdownUnit value="45" label="Mins" />
                  </div>
              </div>
          </div>
      )}

      <div className="grid gap-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight px-2 flex items-center">
            <Calendar size={20} className="mr-3 text-brand-600" />
            Upcoming Docket
        </h2>
        {hearings.length > 0 ? hearings.map(h => (
          <div key={h.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center group hover:shadow-xl transition-all">
            <div className="flex items-center space-x-8 mb-6 md:mb-0">
                <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex flex-col items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1">{new Date(h.date).toLocaleDateString([], { month: 'short' })}</span>
                    <span className="text-2xl font-black">{new Date(h.date).getDate()}</span>
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition-colors uppercase tracking-tight">{h.title}</h3>
                    <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <User size={12} />
                            <span>{h.judge}</span>
                        </div>
                        <div className="bg-brand-50 text-brand-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            {h.hearing_type}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-8">
                <div className="text-center md:text-right">
                    <div className="flex items-center justify-center md:justify-end space-x-2 text-slate-900 font-black text-lg">
                        <Clock size={18} className="text-brand-600" />
                        <span>{new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Local Standard Time</div>
                </div>
                <div className="h-16 w-[1px] bg-slate-100 hidden md:block"></div>
                <div className="text-center md:text-right">
                    <div className="flex items-center justify-center md:justify-end space-x-2 text-slate-900 font-black text-lg">
                        <MapPin size={18} className="text-brand-600" />
                        <span>Courtroom {h.courtroom}</span>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">County Superior Court</div>
                </div>
            </div>
          </div>
        )) : (
            <div className="py-20 bg-white rounded-[3rem] border border-slate-100 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-slate-200" size={40} />
                </div>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No upcoming hearings found on the docket.</p>
            </div>
        )}
      </div>
    </div>
  );
};

const CountdownUnit = ({ value, label }) => (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[80px] text-center">
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-[8px] font-black text-brand-400 uppercase tracking-widest mt-1">{label}</div>
    </div>
);

export default Hearings;
