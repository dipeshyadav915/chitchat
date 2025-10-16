"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MoreVertical, Search } from "lucide-react";
import socket from "@/lib/socket";

export default function ChatApp() {
  const [showAccessPopup, setShowAccessPopup] = useState(true);
  const [userInfo, setUserInfo] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [message]);

  useEffect(() => {
    const handleMessage = ({ msg, from, receiver, timestamp }: any) => {
      setChat((prev) => [...prev, { msg, from, receiver, timestamp }]);
    };

    const handleUserList = (users: any[]) => {
      setUsers(users);
    };

    const handleActiveUser = (userInfo: any) => {
      setActiveUser(userInfo);
    };

    socket.on("chat_message", handleMessage);
    socket.on("activeUser", handleActiveUser);
    socket.on("user_list", handleUserList);

    return () => {
      socket.off("chat_message", handleMessage);
      socket.off("user_list", handleUserList);
      // socket.off("activeUser", handleActiveUser);
    };
  }, [socket, selectedUser]);

  const sendMessage = () => {
    const selectedUserid = selectedUser && selectedUser.id;
    if (message.trim()) {
      socket.emit("chat_message", { msg: message, receiver: selectedUserid });
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo.username.trim()) {
      socket.emit("userInfo", userInfo);
      setShowAccessPopup(false);
    }
  };

  console.log(activeUser, selectedUser);

  useEffect(() => {
    const data = users.filter((user: any) => user.id !== activeUser?.id); // put your condition here
    setFilteredUsers(data);
  }, [users]);

  console.log(chat, "chat messages");

  if (showAccessPopup) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 p-6 bg-card border-border">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              Welcome to ChitChat
            </h2>
            <p className="text-muted-foreground">
              Please fill in your details to continue
            </p>
          </div>

          <form onSubmit={handleAccessSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-card-foreground mb-2"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={userInfo.username}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, username: e.target.value })
                }
                placeholder="Enter your username address"
                className="bg-input border-border"
                required
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-card-foreground mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="text"
                value={userInfo.password}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, password: e.target.value })
                }
                placeholder="Enter your password here"
                className="bg-input border-border"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!userInfo.password.trim() || !userInfo.username.trim()}
            >
              Continue to Chat
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-sidebar-foreground">
              Messages
            </h1>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 bg-input border-border"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user: any) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 border-b border-sidebar-border cursor-pointer hover:bg-sidebar-accent transition-colors ${
                activeUser?.id === user.id ? "bg-sidebar-primary" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    {/* <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    /> */}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.username
                        ?.split(" ")
                        ?.map((n: any) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {/* {contact.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-sidebar"></div>
                  )} */}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sidebar-foreground truncate">
                      {user.username}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.message}
                  </p>
                </div>
                {user && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    2
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedUser?.name
                    ?.split(" ")
                    ?.map((n: any) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-card-foreground">
                  {selectedUser?.username}
                </h2>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Avatar className="h-12 w-12">
                {/* <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    /> */}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {activeUser?.username
                    ?.split(" ")
                    ?.map((n: any) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chat.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.from === activeUser?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                  message.from === activeUser?.id
                    ? "-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                {/* {message.from === "other" && (
                  <AvSatar className="h-8 w-8">
                    <AvatarImage
                      src={message.avatar || "/placeholder.svg"}
                      alt={message.name}
                    />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                      {message.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </AvSatar>
                )} */}
                <Card
                  className={`p-3 gap-2 ${
                    message.from === activeUser?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground"
                  }`}
                >
                  <p className="text-sm">{message.msg}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.from === activeUser?.id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="pr-10 bg-input border-border"
              />
            </div>
            <Button
              onClick={sendMessage}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
