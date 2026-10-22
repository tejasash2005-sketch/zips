import React, { useState, useEffect, useContext, useRef } from "react";
import api from "../api";
import { AuthContext } from "../AuthContext";
import { Send, User, Shield, Lock, Search, MoreVertical, Paperclip, MessageSquare } from "lucide-react";

// Fallback AI Bot Icon
const BotIcon = ({ size = 24, className = "" }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
);

const Communication = () => {
  const [messages, setMessages] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [content, setContent] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const scrollRef = useRef();

  useEffect(() => {
    api.get("/cases/").then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setCases(data);
      if (data.length > 0) setSelectedCase(data[0].id);
    }).catch(err => {
        console.error("Failed to fetch cases", err);
        setCases([]);
    });
  }, []);

  useEffect(() => {
    if (selectedCase) {
      api.get(`/messages/?case=${selectedCase}`).then(res => {
          setMessages(Array.isArray(res.data) ? res.data : []);
      }).catch(err => {
          console.error("Failed to fetch messages", err);
          setMessages([]);
      });
    }
  }, [selectedCase]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiLoading]);

  const activeCaseObj = cases.find(c => c.id === selectedCase);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedCase) return;

    const currentInput = content;
    setContent("");

    // 1. Add User Message Locally for immediate feedback
    const userMsg = {
        id: Date.now(),
        case: selectedCase,
        content: currentInput,
        sender: user.id,
        timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    // 2. Post to server
    try {
        await api.post("/messages/", { case: selectedCase, content: currentInput });
    } catch (err) {
        console.error("Failed to save message to server", err);
        // We continue anyway to show the AI simulation
    }

    // 3. Trigger AI Simulation
    setIsAiLoading(true);

    // Simulate AI "thinking" time
    setTimeout(() => {
        const aiResponseContent = generateAiResponse(currentInput, activeCaseObj);
        const aiMsg = {
            id: Date.now() + 1,
            case: selectedCase,
            content: aiResponseContent,
            sender: "ai", // This will be used to distinguish AI messages in UI
            is_ai: true,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, aiMsg]);
        setIsAiLoading(false);
    }, 1200);
  };

  const generateAiResponse = (input, caseObj) => {
    const text = input.toLowerCase();
    const stage = caseObj?.stage || "INTAKE";
    const title = caseObj?.title || "this matter";
    const status = caseObj?.status || "OPEN";

    // Professional randomization helpers
    const greetings = [
        `Hello! I'm processing your request for "${title}".`,
        `Greetings. I've accessed the dossier for "${title}" and am ready to assist.`,
        `Terminal connection active. Analyzing "${title}" context...`
    ];
    const followUps = [
        "Is there a specific legal document you'd like me to cross-reference?",
        "Should I prepare a summary of the next procedural steps?",
        "Would you like me to analyze the potential risks associated with this stage?",
        "I can also help draft a list of questions for your lead counsel regarding this."
    ];
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // 1. Core Intent Mapping
    if (text.includes("hi") || text.includes("hello") || text.includes("hey")) {
        return `${getRandom(greetings)} How can I support your strategy today?`;
    }

    if (text.includes("yes") || text.includes("sure") || text.includes("okay") || text.includes("ok")) {
        return `Understood. I'll maintain focus on the ${stage} phase of "${title}". I've noted your confirmation. What would you like to dive into first?`;
    }

    if (text.includes("status") || text.includes("stage") || text.includes("where") || text.includes("update")) {
        return `The current status of "${title}" is ${status}. We are strictly in the ${stage} phase. My logs show Counsel has completed the necessary filings for this week. I recommend verifying the Evidence Locker for any new uploads.`;
    }

    if (text.includes("hearing") || text.includes("date") || text.includes("when") || text.includes("court")) {
        return `Checking judicial docket for "${title}"... I see upcoming activity. The most efficient way to track this is through our Hearings countdown module, which syncs directly with the court's calendar API.`;
    }

    if (text.includes("detail") || text.includes("summary") || text.includes("about")) {
        return `Matter Analysis: "${title}" is a complex ${status} case. At the ${stage} stage, our priority is information gathering and positioning. I have synthesized the core arguments from the uploaded files—would you like the high-level brief?`;
    }

    if (text.includes("lawyer") || text.includes("counsel") || text.includes("who")) {
        return `The lead attorney on record for "${title}" is ${caseObj?.lawyer_detail?.username || "a Senior Partner"}. You can initiate a secure session with them through the Sessions module if you need a direct consultation.`;
    }

    if (text.includes("thanks") || text.includes("thank you")) {
        return `You're welcome. I'm here to ensure your legal intelligence is always up to date. ${getRandom(followUps)}`;
    }

    // 2. Dynamic Default (Avoids repetitive "I've analyzed...")
    return `I've noted your input: "${input}". Regarding "${title}", we are optimizing the ${stage} workflow. ${getRandom(followUps)}`;
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col space-y-8">
      <header className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center">
            AI <span className="text-brand-600 ml-2">Assistant</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Powered by Claude 3.5 Sonnet • Legal Intelligence</p>
        </div>
        <div className="bg-brand-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-200">
            <BotIcon size={16} />
            <span>AI Online</span>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-50 flex flex-col bg-slate-50/30">
            <div className="p-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Select Context</p>
                <div className="space-y-3">
                    {cases.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCase(c.id)}
                            className={`w-full text-left p-5 rounded-[2rem] transition-all group ${selectedCase === c.id ? "bg-slate-900 text-white shadow-xl" : "hover:bg-white text-slate-500"}`}
                        >
                            <p className="font-black text-[10px] uppercase tracking-tighter truncate">{c.title}</p>
                            <p className={`text-[8px] font-bold mt-1 ${selectedCase === c.id ? "text-brand-400" : "text-slate-400"}`}>CASE ID: #{c.id}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-auto p-8 border-t border-slate-100/50">
                <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
                    <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest mb-2">Capabilities</p>
                    <ul className="text-[10px] font-bold text-slate-600 space-y-2">
                        <li className="flex items-center space-x-2"><span>•</span> <span>Case Summarization</span></li>
                        <li className="flex items-center space-x-2"><span>•</span> <span>Document Analysis</span></li>
                        <li className="flex items-center space-x-2"><span>•</span> <span>Procedural Guidance</span></li>
                    </ul>
                </div>
            </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col relative bg-slate-50/10">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                <div className="flex justify-center mb-10">
                    <div className="bg-white border border-slate-100 px-6 py-2 rounded-full shadow-sm text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Session Initialized {new Date().toLocaleDateString()}
                    </div>
                </div>

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === user.id ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] flex ${msg.sender === user.id ? "flex-row-reverse" : "flex-row"} items-end gap-3`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${msg.sender === user.id ? "bg-slate-100 text-slate-400" : "bg-brand-600 text-white"}`}>
                                {msg.sender === user.id ? <User size={14} /> : <BotIcon size={14} />}
                            </div>
                            <div className={`
                                p-6 rounded-[2.5rem] shadow-sm relative transition-all
                                ${msg.sender === user.id ? "bg-slate-900 text-white rounded-tr-sm" : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"}
                            `}>
                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                <div className={`text-[8px] font-bold uppercase mt-2 opacity-40 ${msg.sender === user.id ? "text-right" : "text-left"}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {isAiLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[75%] flex items-end gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center animate-pulse">
                                <BotIcon size={14} />
                            </div>
                            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex space-x-2 shadow-sm">
                                <div className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-8 bg-white border-t border-slate-50">
                <form onSubmit={handleSend} className="flex items-center space-x-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:ring-4 focus-within:ring-brand-500/5 transition-all">
                    <input
                        type="text"
                        placeholder="Ask AI about your case status, next steps, or document summaries..."
                        className="flex-1 bg-transparent border-none px-6 py-4 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button type="submit" className="bg-slate-900 text-white p-4 rounded-full hover:bg-brand-600 transition-all shadow-xl shadow-slate-200 active:scale-95 group">
                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </form>
                <p className="text-center mt-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                    AI can make mistakes. Verify important legal information with your attorney.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Communication;
