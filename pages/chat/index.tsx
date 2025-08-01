"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import DefaultLayout from "@/layouts/default";
import { getAuth } from "firebase/auth";
import { title } from "@/components/primitives";
import { Input, Button } from "@heroui/react";

const ErrorPage = ({ errorType, onRefresh }: { errorType: string; onRefresh?: () => void }) => {
  return (
    <div className="text-center">
      <p>Error: {errorType}</p>
      {onRefresh && <button onClick={onRefresh}>Refresh</button>}
    </div>
  );
};

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
      try {
        const token = await user.getIdToken(true);
        console.log("Auth token:", token.substring(0, 10) + "...");
        return token;
      } catch (error) {
        console.error("Error getting auth token:", error);
        return "";
      }
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

    if (wsRef.current) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const cleanApiUrl = API_URL.replace(/\/+$/, "");
      const authUrl = `${cleanApiUrl}/Auth`;
      console.log("Authenticating at:", authUrl);

      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log("Auth response status:", response.status);
        if (response.status === 401 || response.status === 403) {
          setError("unauthorized");
        } else if (response.status >= 500) {
          setError("serverError");
        } else {
          setError("networkError");
        }
        return;
      }

      const wsProtocol = cleanApiUrl.startsWith("https") ? "wss" : "ws";
      const wsUrl = `${wsProtocol}://${cleanApiUrl.replace(/^https?:\/\//, "")}/chat?token=Bearer%20${token}`;
      console.log("Connecting to WebSocket:", wsUrl);

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setError(null);
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (msg) => msg.timestamp === data.timestamp && msg.sender_id === data.sender_id
          );
          return isDuplicate ? prev : [...prev, data];
        });
      };

      socket.onclose = () => {
        wsRef.current = null;
        setError("networkError");
        console.log("WebSocket closed");
      };

      socket.onerror = () => {
        setError("networkError");
        console.error("WebSocket error");
      };
    } catch (error) {
      console.error("Error setting up chat:", error);
      setError("networkError");
    }
  };

  useEffect(() => {
    setupChat();
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

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: "message", content: input }));
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
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
      <div className="flex flex-col px-4 pt-16 pb-6 text-black">
        <h1 className={`${title()} mb-8 text-center text-black`}>Chat</h1>

        <div className="flex flex-col gap-4 mb-6">
          {messages.length === 0 && !error ? (
            <div className="text-center py-8">
              <ErrorPage errorType="wait <3" />
            </div>
          ) : (
            messages.map((msg, index) => (
              <Card key={index} className="w-full bg-white text-black shadow-none">
                <CardBody className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={msg.imageUrl || "https://via.placeholder.com/40"}
                      alt={msg.username}
                      className="w-10 h-10"
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
            isClearable
            className="w-full"
            classNames={{
              base: "border focus-within:border-black",
              inputWrapper: "bg-white focus-within:bg-white",
              input: "bg-white hover:bg-white placeholder:text-black",
              label: "text-black",
            }}
            ref={inputRef}
            placeholder="Enter your message"
            type="text"
            value={input}
            variant="bordered"
            onKeyPress={handleKeyPress}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={sendMessage} disabled={!wsRef.current || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </DefaultLayout>
  );
}