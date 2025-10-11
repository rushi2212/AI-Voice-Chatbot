import React, { useEffect, useRef, useState } from "react";
import VoiceInput from "./VoiceInput";
import { sendMessage } from "../api/chatApi";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text) => {
    if (!speechEnabled || !window.speechSynthesis) return;

    // Stop any ongoing speech
    stopSpeech();

    // Clean text for better speech (remove markdown-style bullets)
    const cleanText = text.replace(/[•*-]/g, "").replace(/\n+/g, ". ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const pushMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text, ts: Date.now() }]);

    // Auto-speak bot responses
    if (sender === "bot" && speechEnabled) {
      setTimeout(() => speakText(text), 500);
    }
  };

  const handleSend = async (msg) => {
    const text = (msg ?? input).trim();
    if (!text) return;
    setError("");
    setInput("");
    pushMessage("user", text);
    setLoading(true);
    try {
      const response = await sendMessage(text);
      pushMessage("bot", response);
    } catch (e) {
      console.error(e);
      setError("Failed to send message.");
      pushMessage("bot", "Sorry, I couldn't process that right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-shell">
      <div className="chat-window" ref={listRef}>
        {messages.length === 0 && (
          <div className="chat-placeholder">
            Ask about emergency services, disaster preparedness, or safety tips
            for India.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={m.ts + i}
            className={`bubble ${
              m.sender === "user" ? "bubble-user" : "bubble-bot"
            }`}
          >
            {m.text}
            {m.sender === "bot" && (
              <button
                className="speak-btn"
                onClick={() => speakText(m.text)}
                title="Read aloud"
              >
                🔊
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="typing">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="composer">
        <button
          className="toggle-btn"
          onClick={() => setSpeechEnabled(!speechEnabled)}
          title={speechEnabled ? "Disable auto-speech" : "Enable auto-speech"}
        >
          {speechEnabled ? "🔊" : "🔇"}
        </button>
        {isSpeaking && (
          <button className="stop-btn" onClick={stopSpeech} title="Stop audio">
            ⏹️
          </button>
        )}
        <input
          className="text-input"
          type="text"
          placeholder="Ask about emergency help in India..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={() => handleSend()}
          disabled={loading}
        >
          Send
        </button>
        <VoiceInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatBox;
