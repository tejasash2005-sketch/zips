import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { File, CheckCircle, Clock, Upload, Plus, ArrowLeft, Calendar, User, Info, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";

const CaseDetail = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("docs");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");

  const toggleTask = async (taskId, completed) => {
    await api.patch(`/tasks/${taskId}/`, { is_completed: completed });
    setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: completed } : t));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("case", id);
    const res = await api.post("/documents/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setDocuments([...documents, res.data]);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const res = await api.post("/tasks/", { title: newTaskTitle, due_date: newTaskDate, case: id, description: "" });
    setTasks([...tasks, res.data]);
    setNewTaskTitle("");
    setNewTaskDate("");
  };

  useEffect(() => {
    api.get(`/cases/${id}/`).then(res => setCaseData(res.data));
    api.get(`/documents/?case=${id}`).then(res => setDocuments(res.data));
    api.get(`/tasks/?case=${id}`).then(res => setTasks(res.data));
  }, [id]);

  if (!caseData) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link to="/cases" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-brand-600 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Back to Registry
      </Link>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${caseData.status === "OPEN" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                {caseData.status}
            </div>
        </div>

        <div className="flex items-start space-x-6 mb-8">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center">
                <Info size={32} />
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{caseData.title}</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-2xl">{caseData.description}</p>
            </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-8 border-t border-slate-50">
          <div className="flex items-center space-x-3 bg-slate-50 px-5 py-3 rounded-2xl">
            <User size={18} className="text-brand-600" />
            <span className="text-sm font-bold text-slate-700">{caseData.client_detail?.username || "No Client Assigned"}</span>
          </div>
          <div className="flex items-center space-x-3 bg-slate-50 px-5 py-3 rounded-2xl">
            <Calendar size={18} className="text-brand-600" />
            <span className="text-sm font-bold text-slate-700">Opened {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
        <TabButton
          active={activeTab === "docs"}
          onClick={() => setActiveTab("docs")}
          label="Documentation"
          icon={<File size={18} />}
        />
        <TabButton
          active={activeTab === "tasks"}
          onClick={() => setActiveTab("tasks")}
          label="Action Items"
          icon={<CheckCircle size={18} />}
        />
      </div>

      {activeTab === "docs" ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-black text-slate-900">Case Vault</h2>
            <label className="bg-brand-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 cursor-pointer font-bold text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 active:scale-95">
              <Upload size={18} /> <span>Upload Document</span>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="grid gap-4">
            {documents.length > 0 ? documents.map(doc => (
              <div key={doc.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <File size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{doc.title}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">PDF Document • 2.4 MB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                    <a href={doc.file} target="_blank" rel="noreferrer" className="text-sm font-bold text-brand-600 hover:text-brand-700 px-4 py-2 bg-brand-50 rounded-xl transition-colors">
                        View File
                    </a>
                    <button className="text-slate-300 hover:text-slate-600 p-2"><MoreVertical size={20}/></button>
                </div>
              </div>
            )) : (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <File className="text-slate-200" size={40} />
                    </div>
                    <p className="text-slate-400 font-medium">No documents have been uploaded to this vault yet.</p>
                </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-black text-slate-900">Task Registry</h2>
          </div>

          <form onSubmit={handleAddTask} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-wrap md:flex-nowrap gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Task Identification</label>
              <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required placeholder="Describe the required action..." />
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Deadline</label>
              <input type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} required />
            </div>
            <button type="submit" className="bg-slate-900 text-white p-5 rounded-2xl hover:bg-brand-600 transition-all shadow-xl shadow-slate-200"><Plus size={24} /></button>
          </form>

          <div className="grid gap-4">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleTask(task.id, !task.is_completed)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${task.is_completed ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400 hover:bg-brand-50 hover:text-brand-600"}`}
                  >
                    {task.is_completed ? <CheckCircle size={24} /> : <Clock size={24} />}
                  </button>
                  <div>
                    <p className={`font-bold transition-all ${task.is_completed ? "text-slate-400 line-through" : "text-slate-800"}`}>{task.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                        <Calendar size={12} className="text-slate-400" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due: {task.due_date}</p>
                    </div>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600 p-2"><MoreVertical size={20}/></button>
              </div>
            )) : (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-slate-200" size={40} />
                    </div>
                    <p className="text-slate-400 font-medium">All clear. No pending tasks found.</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${active ? "bg-brand-600 text-white shadow-lg shadow-brand-100" : "text-slate-500 hover:bg-slate-50"}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default CaseDetail;