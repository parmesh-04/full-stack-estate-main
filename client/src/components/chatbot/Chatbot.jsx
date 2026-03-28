import { useState, useRef, useEffect } from "react";
import "./chatbot.scss";
import apiRequest from "../../lib/apiRequest";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "model", text: "Hello! I am your real estate AI assistant. How can I help you today?" }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const res = await apiRequest.post("/ai/chat", {
        message: input,
        history: history.slice(1) // Omit the hardcoded initial greeting from the Gemini history format
      });

      setMessages((prev) => [...prev, { role: "model", text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "model", text: "Oops, something went wrong. Try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chatbot ${isOpen ? "open" : "closed"}`}>
      {!isOpen && (
        <button className="chat-toggle" onClick={toggleChat}>
          ✨ AI Assistant
        </button>
      )}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h4>AI Real Estate Assistant</h4>
            <button onClick={toggleChat}>✖</button>
          </div>
          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                <p>{m.text}</p>
              </div>
            ))}
            {isLoading && <div className="message model"><p>Typing...</p></div>}
            <div ref={messageEndRef} />
          </div>
          <form className="chat-footer" onSubmit={sendMessage}>
            <input 
              type="text" 
              placeholder="Ask anything about properties..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            <button type="submit" disabled={isLoading}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
