// components/ChatBox.js
import { useState, useRef, useEffect } from "react";
import { useChatSocket } from "@/hooks/useChatSocket";


export default function ChatBox({ lobbyCode, username, playerId }) {
  const { messages, sendMessage } = useChatSocket({ lobbyCode, username, playerId });
  const [collapsed, setCollapsed] = useState(true);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to newest
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 30,
        right: 30,
        zIndex: 1002,
        fontFamily: "'Segoe UI', Arial, sans-serif"
      }}
    >
      {/* Floating Chat Button (animated) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            width: 65,
            height: 65,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#5baaff,#2348ca)",
            color: "#fff",
            border: 0,
            boxShadow: "0 4px 20px #0005",
            fontSize: 32,
            cursor: "pointer",
            outline: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s",
            animation: "chat-bounce 1.1s infinite alternate"
          }}
          aria-label="Open Chat"
        >
          <span style={{ pointerEvents: "none" }}>💬</span>
          <style>{`
            @keyframes chat-bounce {
              0% { transform: translateY(0);}
              100% { transform: translateY(-10px);}
            }
          `}</style>
        </button>
      )}

      {/* Expandable Chat Window */}
      {!collapsed && (
        <div
          style={{
            width: 340,
            height: 430,
            background: "#1e2840ee",
            borderRadius: 16,
            boxShadow: "0 2px 20px #0007",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            animation: "fade-in-chat .35s cubic-bezier(.53,1.6,.62,1)",
          }}
        >
          <style>{`
            @keyframes fade-in-chat {
              from { transform: scale(.8) translateY(40px); opacity:0;}
              to   { transform:none; opacity:1;}
            }
          `}</style>
          <div
            style={{
              background: "#2440c6",
              color: "#fff",
              fontWeight: 700,
              padding: "14px 50px 14px 20px",
              fontSize: 18,
              borderBottom: "1px solid #4573e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            Lobby Chat
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: "transparent",
                border: 0,
                fontSize: 26,
                color: "#fff",
                cursor: "pointer",
                marginLeft: 12,
                fontWeight: 400,
                lineHeight: 0.75,
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 14px",
              background: "linear-gradient(180deg,#16203a 70%,#21325c 100%)",
              fontSize: 16,
            }}
          >
            {messages.length === 0 && (
              <div style={{ color: "#7dacff77", textAlign: "center", paddingTop: 80 }}>
                No messages yet...
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 18,
                  textAlign: m.sender?.id === playerId ? "right" : "left"
                }}
              >
                <span
                  style={{
                    color: "#4faaff",
                    fontWeight: 600,
                    marginRight: 6,
                  }}
                >
                  {m.sender?.name}
                </span>
                <span style={{
                  background: m.sender?.id === playerId ? "#4e90ff33" : "#222e44aa",
                  borderRadius: 8,
                  display: "inline-block",
                  padding: "7px 12px",
                  color: "#e0eaff",
                  fontWeight: 400,
                  maxWidth: 210,
                  wordBreak: "break-word",
                }}>
                  {m.text}
                </span>
                <span style={{
                  fontSize: 12,
                  color: "#829bd9",
                  marginLeft: 6,
                  opacity: 0.7
                }}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form
            style={{
              padding: "12px",
              background: "#20293e",
              borderTop: "1px solid #25325a",
              display: "flex",
              alignItems: "center"
            }}
            onSubmit={e => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage(input);
                setInput("");
              }
            }}
          >
            <input
              type="text"
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                borderRadius: 10,
                border: "1px solid #3b4680",
                padding: "10px 14px",
                fontSize: 16,
                background: "#26315b",
                color: "#fff",
                outline: "none"
              }}
              maxLength={300}
            />
            <button
              type="submit"
              style={{
                marginLeft: 8,
                background: "linear-gradient(135deg,#5baaff,#2348ca)",
                color: "#fff",
                borderRadius: 8,
                border: "none",
                fontSize: 16,
                fontWeight: 700,
                padding: "10px 18px",
                cursor: "pointer"
              }}
              disabled={!input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
