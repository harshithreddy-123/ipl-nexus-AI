import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { api } from "../../lib/api";

const CHIPS = [
  "Compare Kohli vs Bumrah",
  "Best death overs bowler?",
  "RCB qualification chances?",
];

export default function FloatingChat({ light }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your IPL AI assistant. Ask about stats or matchups." },
  ]);
  const [sending, setSending] = useState(false);

  const send = async (text) => {
    const msg = text.trim();
    if (!msg || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setSending(true);
    try {
      const res = await api.sendChat(msg);
      setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Could not reach the API. Start the backend or add GROQ_API_KEY to .env.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-20 right-4 z-50 w-[min(100vw-2rem,340px)] rounded-xl border shadow-2xl ${
              light
                ? "border-gray-200 bg-white"
                : "border-white/10 bg-ipl-panel"
            }`}
          >
            <div
              className={`flex items-center justify-between px-3 py-2 border-b ${
                light ? "border-gray-100" : "border-white/10"
              }`}
            >
              <span className="text-sm font-semibold">IPL AI Assistant</span>
              <button type="button" onClick={() => setOpen(false)} className="p-1 text-gray-500">
                <FiX size={16} />
              </button>
            </div>

            <div className="h-52 overflow-y-auto p-3 space-y-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-xs rounded-lg px-2.5 py-2 max-w-[90%] ${
                    m.role === "user"
                      ? "ml-auto bg-ipl-orange/90 text-white"
                      : light
                        ? "bg-gray-100 text-gray-800"
                        : "bg-white/5 text-gray-300"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {sending && <p className="text-2xs text-gray-500 animate-pulse">Thinking…</p>}
            </div>

            <div className="flex flex-wrap gap-1.5 px-3 pb-2">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => send(c)}
                  className="text-2xs rounded-full border border-ipl-cyan/30 px-2 py-0.5 text-ipl-cyan hover:bg-ipl-cyan/10"
                >
                  {c}
                </button>
              ))}
            </div>

            <form
              className={`flex gap-2 p-3 border-t ${light ? "border-gray-100" : "border-white/10"}`}
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                className={light ? "input-field-light flex-1 py-1.5" : "input-field flex-1 py-1.5"}
                placeholder="Ask about IPL…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" disabled={sending} className="btn-primary p-2">
                <FiSend size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ipl-cyan to-ipl-orange text-white shadow-lg animate-chat-glow"
        aria-label="Open chat"
      >
        <FiMessageCircle size={22} />
      </motion.button>
    </>
  );
}
