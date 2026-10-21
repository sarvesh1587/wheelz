import React, { useState, useRef, useEffect } from "react";
import { aiAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm **Zara**, your Wheelz assistant\nAsk me about vehicles, pricing, availability, or anything else!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    setSuggestions([]);

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.slice(1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await aiAPI.chat(userMsg, history.slice(0, -1));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
      if (res.data.suggestions?.length > 0)
        setSuggestions(res.data.suggestions);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having a moment! Try browsing vehicles directly or contact our support.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = [
    "What cars are available?",
    "Bikes under ₹500/day",
    "How does booking work?",
    "Cancellation policy?",
  ];

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent rounded-full flex items-center justify-center hover:bg-ink hover:text-canvas transition-all duration-300 hover:scale-110"
        aria-label="Open chat"
      >
        {open ? (
          <svg
            className="w-6 h-6 text-ink"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-ink"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-surface rounded-2xl border border-line/10 flex flex-col animate-slide-up overflow-hidden"
          style={{ height: "520px" }}
        >
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center font-bold text-accent-ink text-sm">
              Z
            </div>
            <div>
              <p className="font-semibold text-white text-sm">
                Zara - AI Assistant
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-ink text-canvas rounded-full animate-pulse" />
                <span className="text-xs text-muted">Online</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-raised/50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-accent-ink rounded-br-sm"
                      : "bg-surface text-ink rounded-bl-sm border border-line/10"
                  }`}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(msg.content),
                    }}
                  />
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface px-4 py-3 rounded-2xl rounded-bl-sm border border-line/10">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-line/20 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-line/20 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-line/20 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted font-medium">
                  Suggested vehicles:
                </p>
                {suggestions.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => {
                      navigate(`/vehicles/${v._id}`);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 bg-surface rounded-xl border border-line/10 hover:border-ink transition-colors text-left"
                  >
                    <img
                      src={v.images?.[0]}
                      alt={v.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-ink">
                        {v.name}
                      </p>
                      <p className="text-xs text-accent">
                        ₹{v.basePrice}/day
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-3 py-2 bg-raised/50 flex flex-wrap gap-1.5 border-t border-line/10">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-2.5 py-1 bg-surface border border-line/10 rounded-full hover:border-ink hover:text-accent transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="px-3 py-3 border-t border-line/10 flex gap-2 bg-surface">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask Zara anything..."
              className="flex-1 px-3 py-2 text-sm bg-raised rounded-xl outline-none text-ink placeholder:text-muted"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="p-2 bg-accent rounded-xl hover:bg-ink hover:text-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4 text-ink"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
