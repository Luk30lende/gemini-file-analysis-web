import {
  FileText,
  Lightbulb,
  ChartNoAxesCombined,
  MessageCircleQuestion,
} from "lucide-react";

const modes = [
  {
    id: "summarize",
    title: "Summarize",
    description: "Extract the most important information from your document.",
    icon: FileText,
  },
  {
    id: "explain",
    title: "Explain",
    description: "Break down complex information into simple language.",
    icon: Lightbulb,
  },
  {
    id: "analyze",
    title: "Analyze",
    description: "Explore findings, patterns and important relationships.",
    icon: ChartNoAxesCombined,
  },
  {
    id: "question",
    title: "Ask Questions",
    description: "Ask specific questions about your uploaded document.",
    icon: MessageCircleQuestion,
  },
];

function AnalysisModes({ selectedMode, onModeChange }) {
  return (
    <section className="analysis-modes-section">
      <div className="section-heading">
        <h3>Choose an analysis mode</h3>
        <p>What would you like Gemini to do with your document?</p>
      </div>

      <div className="analysis-modes-grid">
        {modes.map((mode) => {
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              type="button"
              className={`analysis-mode-card ${
                selectedMode === mode.id ? "selected" : ""
              }`}
              onClick={() => onModeChange(mode.id)}
              aria-pressed={selectedMode === mode.id}
            >
              <div className="mode-icon">
                <Icon size={22} />
              </div>

              <h4>{mode.title}</h4>

              <p>{mode.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default AnalysisModes;
