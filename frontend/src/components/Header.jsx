import { Sparkles, Bell, Menu } from "lucide-react";

function Header() {
  return (
    <header className="workspace-header">
      <div className="header-left">
        <div>
          <h2>Document Workspace</h2>
          <p>Analyze and understand your documents with AI.</p>
        </div>
      </div>

      <div className="header-right">
        <div className="ai-status">
          <span className="status-indicator"></span>
          <Sparkles size={15} />
          <span>AI Workspace</span>
        </div>

        <button
          className="header-icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
        </button>
      </div>
    </header>
  );
}

export default Header;
