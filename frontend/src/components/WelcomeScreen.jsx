import { Sparkles } from "lucide-react";

import FileUpload from "./FileUpload";
import AnalysisModes from "./AnalysisModes";

function WelcomeScreen({ selectedMode, onModeChange }) {
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

      <FileUpload />

      <AnalysisModes selectedMode={selectedMode} onModeChange={onModeChange} />

      <div className="welcome-footer">
        <p>Powered by Google Gemini. Your documents are analyzed using AI.</p>
      </div>
    </div>
  );
}

export default WelcomeScreen;
