import { useState } from "react";

function AIChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I am IPL Nexus AI Assistant 🏏 Ask me about IPL players, teams, predictions, and matchups.",
    },
  ]);

  const quickQuestions = [
    "Who is Virat Kohli?",
    "Tell me about Dhoni",
    "Which is the best IPL team?",
    "Tell me about Bumrah",
    "Predict CSK vs RCB",
  ];

  async function sendMessage(text = input) {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply || "No response received." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Backend connection failed. Make sure FastAPI is running.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8">
        <h1 className="text-5xl font-bold mb-3">IPL AI Assistant</h1>
        <p className="text-gray-200">Ask IPL questions and get instant cricket insights.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {quickQuestions.map((q, index) => (
          <button
            key={index}
            onClick={() => sendMessage(q)}
            className="bg-zinc-900 border border-gray-800 hover:border-orange-500 px-4 py-2 rounded-xl text-sm"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-gray-800 rounded-3xl p-5 h-[450px] overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-2xl max-w-[80%] ${
              msg.role === "user"
                ? "bg-orange-500 text-white ml-auto"
                : "bg-zinc-800 text-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && <p className="text-orange-400">IPL Nexus AI is thinking...</p>}
      </div>

      <div className="flex gap-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask anything about IPL..."
          className="flex-1 bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white outline-none"
        />

        <button
          onClick={() => sendMessage()}
          className="bg-orange-500 hover:bg-orange-600 px-6 py-4 rounded-2xl font-semibold"
        >
          Send
        </button>

        <button
          onClick={() =>
            setMessages([
              { role: "ai", text: "Chat cleared. Ask me anything about IPL 🏏" },
            ])
          }
          className="bg-zinc-800 hover:bg-zinc-700 px-5 py-4 rounded-2xl"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default AIChat;