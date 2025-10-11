import React from "react";
import ChatBox from "./components/ChatBox";
import "./App.css";

const App = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">
          <span className="logo-circle">⚠️</span>
          <div>
            <h1>Disaster Assistant</h1>
            <p className="subtitle">Voice + text chat for rapid help</p>
          </div>
        </div>
      </header>
      <main className="app-main">
        <ChatBox />
      </main>
      <footer className="app-footer">
        <span>
          Stay safe. This tool may make mistakes—verify critical information.
        </span>
      </footer>
    </div>
  );
};

export default App;
