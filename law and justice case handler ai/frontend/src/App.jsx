import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthContext, AuthProvider } from "./AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CreateCase from "./pages/CreateCase";
import CaseDetail from "./pages/CaseDetail";
import Documents from "./pages/Documents";
import Billing from "./pages/Billing";
import Meetings from "./pages/Meetings";
import Communication from "./pages/Communication";
import Lawyers from "./pages/Lawyers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Hearings from "./pages/Hearings";
import {
  LogOut, Home, Briefcase, FileText, Shield,
  CreditCard, Video, MessageSquare, Users,
  BarChart, Settings as SettingsIcon, ChevronRight,
  Bell, Search, Gavel
} from "lucide-react";

// Fallback AI Bot Icon
const BotIcon = ({ size = 24, className = "" }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
);

const NavGroup = ({ label, children }) => (
  <div className="mb-8">
    <p className="px-4 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">{label}</p>
    <div className="space-y-1">{children}</div>
  </div>
);

const SidebarLink = ({ to, icon, label, active }) => (
  <Link to={to} className={`
    flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group
    ${active ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
  `}>
    <div className="flex items-center space-x-3">
      <div className={`${active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-900'} transition-colors`}>
        {icon}
      </div>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </div>
    {active && <ChevronRight size={14} className="text-brand-400" />}
  </Link>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Layout = ({ children }) => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const isAdmin = user?.is_lawyer;

  return (
    <div className="flex min-h-screen bg-[#FDFDFF] font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col fixed h-full z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 pb-12">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center transition-all group-hover:bg-brand-600 shadow-lg shadow-slate-200 group-hover:shadow-brand-200">
              <Shield className="text-white" size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">LEGAL<span className="text-brand-600">PRO</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavGroup label={isAdmin ? "General" : "Client Portal"}>
            <SidebarLink to="/dashboard" icon={<Home size={18} />} label={isAdmin ? "Overview" : "My Case"} active={location.pathname === '/dashboard'} />
            <SidebarLink to="/cases" icon={<Briefcase size={18} />} label={isAdmin ? "Matters" : "Case Tracking"} active={location.pathname.startsWith('/cases')} />
            <SidebarLink to="/docs" icon={<FileText size={18} />} label={isAdmin ? "Documents" : "Evidence"} active={location.pathname === '/docs'} />
          </NavGroup>

          <NavGroup label={isAdmin ? "Management" : "Engagement"}>
            <SidebarLink to="/hearings" icon={<Gavel size={18} />} label="Hearings" active={location.pathname === '/hearings'} />
            <SidebarLink to="/ai-assistant" icon={<BotIcon size={18} />} label="AI Assistant" active={location.pathname === '/ai-assistant'} />
            {isAdmin && <SidebarLink to="/lawyers" icon={<Users size={18} />} label="Team" active={location.pathname === '/lawyers'} />}
            {isAdmin && <SidebarLink to="/meetings" icon={<Video size={18} />} label="Sessions" active={location.pathname === '/meetings'} />}
            <SidebarLink to="/billing" icon={<CreditCard size={18} />} label={isAdmin ? "Financials" : "Billing"} active={location.pathname === '/billing'} />
          </NavGroup>

          {isAdmin && (
            <NavGroup label="Enterprise">
              <SidebarLink to="/comms" icon={<MessageSquare size={18} />} label="Messages" active={location.pathname === '/comms'} />
              <SidebarLink to="/reports" icon={<BarChart size={18} />} label="Analytics" active={location.pathname === '/reports'} />
              <SidebarLink to="/settings" icon={<SettingsIcon size={18} />} label="System" active={location.pathname === '/settings'} />
            </NavGroup>
          )}
        </nav>

        <div className="p-6">
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 font-black text-sm shadow-sm">
                {user?.username ? user.username[0].toUpperCase() : "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{user?.username}</p>
                <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">{isAdmin ? "Admin" : "Client"}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center justify-center space-x-2 text-slate-400 hover:text-red-500 transition-all w-full py-2.5 bg-white rounded-xl shadow-sm border border-slate-100 font-black text-[10px] uppercase tracking-widest">
              <LogOut size={14} /> <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-20">
          <div className="flex items-center bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 w-96">
            <Search className="text-slate-400 mr-3" size={16} />
            <input type="text" placeholder="Search case files, invoices, or team..." className="bg-transparent border-none text-xs font-medium w-full focus:outline-none" />
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative text-slate-400 hover:text-brand-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-100"></div>
            <div className="flex items-center space-x-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Server Status:</span>
               <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Optimal</span>
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-12 max-w-7xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/cases" element={
            <ProtectedRoute>
              <Layout><Cases /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/cases/:id" element={
            <ProtectedRoute>
              <Layout><CaseDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/cases/create" element={
            <ProtectedRoute>
              <Layout><CreateCase /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/docs" element={
            <ProtectedRoute>
              <Layout><Documents /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute>
              <Layout><Billing /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/hearings" element={
            <ProtectedRoute>
              <Layout><Hearings /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/meetings" element={
            <ProtectedRoute>
              <Layout><Meetings /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/ai-assistant" element={
            <ProtectedRoute>
              <Layout><Communication /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/comms" element={
            <ProtectedRoute>
              <Layout><Communication /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/lawyers" element={
            <ProtectedRoute>
              <Layout><Lawyers /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout><Settings /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
