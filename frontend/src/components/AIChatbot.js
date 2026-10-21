import React, { useState, useEffect, useRef } from "react";
import { chatbotAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import RazorpayButton from "./RazorpayButton";

export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(Date.now().toString());

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([
        {
          id: Date.now(),
          text: "Namaste! I'm your Wheelz AI Assistant. I can help you find and book the perfect vehicle!\n\nWhat are you looking for today?",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatbotAPI.chat({
        message: input,
        sessionId: sessionId.current,
      });

      const botMessage = {
        id: Date.now() + 1,
        text: res.data.reply,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);

      if (res.data.action === "payment" && res.data.data) {
        setPaymentData(res.data.data);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble connecting. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentData(null);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "Payment successful! Your booking is confirmed. You can view it in your dashboard. Thank you for choosing Wheelz!",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Wheelz AI assistant"
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-ink py-3 pl-4 pr-5 text-sm font-medium text-canvas shadow-2xl shadow-black/30 transition-transform duration-500 ease-out-expo hover:-translate-y-0.5"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="hidden sm:inline">Ask Wheelz AI</span>
        <svg
          className="h-5 w-5 sm:hidden"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Chat Window */}
      <div
        data-lenis-prevent
        className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-md animate-fade-in overflow-hidden rounded-[24px] border border-line/10 bg-surface shadow-2xl shadow-black/40 sm:bottom-6 sm:right-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-ink px-5 py-4 text-canvas">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-ink">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="display-tight text-base">Wheelz AI</h3>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-canvas/60">
                Online
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close assistant"
            className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-canvas/10"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 space-y-3 overflow-y-auto bg-canvas p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.sender === "user"
                    ? "rounded-br-sm bg-ink text-canvas"
                    : "rounded-bl-sm border border-line/10 bg-surface text-ink"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p
                  className={`mt-1 font-mono text-[10px] ${msg.sender === "user" ? "text-canvas/60" : "text-muted"}`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          {paymentData && (
            <div className="flex justify-center mt-2">
              <RazorpayButton
                bookingId={paymentData.bookingId}
                amount={paymentData.amount}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-line/10 bg-surface p-3">
          <div className="flex items-center gap-2 rounded-full border border-line/15 p-1 pl-4 focus-within:border-ink">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-muted"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-ink transition-opacity disabled:opacity-40"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            AI answers can be wrong — check before you book
          </p>
        </div>
      </div>
    </>
  );
}
