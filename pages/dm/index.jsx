import { Listbox, ListboxItem } from "@heroui/listbox";
import { useState } from "react";

export const ListboxWrapper = ({ children }) => (
  <div className="w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
    {children}
  </div>
);

export default function DMPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const items = [
    { key: "user1", label: "QuirkyLilSigma" },
    { key: "user2", label: "SkyWalker" },
    { key: "user3", label: "CloudChaser" },
    { key: "user4", label: "SigmaBoi" },
  ];

  const [dummyMessages, setDummyMessages] = useState({
    user1: [
      {
        id: 1,
        sender: "QuirkyLilSigma",
        text: "Yo, what’s good?",
        time: "12:00 PM",
      },
      { id: 2, sender: "You", text: "Just chillin’, you?", time: "12:01 PM" },
    ],
    user2: [
      {
        id: 3,
        sender: "SkyWalker",
        text: "Up in the clouds today!",
        time: "01:15 PM",
      },
      { id: 4, sender: "You", text: "Nice, any pics?", time: "01:16 PM" },
    ],
    user3: [
      {
        id: 5,
        sender: "CloudChaser",
        text: "Caught a storm brewing!",
        time: "02:30 PM",
      },
      { id: 6, sender: "You", text: "Whoa, stay safe!", time: "02:31 PM" },
    ],
    user4: [
      {
        id: 7,
        sender: "SigmaBoi",
        text: "Sigma vibes only!",
        time: "03:45 PM",
      },
      { id: 8, sender: "You", text: "Heck yeah!", time: "03:46 PM" },
    ],
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      const newMessage = {
        id: Date.now(),
        sender: "You",
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setDummyMessages((prev) => ({
        ...prev,
        [selectedUser]: [...prev[selectedUser], newMessage],
      }));
      setMessage("");
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-row gap-4 h-screen">
      {/* Left Side - User List */}
      <div className="w-1/4">
        <ListboxWrapper>
          <Listbox
            aria-label="DM Contacts"
            items={items}
            onAction={(key) => setSelectedUser(key)}
            selectedKeys={selectedUser ? [selectedUser] : []}
          >
            {(item) => (
              <ListboxItem
                key={item.key}
                className={selectedUser === item.key ? "bg-default-100" : ""}
              >
                {item.label}
              </ListboxItem>
            )}
          </Listbox>
        </ListboxWrapper>
      </div>

      {/* Right Side - Chat Area */}
      <div className="w-3/4 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 border border-default-200 rounded-lg bg-default-50">
          {selectedUser ? (
            dummyMessages[selectedUser].map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-small text-default-500 mr-2">
                      {msg.sender}
                    </span>
                    <div
                      className={`p-2 rounded-lg flex items-center ${
                        msg.sender === "You"
                          ? "bg-primary-500 text-white"
                          : "bg-default-100"
                      }`}
                    >
                      <span className="mr-2">{msg.text}</span>
                      <span className="text-tiny text-opacity-80">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-default-500">
              Select a user to start chatting
            </p>
          )}
        </div>
        <form onSubmit={handleSend} className="p-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border border-default-200 rounded-lg"
            placeholder="Type a message..."
            disabled={!selectedUser}
          />
        </form>
      </div>
    </div>
  );
}
