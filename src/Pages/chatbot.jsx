import React, { useState, useRef, useEffect } from "react";
import Navbar from "../Components/Navbar/Navbar";
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processPrompt = async (prompt) => {
    let response;
    try {
      response = await fetch("http://localhost:4000/api/processPrompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error:", error);
      return "This operation requires database modification which is not allowed. Please ask questions about reading/querying the existing data only.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await processPrompt(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-black">
      <Navbar />
      {/* Header */}
      <div className="bg-black border-b border-gray-700 p-4 mt-[68px]">
        <h1 className="text-xl font-semibold text-center text-white">
          DataBridge AI
        </h1>
      </div>

      {/* Chat Container */}
      <div className="flex-1 text-left overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-4 p-4 rounded-lg ${
              message.role === "assistant" ? "bg-gray-800" : "bg-black"
            }`}
          >
            <div className="flex-1">
              {message.role === "assistant" && message.content.query && (
                <div className="mb-2">
                  <p className="text-gray-400 text-sm">Generated Query:</p>
                  <code className="block bg-gray-900 p-2 rounded mt-1 text-green-400">
                    {message.content.query}
                  </code>
                </div>
              )}
              <p className="text-white">
                {typeof message.content === "string"
                  ? message.content
                  : message.content.response}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-400 p-4">
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <div className="border-t border-gray-700 bg-black p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white 
                       placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1
                        bg-black text-white rounded-lg hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              disabled={!input.trim() || isLoading}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
