import React, { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User, ArrowRight } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      alert("Authentication failed. Please verify credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafbff] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-50 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-50 rounded-full blur-[120px] -z-10"></div>

      <div className="w-full max-w-md p-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl shadow-xl shadow-brand-100 mb-6">
            <Shield className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome to <span className="text-brand-600">LegalPro</span></h2>
          <p className="text-slate-500 mt-2 font-medium">Access your secure legal intelligence terminal</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-brand-100/50 border border-slate-100 relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Identity</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Username or Email"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all font-medium text-slate-700"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Secret Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-all font-medium text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700">Forgot Credentials?</button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center space-x-2 group"
            >
              <span>Authenticate</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
             <p className="text-sm text-slate-500 font-medium">
                New to the platform? <Link to="/" className="text-brand-600 font-bold hover:underline">Request Access</Link>
             </p>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Military Grade 256-bit Encryption Active
        </p>
      </div>
    </div>
  );
};

export default Login;