import {
  BrainCircuit,
  Plus,
  LayoutDashboard,
  FileText,
  Clock,
  Settings,
  Trash2,
} from "lucide-react";

function Sidebar({
  history = [],
  onSelectHistory,
  onNewAnalysis,
  onDeleteHistory,
  activeHistoryId,
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    if (Number.isNaN(date.getTime())) return "";

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (isToday) return "Today";
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString();
  };

  return (
    <aside className="sidebar">
      {/* Application branding */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <BrainCircuit size={24} />
        </div>

        <div className="brand-text">
          <h2>Gemini AI</h2>
          <span>File Analysis</span>
        </div>
      </div>

      {/* New analysis button */}
      <button className="new-analysis-btn" onClick={onNewAnalysis}>
        <Plus size={18} />
        <span>New Analysis</span>
      </button>

      {/* Main navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-label">MENU</p>

        <a href="#" className="nav-item active">
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </a>

        <a href="#" className="nav-item">
          <FileText size={18} />
          <span>My Documents</span>
        </a>

        <a href="#" className="nav-item">
          <Clock size={18} />
          <span>Recent Activity</span>
        </a>
      </nav>

      {/* Recent analysis history */}
      <div className="recent-documents">
        <p className="sidebar-label">RECENT ANALYSES</p>

        {history.length === 0 ? (
          <p className="empty-history">
            Your previous analyses will appear here.
          </p>
        ) : (
          history.map((item) => (
            <div
              className={`recent-document ${
                activeHistoryId === item.id ? "active" : ""
              }`}
              key={item.id}
            >
              <button
                className="history-select-btn"
                onClick={() => onSelectHistory(item)}
                title={`Open analysis of ${item.filename}`}
              >
                <FileText size={17} />

                <span className="document-info">
                  <span className="document-name">{item.filename}</span>

                  <span className="document-date">
                    {item.mode} · {formatDate(item.createdAt)}
                  </span>
                </span>
              </button>

              <button
                className="delete-history-btn"
                onClick={() => onDeleteHistory(item.id)}
                title="Delete this analysis"
                aria-label={`Delete analysis of ${item.filename}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Sidebar footer */}
      <div className="sidebar-footer">
        <button className="nav-item">
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <div className="sidebar-version">
          <span>Gemini File Analysis</span>
          <span>Version 1.0</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
