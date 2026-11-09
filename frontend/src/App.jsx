import { useState } from "react";

import Sidebar from "./layout/Sidebar";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";

import "./App.css";

function App() {
  const [selectedMode, setSelectedMode] = useState("summarize");

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <Header />

        <WelcomeScreen
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
        />
      </main>
    </div>
  );
}

export default App;
