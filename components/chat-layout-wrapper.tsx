"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
}

interface ChatLayoutWrapperProps {
  children: React.ReactNode;
}

export function ChatLayoutWrapper({ children }: ChatLayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isChatPage = pathname === "/chat";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (isChatPage) {
      loadConversations();
    }
  }, [isChatPage]);

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const handleSelectConversation = async (id: string) => {
    setCurrentConversationId(id);
    const event = new CustomEvent("chat:loadConversation", { detail: { id } });
    window.dispatchEvent(event);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (currentConversationId === id) {
          setCurrentConversationId(undefined);
          const event = new CustomEvent("chat:newChat");
          window.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(undefined);
    const event = new CustomEvent("chat:newChat");
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const handleConversationCreated = () => {
      loadConversations();
    };

    window.addEventListener("chat:conversationCreated", handleConversationCreated);
    return () => {
      window.removeEventListener("chat:conversationCreated", handleConversationCreated);
    };
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
        showConversations={isChatPage}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
