import React from "react";
import { Shield, Bell, Zap, Globe, Mail, Lock, Sliders } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">System <span className="text-brand-600">Control</span></h1>
        <p className="text-slate-500 mt-2 font-medium">Configure firm-wide protocols and AI integration.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
            <SettingSection
                title="Intelligence Configuration"
                desc="Manage how AI processing handles firm data and document summaries."
                icon={<Zap className="text-brand-600" />}
            >
                <ToggleItem label="AI Case Summaries" desc="Automatically generate executive summaries for new filings." active={true} />
                <ToggleItem label="Automated Deadlines" desc="AI predicts and sets calendar reminders based on court types." active={true} />
                <ToggleItem label="Drafting Assistance" desc="Real-time document drafting suggestions in the comms terminal." active={false} />
            </SettingSection>

            <SettingSection
                title="Security & Protocols"
                desc="Manage encryption standards and firm-wide access controls."
                icon={<Shield className="text-brand-600" />}
            >
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-slate-800">256-bit AES Encryption</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Status: Active & Hardened</p>
                    </div>
                    <Lock size={20} className="text-emerald-500" />
                </div>
                <ToggleItem label="Client Biometrics" desc="Require fingerprint or face ID for vault access." active={false} />
                <ToggleItem label="IP Restricted Access" desc="Limit admin logins to registered firm IP addresses." active={true} />
            </SettingSection>
        </div>

        <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black mb-8">Firm Identity</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Display Name</label>
                        <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" defaultValue="LegalPro Management" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Primary Domain</label>
                        <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" defaultValue="legalpro.ai" />
                    </div>
                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all">
                        Update Infrastructure
                    </button>
                </div>
            </div>

            <div className="bg-brand-50 p-8 rounded-[2.5rem] border border-brand-100">
                <p className="text-brand-700 font-black text-sm mb-4">Firm-Wide Support</p>
                <p className="text-brand-600 text-xs font-medium leading-relaxed mb-6">Need assistance with higher-level configurations or API integrations?</p>
                <button className="flex items-center space-x-2 text-brand-700 font-black text-[10px] uppercase tracking-widest">
                    <span>Contact Concierge</span>
                    <Globe size={14} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const SettingSection = ({ title, desc, icon, children }) => (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-4 mb-2">
            <div className="p-3 bg-brand-50 rounded-xl">{icon}</div>
            <h3 className="text-xl font-black">{title}</h3>
        </div>
        <p className="text-slate-400 text-sm font-medium mb-8 ml-1">{desc}</p>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const ToggleItem = ({ label, desc, active }) => (
    <div className="flex items-center justify-between py-2">
        <div className="max-w-[80%]">
            <p className="font-bold text-slate-800">{label}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{desc}</p>
        </div>
        <button className={`w-12 h-6 rounded-full transition-all relative ${active ? "bg-brand-600" : "bg-slate-200"}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? "left-7" : "left-1"}`}></div>
        </button>
    </div>
);

export default Settings;
