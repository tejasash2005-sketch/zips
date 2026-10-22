import React, { useState, useEffect } from "react";
import api from "../api";
import { Video, Calendar, Clock, ExternalLink, Plus } from "lucide-react";

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    api.get("/meetings/").then(res => setMeetings(res.data));
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Virtual <span className="text-brand-600">Counsel</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Scheduled depositions and client consultations.</p>
        </div>
        <button className="bg-brand-600 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 font-bold">
          <Plus size={20} /> <span>Schedule Session</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {meetings.length > 0 ? meetings.map(meeting => (
          <div key={meeting.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-brand-50/50 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-brand-50 text-brand-600 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-all">
                <Video size={24} />
              </div>
              <div className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1 rounded-lg uppercase tracking-widest">
                Confirmed
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{meeting.title}</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">{meeting.description || "Review of case evidence and litigation strategy."}</p>

            <div className="pt-6 border-t border-slate-50 flex justify-between items-center mt-auto">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Calendar size={14} />
                  <span className="text-xs font-bold">{new Date(meeting.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Clock size={14} />
                  <span className="text-xs font-bold">{new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <a href={meeting.link} target="_blank" rel="noreferrer" className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 transition-all">
                <span>Join Room</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )) : (
            <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-slate-100 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Video className="text-slate-200" size={40} />
                </div>
                <p className="text-slate-400 font-medium">No sessions scheduled on the horizon.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Meetings;
