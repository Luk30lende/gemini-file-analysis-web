import {
  BrainCircuit,
  Plus,
  LayoutDashboard,
  FileText,
  Clock,
  Settings,
  ChevronLeft,
} from "lucide-react";

function Sidebar() {
  const recentDocuments = [
    { id: 1, name: "Research Paper.pdf", date: "Today" },
    { id: 2, name: "Sales Report.csv", date: "Yesterday" },
    { id: 3, name: "Project Proposal.docx", date: "2 days ago" },
  ];

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
      <button className="new-analysis-btn">
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

      {/* Recent documents */}
      <div className="recent-documents">
        <p className="sidebar-label">RECENT DOCUMENTS</p>

        {recentDocuments.map((document) => (
          <button className="recent-document" key={document.id}>
            <FileText size={17} />

            <span className="document-info">
              <span className="document-name">{document.name}</span>

              <span className="document-date">{document.date}</span>
            </span>
          </button>
        ))}
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
