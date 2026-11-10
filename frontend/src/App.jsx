import { useEffect, useState } from "react";

import Sidebar from "./layout/Sidebar";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";

import "./App.css";

const HISTORY_STORAGE_KEY = "gemini-analysis-history";
const MAX_HISTORY_ITEMS = 20;

function App() {
  const [selectedMode, setSelectedMode] = useState("summarize");
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [backendStatus, setBackendStatus] = useState("Checking...");

  const [history, setHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error("Could not load analysis history:", error);
      return [];
    }
  });

  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Check backend connection.
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend connection failed");
        }

        return response.json();
      })
      .then((data) => {
        setBackendStatus(data.status === "ok" ? "Connected" : "Unavailable");
      })
      .catch((error) => {
        console.error("Backend connection error:", error);
        setBackendStatus("Disconnected");
      });
  }, []);

  // Save history whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Could not save analysis history:", error);
    }
  }, [history]);

  // Save a successfully completed analysis.
  const handleAnalysisComplete = (result) => {
    const historyItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      sessionId: result.sessionId,
      filename: result.filename,
      mode: result.mode,
      question: result.question,
      analysis: result.analysis,
      createdAt: new Date().toISOString(),
    };

    setHistory((previousHistory) =>
      [historyItem, ...previousHistory].slice(0, MAX_HISTORY_ITEMS),
    );

    setActiveHistoryId(historyItem.id);

    setSessionId(result.sessionId);

    setMessages([]);
  };

  // Open a previous analysis.
  const handleSelectHistory = async (item) => {
    setAnalysis(item.analysis);
    setSelectedMode(item.mode);
    setSelectedFile(null);
    setActiveHistoryId(item.id);
    setSessionId(item.sessionId || null);

    if (!item.sessionId) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/chat/${item.sessionId}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not retrieve conversation.");
      }

      // Skip the initial analysis prompt and response.
      // The original analysis is already displayed separately.
      setMessages(data.history.slice(2));
    } catch (error) {
      console.error("Conversation retrieval error:", error);
    }
  };

  // Delete a history entry.
  const handleDeleteHistory = (id) => {
    setHistory((previousHistory) =>
      previousHistory.filter((item) => item.id !== id),
    );

    if (activeHistoryId === id) {
      setActiveHistoryId(null);
      setAnalysis("");
      setSessionId(null);
    }
  };

  // Start a fresh analysis.
  const handleNewAnalysis = () => {
    setSelectedFile(null);
    setSelectedMode("summarize");
    setAnalysis("");
    setActiveHistoryId(null);
    setSessionId(null);
    setMessages([]);
  };

  return (
    <div className="app-container">
      <Sidebar
        history={history}
        activeHistoryId={activeHistoryId}
        onSelectHistory={handleSelectHistory}
        onDeleteHistory={handleDeleteHistory}
        onNewAnalysis={handleNewAnalysis}
      />

      <main className="main-content">
        <Header />

        <div className="connection-status">
          <span
            className={
              backendStatus === "Connected"
                ? "status-indicator connected"
                : "status-indicator disconnected"
            }
          ></span>
          Python Backend: {backendStatus}
        </div>

        <WelcomeScreen
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          analysis={analysis}
          onAnalysisChange={setAnalysis}
          onAnalysisComplete={handleAnalysisComplete}
          sessionId={sessionId}
          messages={messages}
          onMessagesChange={setMessages}
        />
      </main>
    </div>
  );
}

export default App;
