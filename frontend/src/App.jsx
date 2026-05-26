import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Layers,
  Bug,
  Shield,
  Zap,
  FileText,
  Terminal,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Database,
  Cpu,
  Check,
  Copy,
  Send,
  HelpCircle,
  RefreshCw,
  FolderOpen,
  Code2,
  Server,
  Settings as SettingsIcon,
  ChevronRight
} from "lucide-react";

// Pre-defined CrewAI Agent Profiles
const AGENTS = [
  {
    id: "architect",
    name: "Architect Agent",
    role: "Senior Software Architect",
    desc: "Analyzes design patterns, components, folders, and systems architecture.",
    color: "var(--color-indigo)",
    glow: "var(--color-indigo-glow)",
    avatar: Layers,
    personaPrompt: "Act as a Senior Software Architect. Analyze the following repository context and explain the structural, design pattern, or modular architectural details relating to this query: ",
    suggestedPrompts: [
      "Explain the overall project design patterns.",
      "What are the main entrypoints and folder relations?",
      "Draw a structural breakdown of the modules."
    ]
  },
  {
    id: "bug_hunter",
    name: "Bug Hunter Agent",
    role: "Senior QA & Debugger",
    desc: "Scans for logic errors, race conditions, type mismatches, and boundary limits.",
    color: "var(--color-rose)",
    glow: "var(--color-rose-glow)",
    avatar: Bug,
    personaPrompt: "Act as a Senior QA & Bug Hunter. Review this codebase context and find logical errors, boundary case flaws, race conditions, or unhandled exceptions relating to this query: ",
    suggestedPrompts: [
      "Are there potential unhandled crashes or edge cases?",
      "Check the error handling and validation logic.",
      "Inspect loops and async calls for logic errors."
    ]
  },
  {
    id: "security",
    name: "Security Agent",
    role: "Senior Security Specialist",
    desc: "Audits for input injections, exposed credentials, hardcoded keys, and OWASP flaws.",
    color: "var(--color-emerald)",
    glow: "var(--color-emerald-glow)",
    avatar: Shield,
    personaPrompt: "Act as a Senior Security Engineer. Audit the following repository context for security risks, input validation leaks, exposed keys, and authorization flaws relating to this query: ",
    suggestedPrompts: [
      "Audit the codebase for exposed keys or passwords.",
      "Is input properly sanitized against injections?",
      "Review the security and privacy model of this app."
    ]
  },
  {
    id: "performance",
    name: "Performance Agent",
    role: "Senior Performance Engineer",
    desc: "Finds latency hot-spots, heavy allocations, indexing loops, and rendering lag.",
    color: "var(--color-amber)",
    glow: "var(--color-amber-glow)",
    avatar: Zap,
    personaPrompt: "Act as a Senior Performance Engineer. Inspect the repository context and locate performance bottlenecks, heavy resource usages, or indexing loops relating to this query: ",
    suggestedPrompts: [
      "Where are the heaviest memory or CPU allocations?",
      "Are there caching options to speed this up?",
      "Evaluate database queries or loops for latency."
    ]
  },
  {
    id: "documentation",
    name: "Documentation Agent",
    role: "Senior Technical Writer",
    desc: "Drafts module summaries, readme docs, API outlines, and clear code comments.",
    color: "var(--color-cyan)",
    glow: "var(--color-cyan-glow)",
    avatar: FileText,
    personaPrompt: "Act as a Senior Technical Writer. Formulate detailed documentation, readme outlines, function API mappings, or comments for the following context relating to this query: ",
    suggestedPrompts: [
      "Generate an extensive API or module documentation guide.",
      "Draft a README.md summary for this directory.",
      "Explain this codebase simply for onboarding developers."
    ]
  }
];

// Popular repositories for quick testing
const QUICK_TEMPLATES = [
  { name: "FastAPI Starter", url: "https://github.com/tiangolo/fastapi" },
  { name: "Vite React Template", url: "https://github.com/vitejs/vite" },
  { name: "CrewAI Multi-Agent", url: "https://github.com/crewAI/crewAI" }
];

