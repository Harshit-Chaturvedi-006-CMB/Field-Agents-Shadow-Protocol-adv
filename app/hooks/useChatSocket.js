// hooks/useChatSocket.js
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://server-field-agents.onrender.com"; // Your server

export function useChatSocket({ lobbyCode, username, playerId }) {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!lobbyCode || !username || !playerId) return;
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    // Listen for incoming chat messages
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Optionally, request previous messages
    socket.emit("getPreviousMessages", { lobbyCode });

    socket.on("previousMessages", (prevMsgs) => {
      setMessages(prevMsgs || []);
    });

    // Clean up
    return () => {
      socket.disconnect();
    };
  }, [lobbyCode, username, playerId]);

  // Send a message
  const sendMessage = (text) => {
    if (socketRef.current && text.trim()) {
      const msg = {
        lobbyCode,
        sender: { name: username, id: playerId },
        text,
        timestamp: Date.now(),
      };
      socketRef.current.emit("chatMessage", msg);
      // Optionally, add optimistically
      setMessages((prev) => [...prev, msg]);
    }
  };

  return { messages, sendMessage };
}
