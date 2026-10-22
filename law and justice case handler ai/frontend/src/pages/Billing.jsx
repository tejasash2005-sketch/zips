import React, { useState, useEffect } from "react";
import api from "../api";
import { CreditCard, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";

const Billing = () => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    api.get("/billing/").then(res => setBills(res.data));
  }, []);

  const balance = bills.reduce((a, b) => a + (!b.is_paid ? parseFloat(b.amount) : 0), 0);

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Billing <span className="text-brand-600">Terminal</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Reviewing your financial standing and historical settlements.</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center space-x-6">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Current Balance</p>
                <p className="text-3xl font-black text-slate-900">${balance.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-100">
                <CreditCard size={24} />
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BillingStat label="Retainer Held" value="$5,000" icon={<Shield size={16}/>} />
          <BillingStat label="Unbilled Hours" value="12.5" icon={<Clock size={16}/>} />
          <BillingStat label="Last Payment" value="$1,200" icon={<CheckCircle size={16}/>} />
          <BillingStat label="Next Invoice" value="Nov 01" icon={<Calendar size={16}/>} />
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight px-2">Invoice History</h2>
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
            <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Issued</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Settlement Status</th>
                <th className="px-10 py-6 text-right"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {bills.map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                        <p className="text-sm font-black text-slate-900">#INV-{bill.id.toString().padStart(5, '0')}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{bill.description || "General Legal Services"}</p>
                    </td>
                    <td className="px-10 py-8 text-xs font-bold text-slate-500">
                        {new Date(bill.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-10 py-8">
                        <p className="text-sm font-black text-slate-900">${bill.amount}</p>
                    </td>
                    <td className="px-10 py-8">
                    <span className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${bill.is_paid ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${bill.is_paid ? "bg-emerald-600" : "bg-red-600"}`}></div>
                        <span>{bill.is_paid ? "Settled" : "Outstanding"}</span>
                    </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                        <button className="bg-slate-900 text-white p-3 rounded-xl hover:bg-brand-600 transition-all shadow-md group-hover:scale-110">
                            <Download size={16} />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const BillingStat = ({ label, value, icon }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xl font-black text-slate-900">{value}</p>
        </div>
        <div className="text-brand-600 opacity-20">{icon}</div>
    </div>
);

const Calendar = ({ size, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
);

const Shield = ({ size, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
    </svg>
);

const StatCard = ({ label, value, color }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

export default Billing;
