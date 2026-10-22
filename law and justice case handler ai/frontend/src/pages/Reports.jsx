import React from "react";
import { BarChart, PieChart, TrendingUp, Users, Award, Shield } from "lucide-react";

const Reports = () => {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Firm <span className="text-brand-600">Analytics</span></h1>
        <p className="text-slate-500 mt-2 font-medium">Performance metrics and operational intelligence.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={<Award/>} label="Success Rate" value="94.2%" trend="+2.1%" />
        <MetricCard icon={<Users/>} label="Client Satisfaction" value="4.9/5" trend="+0.2" />
        <MetricCard icon={<BarChart/>} label="Active Files" value="156" trend="+12" />
        <MetricCard icon={<TrendingUp/>} label="Revenue Growth" value="+18%" trend="Quarterly" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black mb-8">Caseload Distribution</h3>
            <div className="space-y-6">
                <ProgressItem label="Corporate Law" percentage={45} color="bg-brand-600" />
                <ProgressItem label="Family Law" percentage={20} color="bg-indigo-500" />
                <ProgressItem label="Civil Litigation" percentage={25} color="bg-emerald-500" />
                <ProgressItem label="Criminal Defense" percentage={10} color="bg-amber-500" />
            </div>
        </div>
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full blur-[80px]"></div>
            <h3 className="text-xl font-black mb-8 relative z-10">Executive Insights</h3>
            <div className="space-y-6 relative z-10">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-brand-400 font-black text-[10px] uppercase tracking-widest mb-2">Recommendation</p>
                    <p className="text-sm font-medium text-slate-300 italic">"Client intake is up 15% in Corporate Law. Consider re-allocating discovery resources to the Pleading phase to optimize billable hours."</p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-2">Efficiency Alert</p>
                    <p className="text-sm font-medium text-slate-300 italic">"Resolution rate has peaked. The new digital vault system has reduced document retrieval time by 40% firm-wide."</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, trend }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">{icon}</div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
);

const ProgressItem = ({ label, percentage, color }) => (
    <div>
        <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-900">{percentage}%</span>
        </div>
        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
        </div>
    </div>
);

export default Reports;
