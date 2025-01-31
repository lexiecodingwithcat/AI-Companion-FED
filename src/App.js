import { useState } from "react";
import { getAIResponse } from "./services/aiService";
import { speakText, stopSpeech } from "./services/ttsService";
import "./styles/index.css"; // Import the existing CSS file

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  async function handleSubmit() {
    if (!input) return;
    const userMessage = { role: "user", text: input };
    const botReply = await getAIResponse(input);
    setMessages([...messages, userMessage, { role: "bot", text: botReply }]);
    setInput("");
    speakText(botReply);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline in textarea
      handleSubmit();
    }
  };

  return (
    <div className="App">
      <h1>AI Chat</h1>
      <div className="chat-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={4} // Make the textbox larger
        />
        <div className="buttons">
          <button onClick={handleSubmit}>Send</button>
          <button onClick={stopSpeech}>Stop Voice</button>
        </div>
      </div>
    </div>
  );
}

export default App;