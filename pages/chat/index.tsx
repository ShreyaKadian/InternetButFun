// pages/ChatPage.tsx or equivalent
"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import DefaultLayout from "@/layouts/default";
import { getAuth } from "firebase/auth";
import { title } from "@/components/primitives";

// Basic ErrorPage component definition (replace with your actual implementation if different)
const ErrorPage = ({ errorType, onRefresh }: { errorType: string; onRefresh?: () => void }) => {
  return (
    <div className="text-center">
      <p>Error: {errorType}</p>
      {onRefresh && <button onClick={onRefresh}>Refresh</button>}
    </div>
  );
};

// Extend @heroui/avatar types to fix onError prop
declare module "@heroui/avatar" {
  interface AvatarProps {
    onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  }
}

interface ChatMessage {
  type: string;
  content: string;
  sender_id: string;
  username: string;
  timestamp: string;
  imageUrl?: string | null;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true); // Force refresh
      console.log("Auth token:", token); // Debug log
      return token;
    }
    console.log("No user logged in");
    return "";
  };

  const setupChat = async () => {
    const token = await getToken();
    if (!token) {
      setError("unauthorized");
      return;
    }
    if (wsRef.current) return; // Prevent multiple connections

    // Register user with /Auth endpoint
    try {
      const response = await fetch("http://localhost:8000/Auth", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.error("Failed to register user:", await response.text());
        if (response.status === 401 || response.status === 403) {
          setError("unauthorized");
        } else if (response.status >= 500) {
          setError("serverError");
        } else {
          setError("networkError");
        }
        return;
      }
      console.log("Auth response:", await response.json());
    } catch (error) {
      console.error("Error registering user:", error);
      setError("networkError");
      return;
    }

    // Connect to WebSocket
    const socket = new WebSocket(`ws://localhost:8000/chat?token=Bearer%20${token}`);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setError(null); // Clear any previous errors
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => {
        const isDuplicate = prev.some(
          (msg) =>
            msg.timestamp === data.timestamp && msg.sender_id === data.sender_id
        );
        return isDuplicate ? prev : [...prev, data];
      });
    };

    socket.onclose = (event) => {
      console.log("WebSocket disconnected:", event.reason, event.code);
      wsRef.current = null;
      if (event.code === 1006 || event.code >= 4000) {
        setError("networkError"); // Abnormal closure or custom error
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("networkError");
    };
  };

  useEffect(() => {
    setupChat();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !wsRef.current) return;

    wsRef.current.send(JSON.stringify({ type: "message", content: input }));
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleRefresh = () => {
    setError(null);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setupChat();
  };

  if (error) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center gap-6 py-8 md:py-10">
          <h1 className={`${title()} mb-4 text-center`}>Chat</h1>
          <ErrorPage errorType={error} onRefresh={handleRefresh} />
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col h-[calc(100vh-5.5rem)]">
        <h1 className={`${title()} mb-4 mt-7 text-center`}>Chat</h1>
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {messages.length === 0 && !error ? (
            <div className="text-center py-8">
              <ErrorPage errorType="notFound" />
            </div>
          ) : (
            messages.map((msg, index) => (
              <Card key={index} className="w-full">
                <CardBody className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={msg.imageUrl || "https://via.placeholder.com/40"}
                      alt={msg.username}
                      className="w-10 h-10 flex-column"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = "https://via.placeholder.com/40";
                      }}
                    />
                    <span className="font-semibold">{msg.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={msg.type === "system" ? "text-gray-500 italic" : ""}>
                      {msg.content}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!wsRef.current || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </DefaultLayout>
  );
}