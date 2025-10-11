import React, { useState } from "react";

const VoiceInput = ({ onSend }) => {
  const [recording, setRecording] = useState(false);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onSend(transcript);
    };

    recognition.onend = () => setRecording(false);
    setRecording(true);
  };

  return (
    <button
      className="send-btn"
      onClick={handleVoiceInput}
      title="Use your voice"
    >
      {recording ? "Listening..." : "🎙️ Voice"}
    </button>
  );
};

export default VoiceInput;
