import { useState } from "react";
import { Sparkles, LoaderCircle, FileText, AlertCircle } from "lucide-react";

import FileUpload from "./FileUpload";
import AnalysisModes from "./AnalysisModes";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function WelcomeScreen({
  selectedMode,
  onModeChange,
  selectedFile,
  onFileSelect,
  analysis,
  onAnalysisChange,
  onAnalysisComplete,
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a document first.");
      return;
    }

    setIsAnalyzing(true);
    onAnalysisChange("");
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mode", selectedMode);
    formData.append("question", question);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Document analysis failed.");
      }

      onAnalysisChange(data.analysis);

      onAnalysisComplete({
        filename: data.filename,
        mode: data.mode,
        question: selectedMode === "question" ? question : "",
        analysis: data.analysis,
      });
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-heading">
        <div className="welcome-badge">
          <Sparkles size={15} />
          <span>AI-Powered Document Analysis</span>
        </div>

        <h1>
          Understand your documents
          <br />
          <span>with Gemini AI.</span>
        </h1>

        <p>
          Upload your documents, explore important insights, and get clear
          answers to your questions.
        </p>
      </div>

      <FileUpload
        selectedFile={selectedFile}
        onFileSelect={(file) => {
          onFileSelect(file);
          onAnalysisChange("");
          setError("");
        }}
      />

      <AnalysisModes
        selectedMode={selectedMode}
        onModeChange={(mode) => {
          onModeChange(mode);
          onAnalysisChange("");
          setError("");
        }}
      />

      {selectedMode === "question" && (
        <div className="question-input-section">
          <label htmlFor="document-question">
            What would you like to know about this document?
          </label>

          <textarea
            id="document-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g. What are the main findings of this document?"
            rows={4}
            disabled={isAnalyzing}
          />

          <p>
            Leave this field empty if you want Gemini to generate questions and
            answers automatically.
          </p>
        </div>
      )}

      <div className="analyze-action">
        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={!selectedFile || isAnalyzing}
          type="button"
        >
          {isAnalyzing ? (
            <>
              <LoaderCircle size={18} className="spin-icon" />
              Analyzing Document...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze Document
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="analysis-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {analysis && (
        <div className="analysis-result">
          <div className="analysis-result-header">
            <div>
              <FileText size={20} />
              <h2>Analysis Results</h2>
            </div>

            <span className="analysis-mode-label">{selectedMode}</span>
          </div>

          <div className="analysis-result-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {analysis}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <div className="welcome-footer">
        <p>Powered by Google Gemini. Your documents are analyzed using AI.</p>
      </div>
    </div>
  );
}

export default WelcomeScreen;
