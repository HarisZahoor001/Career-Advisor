import React, { useState, useRef, useEffect } from "react";
import Navbar from "./Navbar";
import "../App.css"

export default function Chatbot() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatbot_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Save messages
  useEffect(() => {
    localStorage.setItem("chatbot_messages", JSON.stringify(messages));
  }, [messages]);

  // Focus input and scroll
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatbot_messages");
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userInput = input.trim();
    const userMessage = { sender: "user", text: userInput, timestamp: Date.now() };
    
    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError(null);

    // Add placeholder for bot response - use a unique ID
    const botMessageId = Date.now();
    const botMessage = { 
      id: botMessageId,
      sender: "bot", 
      text: "", 
      timestamp: Date.now(),
      isError: false 
    };
    setMessages(prev => [...prev, botMessage]);

    try {
      // Prepare messages for API (without the empty bot message we just added)
      const messagesForAPI = messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));
      
      messagesForAPI.unshift({ 
        role: "system", 
        content: "You are a helpful assistant. Keep responses clear and concise." 
      });
      
      messagesForAPI.push({ role: "user", content: userInput });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: messagesForAPI,
          stream: true,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep incomplete line for next iteration
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (!trimmedLine || trimmedLine === 'data: [DONE]') {
            continue;
          }
          
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.substring(6);
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices[0]?.delta?.content || "";
              
              if (content) {
                accumulatedText += content;
                
                // Update the specific bot message
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, text: accumulatedText }
                    : msg
                ));
              }
            } catch (err) {
              console.warn('Parse error for line:', jsonStr);
            }
          }
        }
      }
      
      setIsTyping(false);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { 
              ...msg, 
              text: `Error: ${err.message || "Failed to get response"}`, 
              isError: true 
            }
          : msg
      ));
      
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Define message colors
  const getMessageStyle = (sender) => {
    if (sender === "user") {
      return "bg-blue-600 text-white rounded-br-none";
    } else {
      return "bg-gray-700 text-white rounded-bl-none";
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
        <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px),
            repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px)
          `,
          backgroundSize: '100px 100px',
          opacity: 0.1,
        }}
      ></div>
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl mt-16">
        <div className="flex justify-between items-center mb-6">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Chat messages */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-4 flex-1 overflow-y-auto max-h-[60vh] border border-gray-700">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              <p className="text-lg mb-4">Start a conversation with the AI assistant</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                {["Explain quantum computing", "Write a short poem", "Help me plan a workout", "What is React?"].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left text-sm transition text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`mb-4 ${msg.sender === "user" ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`inline-block px-4 py-3 rounded-xl max-w-[85%] ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                        : msg.isError
                        ? "bg-gradient-to-r from-red-900/80 to-red-800/80 text-red-100 border border-red-700/50"
                        : "bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-bl-none border border-gray-700/50"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                    {msg.isError && (
                      <button
                        onClick={() => {
                          // Simple retry logic
                          const lastUserMessage = messages[messages.length - 2]?.text;
                          if (lastUserMessage) {
                            setInput(lastUserMessage);
                            inputRef.current?.focus();
                          }
                        }}
                        className="text-xs mt-2 text-red-300 hover:text-red-200 underline"
                      >
                        Click to retry
                      </button>
                    )}
                  </div>
                  <div className={`text-xs text-gray-400 mt-1 px-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="text-left mb-4">
                  <div className="inline-block px-4  bg-gray-600 py-3  text-white rounded-xl rounded-bl-none border border-gray-700/50">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-200 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Input area */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTyping}
              className="flex-1 px-4 py-3 bg-gray-900/70 text-white rounded-full border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 btn text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isTyping ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : "Send"}
            </button>
          </div>
          <p className="text-gray-400 text-xs text-center mt-3">
            Powered by OpenAI GPT-3.5 • Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}