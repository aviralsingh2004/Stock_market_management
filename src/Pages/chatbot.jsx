import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../Components/Navbar/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Register required Chart.js elements once
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Build dataset for Chart.js from the backend payload
const GraphRenderer = ({ payload }) => {
  if (!payload || !payload.mapping || !payload.data) return null;

  const { type, mapping, data, reason } = payload;
  const { xKey, yKey, yKeys } = mapping;

  if (!xKey || (!yKey && !yKeys)) {
    return (
      <p className="text-yellow-400">Unable to build chart from the data.</p>
    );
  }

  const labels = data.map((row) => {
    const v = row[xKey];
    try {
      // Render ISO dates nicely if possible
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    } catch (_) {}
    return String(v);
  });

  const numericKeys = Array.isArray(yKeys) && yKeys.length ? yKeys : [yKey];

  const datasets = numericKeys.map((key, idx) => ({
    label: key,
    data: data.map((row) => Number(row[key]) || 0),
    backgroundColor:
      type === "bar"
        ? [
            "#4BC0C0",
            "#36A2EB",
            "#9966FF",
            "#FF6384",
            "#FF9F40",
          ][idx % 5]
        : "rgba(75,192,192,0.6)",
    borderColor: type === "line" ? "rgb(75,192,192)" : undefined,
    borderWidth: type === "line" ? 2 : undefined,
    tension: type === "line" ? 0.2 : undefined,
    fill: type === "line",
  }));

  const chartData = { labels, datasets };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: !!reason, text: reason || "" },
    },
    scales: {
      x: { ticks: { color: "#fff" } },
      y: { ticks: { color: "#fff" } },
    },
  };

  return type === "bar" ? (
    <Bar data={chartData} options={chartOptions} />
  ) : (
    <Line data={chartData} options={chartOptions} />
  );
};
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleUnauthorized = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true, state: { from: location } });
  }, [location, logout, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processPrompt = async (prompt) => {
    let response;
    try {
      console.log("Sending prompt:", prompt);
      response = await fetch("http://localhost:4000/api/ai/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for session management
        body: JSON.stringify({ prompt }),
      });

      console.log("Response status:", response.status);

      if (response.status === 401) {
        await handleUnauthorized();
        return "Session expired. Redirecting to login.";
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      return data; // return full payload including graph details
    } catch (error) {
      console.error("Error in processPrompt:", error);
      return {
        interpretation:
          "This operation requires database modification which is not allowed. Please ask questions about reading/querying the existing data only.",
      };
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
      console.log("AI Response received:", response);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
        },
      ]);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
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
              {/* Intentionally hide generated SQL from UI */}

              {/* Assistant interpretation text */}
              <p className="text-white mb-2">
                {typeof message.content === "string"
                  ? message.content
                  : message.content?.interpretation ||
                    message.content?.response ||
                    "No response"}
              </p>

              {/* Optional graph rendering */}
              {message.role === "assistant" &&
                typeof message.content === "object" &&
                message.content?.graph?.required && (
                  <div className="bg-gray-900 p-4 rounded-lg mt-2">
                    <GraphRenderer payload={message.content.graph} />
                  </div>
                )}
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









