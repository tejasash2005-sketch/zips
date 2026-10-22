import React, { useState, useEffect } from "react";
import api from "../api";
import { File, Search, Download, ExternalLink, Upload, Shield, X, Check } from "lucide-react";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/documents/").then(res => setDocuments(res.data));
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async (file) => {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('case', 1); // Mock case ID for now

      try {
          const res = await api.post("/documents/", formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setDocuments([res.data, ...documents]);
      } catch (err) {
          console.error(err);
      } finally {
          setUploading(false);
      }
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Evidence <span className="text-brand-600">Locker</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Chain of custody for all case-related materials.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100">
            <Shield size={16} />
            <span>Encrypted Storage</span>
        </div>
      </header>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
            relative h-64 border-4 border-dashed rounded-[3rem] transition-all flex flex-col items-center justify-center space-y-4
            ${dragActive ? "border-brand-600 bg-brand-50" : "border-slate-100 bg-white hover:bg-slate-50"}
            ${uploading ? "opacity-50 cursor-wait" : ""}
        `}
      >
        <div className={`p-6 rounded-full ${dragActive ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"} transition-all`}>
            {uploading ? <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div> : <Upload size={32} />}
        </div>
        <div className="text-center">
            <p className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {uploading ? "Securing Transmission..." : dragActive ? "Release to Upload" : "Drag and drop evidence here"}
            </p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">PDF, JPG, PNG or DOCX (Max 25MB)</p>
        </div>
        <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])}
            disabled={uploading}
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Stored Assets</h2>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                    type="text"
                    placeholder="Search locker..."
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500/10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
                <div key={doc.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 rounded-2xl flex items-center justify-center transition-all">
                            <File size={24} />
                        </div>
                        <div className="flex space-x-1">
                            <a href={doc.file} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-brand-600 transition-colors">
                                <ExternalLink size={16} />
                            </a>
                            <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate mb-1">{doc.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                        <span className="bg-slate-50 px-3 py-1 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest">Dossier #1</span>
                        <button className="flex items-center space-x-2 text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">
                            <Download size={14} />
                            <span>Download</span>
                        </button>
                    </div>
                </div>
            ))}
            {filteredDocs.length === 0 && (
                <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 text-center">
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No assets found in locker</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Documents;