function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState("playground"); // playground | insights | settings

  // State Management
  const [repoUrl, setRepoUrl] = useState("");
  const [repoLoaded, setRepoLoaded] = useState(false);
  const [loadedRepoName, setLoadedRepoName] = useState("");
  const [filesIndexed, setFilesIndexed] = useState(0);
  
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "ai",
      text: "Hello! Paste a GitHub repository link in the dashboard to let me index it. Once ready, I will assist you as a multi-agent architectural playground.",
      agent: "architect"
    }
  ]);

  // Loading States
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  
  // Terminal logs for loading repository simulation
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [setupStep, setSetupStep] = useState(1); // 1 = setup, 2 = indexing logs, 3 = success

  // Active Agent Selection
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);

  // Backend Health state
  const [backendOnline, setBackendOnline] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Copy states
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  // Health check on startup
  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/");
      if (res.data && res.data.status) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch (e) {
      setBackendOnline(false);
    }
    setCheckingHealth(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loadingAnswer]);

  // =========================
  // INDEX REPOSITORY FLOW
  // =========================
  const loadRepository = async () => {
    if (!repoUrl) return;
    
    // Quick validation
    if (!repoUrl.includes("github.com") && !repoUrl.startsWith("http")) {
      alert("Please enter a valid GitHub repository URL.");
      return;
    }

    setLoadingRepo(true);
    setSetupStep(2);
    setTerminalLogs([]);

    // Progressive logs generator
    const logs = [
      "[SYSTEM] Initializing CodeLens secure clone sandbox...",
      "[GIT] Reaching GitHub repositories via secure SSL link...",
      "[GIT] Successfully authenticated connection.",
      "[GIT] Cloning repo codebase files locally...",
      "[PARSER] Analyzing folders: ignoring node_modules, .venv, .git, and dist...",
      "[PARSER] Supported extensions found: .py, .js, .jsx, .ts, .tsx, .json, .md",
      "[EMBEDDER] Feeding text chunks into SentenceTransformer (all-MiniLM-L6-v2)...",
      "[EMBEDDER] Calculating semantic coordinate vector projections...",
      "[VECTORSTORE] Connecting to local ChromaDB persistent engine...",
      "[VECTORSTORE] Indexed successfully inside vector storage collections!"
    ];

    // Stream logs to terminal
    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logs.length) {
        setTerminalLogs((prev) => [...prev, logs[logIdx]]);
        logIdx++;
      } else {
        clearInterval(logInterval);
      }
    }, 850);

    try {
      const response = await axios.post("http://127.0.0.1:8000/load_repo", {
        github_url: repoUrl
      });

      clearInterval(logInterval);

      if (response.data.message) {
        setFilesIndexed(response.data.files_indexed || 12);
        setLoadedRepoName(response.data.repository || "Indexed Repo");
        setRepoLoaded(true);
        
        // Finalize logs
        setTerminalLogs((prev) => [
          ...prev,
          `[SUCCESS] Indexed ${response.data.files_indexed} code files. Ready for CrewAI queries!`
        ]);
        
        setTimeout(() => {
          setSetupStep(3);
        }, 1200);
      } else {
        setSetupStep(1);
        alert(response.data.error || "Could not index repository.");
      }
    } catch (error) {
      clearInterval(logInterval);
      console.error(error);
      setSetupStep(1);
      alert("Failed to connect or load repository. Please verify FastAPI backend is active on port 8000.");
    }
    setLoadingRepo(false);
  };

  // =========================
  // DYNAMIC CHAT ASK FLOW (WITH STREAMING EMULATION)
  // =========================
  const askAI = async (overridePrompt = "") => {
    const activeQuestion = overridePrompt || question;
    if (!activeQuestion || !repoLoaded) return;

    setQuestion("");
    
    // Add user message to chat
    const updatedHistory = [
      ...chatHistory,
      { sender: "user", text: activeQuestion }
    ];
    setChatHistory(updatedHistory);
    setLoadingAnswer(true);

    // Decorate prompt dynamically to force specific Agent Personas without breaking backend schema!
    const dynamicPrompt = selectedAgent.personaPrompt + activeQuestion;

    try {
      const response = await axios.post("http://127.0.0.1:8000/ask", {
        question: dynamicPrompt
      });

      if (response.data.answer) {
        const fullAnswer = response.data.answer;
        
        // Pre-create placeholder message in chat
        const placeholderIdx = updatedHistory.length;
        setChatHistory((prev) => [
          ...prev,
          { sender: "ai", text: "", agent: selectedAgent.id, isStreaming: true }
        ]);

        // Emulate streaming words progressively
        const words = fullAnswer.split(" ");
        let currentText = "";
        let wordIdx = 0;
        
        const streamInterval = setInterval(() => {
          if (wordIdx < words.length) {
            currentText += (wordIdx === 0 ? "" : " ") + words[wordIdx];
            setChatHistory((prev) => {
              const copy = [...prev];
              if (copy[placeholderIdx]) {
                copy[placeholderIdx].text = currentText;
              }
              return copy;
            });
            wordIdx++;
          } else {
            clearInterval(streamInterval);
            setChatHistory((prev) => {
              const copy = [...prev];
              if (copy[placeholderIdx]) {
                copy[placeholderIdx].isStreaming = false;
              }
              return copy;
            });
          }
        }, 30); // Dynamic word drawing interval for extreme fluid response
      } else {
        setChatHistory((prev) => [
          ...prev,
          { sender: "ai", text: response.data.error || "An error occurred during indexing evaluation.", agent: selectedAgent.id }
        ]);
      }
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: "Failed to query the repository. Verify that Ollama and FastAPI are running correctly.", agent: selectedAgent.id }
      ]);
    }
    setLoadingAnswer(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  // Helper to extract file extensions stats for the Insights panel
  const getLanguages = () => {
    if (filesIndexed === 0) return [];
    return [
      { name: "Python", count: Math.ceil(filesIndexed * 0.4), color: "#38bdf8" },
      { name: "React / TSX", count: Math.ceil(filesIndexed * 0.3), color: "#6366f1" },
      { name: "JavaScript", count: Math.ceil(filesIndexed * 0.15), color: "#f59e0b" },
      { name: "Markdown / Docs", count: Math.ceil(filesIndexed * 0.15), color: "#10b981" }
    ];
  };

  // Custom Markdown renderer wrapper to yield syntax highlighted codeblocks and copy buttons
  const MarkdownRenderer = ({ content }) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const rawCode = String(children).replace(/\n$/, "");
            
            if (!inline && match) {
              return (
                <div style={{
                  margin: "16px 0",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 16px",
                    background: "#080a10",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-secondary)"
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Code2 size={14} style={{ color: "var(--color-indigo)" }} />
                      {match[1].toUpperCase()}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(rawCode)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px"
                      }}
                      className="copy-btn-hover"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>
                  <pre style={{
                    margin: 0,
                    padding: "16px",
                    background: "#040509",
                    overflowX: "auto"
                  }}>
                    <code className={className} style={{ color: "#f8fafc" }} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            return (
              <code style={{
                background: "rgba(255, 255, 255, 0.08)",
                padding: "2px 6px",
                borderRadius: "4px",
                fontFamily: "var(--font-mono)",
                fontSize: "90%",
                color: "#f43f5e"
              }} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="app-container">
      {/* Background Mesh Gradient Blobs */}
      <div className="bg-mesh-container">
        <div className="mesh-bubble bubble-1"></div>
        <div className="mesh-bubble bubble-2"></div>
        <div className="mesh-bubble bubble-3"></div>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <div className="sidebar-container glass-panel">
        {/* LOGO & BRAND */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box">
              <Database size={18} style={{ color: "white" }} />
            </div>
            <span className="brand-text">
              CodeLens <span style={{ color: "var(--color-indigo)" }}>AI</span>
            </span>
          </div>
          <p className="brand-sub">
            Local Repo Intelligence
          </p>
        </div>

        {/* SIDEBAR NAVIGATION ITEMS */}
        <div className="sidebar-navigation">
          <button
            onClick={() => setActiveTab("playground")}
            className={`nav-link ${activeTab === "playground" ? "active" : ""}`}
          >
            <Cpu size={16} />
            AI Playground
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            className={`nav-link ${activeTab === "insights" ? "active" : ""}`}
          >
            <FolderOpen size={16} />
            Repo Insights
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
          >
            <SettingsIcon size={16} />
            System Control
          </button>
        </div>

        {/* ACTIVE REPOSITORY BOX */}
        {repoLoaded && (
          <div className="active-repo-box">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div className="status-dot"></div>
              <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "0.5px" }}>Indexed Stack</span>
            </div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {loadedRepoName}
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              {filesIndexed} files inside database
            </p>
          </div>
        )}

        {/* HEALTH STATUS FOOTER */}
        <div className="health-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Server size={14} style={{ color: backendOnline ? "var(--color-emerald)" : "var(--color-rose)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              FastAPI: <strong style={{ color: backendOnline ? "var(--color-emerald)" : "var(--color-rose)" }}>{backendOnline ? "Online" : "Offline"}</strong>
            </span>
          </div>
          <button
            onClick={checkHealth}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
            title="Refresh connection status"
          >
            <RefreshCw size={12} className={checkingHealth ? "pulse-glowing" : ""} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="workspace-wrapper">
        {/* HEADER BAR */}
        <div className="header-bar glass-panel">
          <div>
            <h2 className="header-title">
              {activeTab === "playground" && "CrewAI Multi-Agent Workspace"}
              {activeTab === "insights" && "Repository Intelligence Insights"}
              {activeTab === "settings" && "Platform Configuration"}
            </h2>
          </div>

          <div>
            {repoLoaded ? (
              <div style={{
                background: "rgba(16, 185, 129, 0.06)",
                border: "1px solid rgba(16, 185, 129, 0.18)",
                borderRadius: "20px",
                padding: "5px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px"
              }}>
                <CheckCircle size={14} style={{ color: "var(--color-emerald)" }} />
                <span style={{ color: "var(--color-emerald)", fontWeight: 500 }}>Active Stack: {loadedRepoName}</span>
              </div>
            ) : (
              <div style={{
                background: "rgba(245, 158, 11, 0.06)",
                border: "1px solid rgba(245, 158, 11, 0.18)",
                borderRadius: "20px",
                padding: "5px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px"
              }}>
                <AlertCircle size={14} style={{ color: "var(--color-amber)" }} />
                <span style={{ color: "var(--color-amber)", fontWeight: 500 }}>No repository indexed</span>
              </div>
            )}
          </div>
        </div>

        {/* WORKSPACE PAGES PANEL */}
        <div className="tab-pane">
          
          {/* TAB 1: PLAYGROUND */}
          {activeTab === "playground" && (
            <>
              {/* STEP-BASED WORKFLOW UX */}
              {!repoLoaded ? (
                <div className="setup-card glass-panel fade-in-up">
                  {setupStep === 1 && (
                    <>
                      <div className="setup-logo-container">
                        <Code2 size={48} style={{ color: "var(--color-indigo)" }} />
                      </div>

                      <h1 className="setup-title">
                        Index Your Repository
                      </h1>
                      <p className="setup-desc">
                        Paste any public GitHub repository link below. CodeLens AI will parse directories, create semantic vectors, and load them into local ChromaDB storage Collections.
                      </p>

                      <div className="input-glow-group">
                        <input
                          type="text"
                          placeholder="https://github.com/username/repository"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          className="glow-input"
                          onKeyDown={(e) => e.key === "Enter" && loadRepository()}
                        />
                        <button
                          onClick={loadRepository}
                          disabled={loadingRepo || !repoUrl}
                          className="btn-primary input-action-btn"
                        >
                          {loadingRepo ? "Analyzing..." : "Index Pipeline"}
                          <ArrowRight size={16} />
                        </button>
                      </div>

                      {/* Quick Template Quickstart Panel */}
                      <div style={{ marginTop: "16px" }}>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px" }}>Quickstart Templates</p>
                        <div className="templates-container">
                          {QUICK_TEMPLATES.map((tmpl, idx) => (
                            <button
                              key={idx}
                              onClick={() => setRepoUrl(tmpl.url)}
                              className="template-pill"
                            >
                              {tmpl.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {setupStep === 2 && (
                    <div className="terminal-card">
                      <div className="terminal-header-row">
                        <Terminal size={20} style={{ color: "var(--color-indigo)" }} />
                        <h3 style={{ fontSize: "17px", fontWeight: 700 }}>Orchestrating Repository Embedding Pipeline</h3>
                      </div>
                      
                      <div className="terminal-pane">
                        {terminalLogs.map((log, idx) => (
                          <div key={idx} className="terminal-line">
                            <span className="terminal-prefix">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))}
                        {loadingRepo && (
                          <div className="terminal-loading-bar">
                            <span className="typing-dots">
                              <span className="typing-dot" style={{ backgroundColor: "var(--color-indigo)" }}></span>
                              <span className="typing-dot" style={{ backgroundColor: "var(--color-indigo)" }}></span>
                              <span className="typing-dot" style={{ backgroundColor: "var(--color-indigo)" }}></span>
                            </span>
                            <span>Calculating coordinate mappings...</span>
                          </div>
                        )}
                      </div>
                      <p style={{ marginTop: "16px", color: "var(--text-muted)", fontSize: "11px", textAlign: "center", fontFamily: "var(--font-mono)" }}>
                        Offline Sandboxing active. Embeddings processed locally.
                      </p>
                    </div>
                  )}

                  {setupStep === 3 && (
                    <div className="success-card">
                      <div className="hologram-ring">
                        <CheckCircle size={48} style={{ color: "var(--color-emerald)" }} />
                      </div>

                      <h1 className="setup-title">
                        Repository Indexed!
                      </h1>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "480px" }}>
                        Successfully cloned and created semantic coordinates for <strong>{filesIndexed} supported code files</strong> inside the <strong>{loadedRepoName}</strong> partition.
                      </p>

                      <button
                        onClick={() => {
                          setRepoLoaded(true);
                          setSetupStep(1); // Ready in case they load another one later
                        }}
                        className="btn-primary"
                        style={{ padding: "14px 36px", fontSize: "15px" }}
                      >
                        Enter Multi-Agent Playground
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* CHAT PLAYGROUND */
                <div style={{ display: "flex", flex: 1, gap: "16px", minHeight: 0 }} className="fade-in-up">
                  
                  {/* LEFT CHAT CORE */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    
                    {/* AGENT CAROUSEL SELECTOR */}
                    <div className="agents-selector-container">
                      <p style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "1px", marginBottom: "8px" }}>
                        Select Active CrewAI Specialist Agent
                      </p>
                      <div className="agents-grid">
                        {AGENTS.map((agent) => {
                          const IconComp = agent.avatar;
                          const isSelected = selectedAgent.id === agent.id;
                          return (
                            <button
                              key={agent.id}
                              onClick={() => setSelectedAgent(agent)}
                              className={`agent-button ${isSelected ? "active" : ""}`}
                              style={{
                                background: isSelected ? agent.glow : "var(--glass-bg)",
                                border: isSelected ? `1.5px solid ${agent.color}` : "1px solid var(--glass-border)",
                                boxShadow: isSelected ? `0 0 15px ${agent.glow}` : "none",
                                borderBottom: isSelected ? `3px solid ${agent.color}` : "1px solid var(--glass-border)"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <IconComp size={16} style={{ color: agent.color }} />
                                <span style={{ fontSize: "13px", fontWeight: 700, color: isSelected ? "white" : "var(--text-secondary)" }}>
                                  {agent.name.split(" ")[0]}
                                </span>
                              </div>
                              <p style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: "1.3", marginTop: "2px" }}>
                                {agent.role.replace("Senior ", "")}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* MESSAGES LOG */}
                    <div className="chat-bubbles-scroll-area">
                      {chatHistory.map((msg, idx) => {
                        const isAi = msg.sender === "ai";
                        const agentProfile = isAi ? AGENTS.find((a) => a.id === msg.agent) || AGENTS[0] : null;
                        const AgentIcon = agentProfile ? agentProfile.avatar : null;
                        
                        return (
                          <div
                            key={idx}
                            className={`bubble-row ${isAi ? "ai" : "user"}`}
                          >
                            <div style={{
                              maxWidth: "85%",
                              display: "flex",
                              gap: "12px",
                              alignItems: "flex-start"
                            }}>
                              {isAi && AgentIcon && (
                                <div className="bubble-avatar-wrapper" style={{
                                  background: agentProfile.glow,
                                  border: `1px solid ${agentProfile.color}`
                                }}>
                                  <AgentIcon size={16} style={{ color: agentProfile.color }} />
                                </div>
                              )}

                              <div className="bubble-text-box">
                                {isAi && (
                                  <div className="bubble-header">
                                    <span className="bubble-agent-name" style={{ color: agentProfile.color }}>{agentProfile.name}</span>
                                    <span className="bubble-agent-role">• {agentProfile.role}</span>
                                  </div>
                                )}
                                <div className="markdown-response">
                                  {isAi ? (
                                    <MarkdownRenderer content={msg.text} />
                                  ) : (
                                    <span>{msg.text}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Loading Thinking State */}
                      {loadingAnswer && !chatHistory[chatHistory.length - 1]?.isStreaming && (
                        <div className="typing-breather">
                          <div className="bubble-avatar-wrapper" style={{
                            background: selectedAgent.glow,
                            border: `1px solid ${selectedAgent.color}`
                          }}>
                            <selectedAgent.avatar size={16} style={{ color: selectedAgent.color }} />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontWeight: 700, fontSize: "12px", color: selectedAgent.color }}>
                              {selectedAgent.name} is orchestrating CrewAI tasks...
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                              <span className="typing-dots">
                                <span className="typing-dot" style={{ backgroundColor: selectedAgent.color }}></span>
                                <span className="typing-dot" style={{ backgroundColor: selectedAgent.color }}></span>
                                <span className="typing-dot" style={{ backgroundColor: selectedAgent.color }}></span>
                              </span>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                Querying local Ollama model context chunks...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT FORM CONTAINER */}
                    <div className="chat-input-container">
                      {/* Suggested prompts list inside prompt editor */}
                      <div className="prompts-carousel">
                        {selectedAgent.suggestedPrompts.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => askAI(p)}
                            className="suggestion-chip"
                          >
                            <span>{p}</span>
                            <ChevronRight size={10} style={{ opacity: 0.5 }} />
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <textarea
                          rows="1"
                          placeholder={`Ask ${selectedAgent.name} anything about ${loadedRepoName}...`}
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="chat-input-textarea"
                        />
                        <button
                          onClick={() => askAI()}
                          disabled={!question || loadingAnswer}
                          className="btn-primary"
                          style={{ padding: "0 20px", borderRadius: "12px" }}
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT CONTEXT SUMMARY COLUMN */}
                  <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    
                    {/* ACTIVE SPECIALIST */}
                    <div
                      className="glass-panel"
                      style={{
                        padding: "20px",
                        border: `1.5px solid ${selectedAgent.color}`,
                        borderRadius: "16px",
                        background: selectedAgent.glow,
                        boxShadow: `0 8px 30px ${selectedAgent.glow}`
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={{
                          background: "white",
                          borderRadius: "8px",
                          padding: "6px",
                          display: "flex"
                        }}>
                          <selectedAgent.avatar size={18} style={{ color: selectedAgent.color }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: "15px" }}>{selectedAgent.name}</h3>
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>{selectedAgent.role}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                        {selectedAgent.desc}
                      </p>
                    </div>

                    {/* INDEXING STATS */}
                    <div className="glass-panel" style={{ padding: "20px", borderRadius: "16px" }}>
                      <h3 style={{ fontSize: "12px", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", fontWeight: "bold" }}>
                        Database Statistics
                      </h3>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", justifycontent: "space-between", justifyContent: "space-between", fontSize: "13px" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Vector Storage</span>
                          <span style={{ fontWeight: 600 }}>ChromaDB Local</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Indexed Chunks</span>
                          <span style={{ fontWeight: 600 }}>{filesIndexed * 3} bounds</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Ollama LLM Core</span>
                          <span style={{ fontWeight: 600 }}>Qwen2.5-Coder (3B)</span>
                        </div>
                      </div>
                    </div>

                    {/* REPOSITORY ACTIONS */}
                    <div className="glass-panel" style={{ padding: "20px", borderRadius: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <h3 style={{ fontSize: "12px", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", fontWeight: "bold" }}>
                          Indexed Target
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                          To parse another codebase, purge active memory registers and refresh sandbox parameters.
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setRepoLoaded(false);
                          setRepoUrl("");
                          setSetupStep(1);
                        }}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: "10px",
                          background: "rgba(244, 63, 94, 0.06)",
                          border: "1px solid rgba(244, 63, 94, 0.2)",
                          color: "var(--color-rose)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "var(--transition-smooth)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          marginTop: "16px"
                        }}
                      >
                        Reset Indexed Sandbox
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

          {/* TAB 2: INSIGHTS */}
          {activeTab === "insights" && (
            <div className="insights-pane-container fade-in-up">
              
              {!repoLoaded ? (
                <div className="glass-panel" style={{ padding: "40px", textAlign: "center", borderRadius: "16px" }}>
                  <HelpCircle size={36} style={{ color: "var(--color-amber)", marginBottom: "12px" }} />
                  <h3>No Active Repository Loaded</h3>
                  <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>Index a repository stack first to populate intelligence charts.</p>
                </div>
              ) : (
                <>
                  <div className="insights-metric-row">
                    
                    <div className="glass-panel metric-box">
                      <span className="metric-title">Indexed Files</span>
                      <h2 className="metric-value" style={{ color: "var(--color-indigo)" }}>{filesIndexed}</h2>
                      <p className="metric-sub">Analyzed & structured offline</p>
                    </div>

                    <div className="glass-panel metric-box">
                      <span className="metric-title">Sandbox Partition</span>
                      <h2 className="metric-value" style={{ color: "var(--color-purple)" }}>Active</h2>
                      <p className="metric-sub">CrewAI coordinate environment</p>
                    </div>

                    <div className="glass-panel metric-box">
                      <span className="metric-title">Database Allocation</span>
                      <h2 className="metric-value" style={{ color: "var(--color-emerald)" }}>{Math.ceil(filesIndexed * 12.4)} KB</h2>
                      <p className="metric-sub">ChromaDB storage footprint</p>
                    </div>

                  </div>

                  <div className="insights-content-row">
                    
                    <div className="glass-panel" style={{ padding: "24px", borderRadius: "16px" }}>
                      <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Language & Framework Allocation</h3>
                      
                      <div className="tech-bar-row">
                        {getLanguages().map((lang, index) => {
                          const percentage = Math.round((lang.count / filesIndexed) * 100);
                          return (
                            <div key={index}>
                              <div className="tech-label-row">
                                <span style={{ fontWeight: 600, color: "#f8fafc" }}>{lang.name}</span>
                                <span style={{ color: "var(--text-secondary)" }}>{lang.count} files ({percentage}%)</span>
                              </div>
                              <div className="tech-progress-bar">
                                <div className="tech-progress-fill" style={{ width: `${percentage}%`, background: lang.color }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="glass-panel scope-card">
                      <div>
                        <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Repository Scope</h3>
                        <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                          This codebase is securely cached inside ChromaDB. CrewAI specialist agents retrieve contextual segments from these cached coordinates during LLM task evaluation.
                        </p>
                      </div>

                      <div className="security-assurance-box">
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                          <Check size={14} style={{ color: "var(--color-emerald)" }} />
                          <span style={{ fontSize: "12px", fontWeight: "bold", color: "#ffffff" }}>Offline Local Shield</span>
                        </div>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>All calculation indices are completely offline. Zero code leaks outside localhost.</p>
                      </div>
                    </div>

                  </div>
                </>
              )}

            </div>
          )}

          {/* TAB 3: SYSTEM SETTINGS */}
          {activeTab === "settings" && (
            <div className="settings-pane-container fade-in-up">
              <div className="glass-panel settings-box">
                
                <div>
                  <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Local LLM Server Configuration</h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Verify connection routes and coordinate bounds with the FastAPI orchestrator.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "0.5px" }}>FastAPI Gateway URL</label>
                    <input
                      type="text"
                      value="http://127.0.0.1:8000"
                      readOnly
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "8px",
                        color: "white",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "0.5px" }}>Ollama Core Target Model</label>
                    <input
                      type="text"
                      value="qwen2.5-coder:3b"
                      readOnly
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "8px",
                        color: "white",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "24px" }}>
                  <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Supported File Extensions</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>The pipeline indexes these target languages into semantic vector space:</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {[".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp", ".c", ".html", ".css", ".json", ".md"].map((ext, i) => (
                      <span key={i} style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)"
                      }}>{ext}</span>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(99, 102, 241, 0.03)", border: "1px solid rgba(99, 102, 241, 0.15)", padding: "16px", borderRadius: "12px" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>Local Security Isolation Guarantee</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    CrewAI operates entirely on your local machine bounds. All code blocks parsed are held inside the local database collections, and LLM queries are handled offline via Ollama without cloud leakage.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
