import React from "react";
import { Link } from "react-router-dom";
import { Shield, Briefcase, FileText, Lock, CheckCircle, ArrowRight, Star, Users, Award, Scale, Gavel, Globe, Phone, Mail, MapPin, Check } from "lucide-react";

const Landing = () => {
  return (
    <div className="bg-[#fafbff] min-h-screen text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="p-6 flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-200">
                <Shield className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">LEGAL<span className="text-brand-600">PRO</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
            <a href="#products" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition">Solutions</a>
            <a href="#about" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition">About</a>
            <a href="#contact" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition">Contact</a>
            </div>
            <div className="space-x-4 flex items-center">
            <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-brand-600 transition">Sign In</Link>
            <Link to="/register" className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 active:scale-95">
                Join Now
            </Link>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-48 pb-40 overflow-hidden group/hero">
        <div className="absolute inset-0 -z-10">
            <img
                src="https://images.unsplash.com/photo-1589994160839-163cd2b5fcff?auto=format&fit=crop&q=80&w=2070"
                alt="Lady Justice"
                className="w-full h-full object-cover opacity-10 group-hover/hero:opacity-20 transition-opacity duration-1000 transform scale-105 group-hover/hero:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fafbff] via-transparent to-[#fafbff]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#fafbff] via-transparent to-[#fafbff]"></div>
            <div className="absolute inset-0 bg-brand-600/0 group-hover/hero:bg-brand-600/5 transition-colors duration-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative">
            <div className="inline-flex items-center space-x-2 bg-brand-50 border border-brand-100 px-4 py-2 rounded-full text-brand-700 text-xs font-black uppercase tracking-widest mb-10 shadow-sm transform group-hover/hero:-translate-y-1 transition-transform duration-500">
                <Gavel size={14} />
                <span>Premier Legal Infrastructure</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 text-slate-900 leading-[1.05] transform group-hover/hero:scale-[1.01] transition-transform duration-700">
                Elevating the Standard <br/>
                <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent group-hover/hero:from-brand-500 group-hover/hero:to-indigo-500 transition-all duration-700">
                    of Legal Excellence.
                </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-4xl mx-auto mb-16 leading-relaxed font-medium opacity-90 group-hover/hero:opacity-100 transition-opacity duration-700">
                LegalPro provides the high-performance digital framework required by elite firms
                to navigate complex litigation with unmatched precision and absolute security.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/register" className="w-full sm:w-auto bg-brand-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-brand-700 hover:shadow-2xl hover:shadow-brand-200 transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2 group">
                <span>Initiate Platform Access</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-slate-50 transition shadow-sm">
                Schedule Private Demo
            </button>
            </div>
        </div>
      </header>

      {/* Trust Bar */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10">Trusted by the global elite of law practice</p>
            <div className="flex flex-wrap justify-center gap-16 items-center opacity-40 grayscale">
                <div className="flex items-center space-x-2"><Gavel size={30}/><span className="text-2xl font-black italic">JUSTITIA</span></div>
                <div className="flex items-center space-x-2"><Scale size={30}/><span className="text-2xl font-black">LEXCORP</span></div>
                <div className="flex items-center space-x-2"><Shield size={30}/><span className="text-2xl font-black">SENTINEL</span></div>
                <div className="flex items-center space-x-2"><Award size={30}/><span className="text-2xl font-black">PRESTIGE</span></div>
            </div>
        </div>
      </section>

      {/* Products/Solutions Section */}
      <section id="products" className="py-32 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
                <h2 className="text-5xl font-black text-slate-900 mb-6">Unrivaled Suite of <span className="text-brand-600">Legal Solutions</span></h2>
                <p className="text-slate-500 text-lg font-medium">Modular tools designed to handle every facet of your practice with surgical precision.</p>
            </div>
            <Link to="/register" className="text-brand-600 font-black flex items-center group">
                Explore all features <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20}/>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <ProductCard
                image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2070"
                title="Case Intel"
                desc="Advanced dossier management with AI-powered evidence sorting and timeline prediction."
                features={["Smart Indexing", "Conflict Check", "Status Monitor"]}
            />
            <ProductCard
                image="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=2070"
                title="Vault Secure"
                desc="Military-grade document storage with biometric access controls and immutable audit logs."
                features={["256-bit AES", "OCR Scanning", "Version Lock"]}
            />
            <ProductCard
                image="https://images.unsplash.com/photo-1423592707957-3b212afa6733?auto=format&fit=crop&q=80&w=2070"
                title="Client Portal"
                desc="A white-labeled communication bridge for high-net-worth clients to track progress securely."
                features={["Live Chat", "Task Sync", "Payment Gateway"]}
            />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <img
            src="https://images.unsplash.com/photo-1521791055366-0d5536771388?auto=format&fit=crop&q=80&w=2069"
            alt="Team"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-5xl font-black mb-8 leading-tight">We are the backbone of <br/><span className="text-brand-400">modern jurisprudence.</span></h2>
                    <p className="text-slate-400 text-xl leading-relaxed mb-10 font-medium">
                        Founded in 2018, LegalPro was born out of a simple realization: the law is evolving, but the tools aren't.
                        We combined world-class software engineering with top-tier legal expertise to build a platform that doesn't just manage cases—it helps win them.
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-4xl font-black text-brand-400 mb-2">500+</div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Law Firms</p>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-brand-400 mb-2">99.9%</div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Uptime</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10">
                    <h3 className="text-2xl font-black mb-6 italic text-brand-400">"LegalPro hasn't just improved our efficiency; it has fundamentally changed how we deliver value to our clients."</h3>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center font-black">JS</div>
                        <div>
                            <p className="font-bold">Jonathan Sterling</p>
                            <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Managing Partner, Sterling & Assoc.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[4rem] shadow-2xl shadow-brand-100/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-16 lg:p-24 bg-brand-600 text-white">
                <h2 className="text-5xl font-black mb-8">Let's Discuss <br/>Your Firm's Future.</h2>
                <p className="text-brand-100 text-lg mb-12 font-medium">Our consultants are ready to design a bespoke implementation plan for your practice.</p>
                <div className="space-y-8">
                    <ContactItem icon={<Phone/>} label="Global Inquiries" value="+1 (800) LEGAL-PRO" />
                    <ContactItem icon={<Mail/>} label="Email" value="concierge@legalpro.ai" />
                    <ContactItem icon={<MapPin/>} label="Headquarters" value="7 World Trade Center, New York, NY" />
                </div>
            </div>
            <div className="lg:w-1/2 p-16 lg:p-24">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Full Name" placeholder="John Doe" />
                        <InputGroup label="Law Firm" placeholder="Doe & Partners" />
                    </div>
                    <InputGroup label="Email Address" placeholder="john@firm.com" type="email" />
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Inquiry Details</label>
                        <textarea className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all h-40 resize-none font-medium" placeholder="How can we assist your practice?"></textarea>
                    </div>
                    <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 active:scale-95">
                        Submit Consultation Request
                    </button>
                </form>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-8">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                    <Shield className="text-white" size={18} />
                </div>
                <span className="text-xl font-black tracking-tighter">LEGAL<span className="text-brand-600">PRO</span></span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mb-8">Global Excellence in Legal Technology</p>
            <div className="flex justify-center space-x-8 mb-12 text-sm font-bold text-slate-500">
                <a href="#" className="hover:text-brand-600 transition">Privacy</a>
                <a href="#" className="hover:text-brand-600 transition">Terms</a>
                <a href="#" className="hover:text-brand-600 transition">Cookies</a>
                <a href="#" className="hover:text-brand-600 transition">Security</a>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                &copy; 2026 LegalPro Management Systems Inc. All Rights Reserved.
            </p>
        </div>
      </footer>
    </div>
  );
};

const ProductCard = ({ image, title, desc, features }) => (
    <div className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-brand-100/50 transition-all duration-700 hover:-translate-y-2">
        <div className="h-64 overflow-hidden relative">
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>
        <div className="p-10">
            <h3 className="text-2xl font-black mb-4 group-hover:text-brand-600 transition-colors">{title}</h3>
            <p className="text-slate-500 mb-8 font-medium leading-relaxed">{desc}</p>
            <div className="space-y-3">
                {features.map((f, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <Check size={14} className="text-brand-600" />
                        <span>{f}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ContactItem = ({ icon, label, value }) => (
    <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-brand-300">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-200 mb-1">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

const InputGroup = ({ label, placeholder, type = "text" }) => (
    <div>
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">{label}</label>
        <input
            type={type}
            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all font-medium"
            placeholder={placeholder}
        />
    </div>
);

export default Landing;