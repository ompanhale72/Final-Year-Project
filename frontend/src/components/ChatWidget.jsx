import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ChatWidget({ sellerId, vehicleId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", { autoConnect: false }), []);

  useEffect(() => {
    if (!open || !user || !sellerId) return;
    api.get(`/chat/${sellerId}`).then(({ data }) => setMessages(data.messages)).catch(() => setMessages([]));
    socket.connect();
    socket.emit("join_chat", { sender_id: user.id, receiver_id: sellerId });
    socket.on("receive_message", (payload) => setMessages((current) => [...current, payload]));
    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [open, user, sellerId, socket]);

  const send = (event) => {
    event.preventDefault();
    if (!message.trim() || !user) return;
    socket.emit("send_message", {
      sender_id: user.id,
      receiver_id: sellerId,
      vehicle_id: vehicleId,
      message,
    });
    setMessage("");
  };

  if (!user) {
    return (
      <button className="btn-secondary w-full" disabled>
        <MessageCircle size={18} />
        Login to chat
      </button>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary w-full">
        <MessageCircle size={18} />
        Chat with seller
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-ink/30 p-4">
          <div className="flex h-[560px] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-soft">
            <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
              <div>
                <p className="font-bold">Seller chat</p>
                <p className="text-xs text-white/70">Real-time Socket.io messaging</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close chat">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-cloud p-4">
              {messages.length === 0 && <p className="text-sm text-slate-500">Start a conversation about this listing.</p>}
              {messages.map((item) => (
                <div key={item.id || `${item.created_at}-${item.message}`} className={`flex ${item.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                  <p className={`max-w-[78%] rounded-lg px-3 py-2 text-sm ${item.sender_id === user.id ? "bg-ink text-white" : "bg-white text-ink"}`}>
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
              <input value={message} onChange={(event) => setMessage(event.target.value)} className="input" placeholder="Type your message" />
              <button className="btn-primary px-4" aria-label="Send">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
