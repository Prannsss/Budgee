"use client";

import { ChatAssistantInline } from "@/components/ai/chat-assistant";

export default function ChatPage() {
  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:-m-4 lg:-m-6 md:h-[calc(100vh-0px)]">
      <div className="md:px-10 md:pt-6 lg:px-14 lg:pt-8 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight font-headline md:text-3xl">Budgee Chatbot</h1>
        <p className="text-muted-foreground">Ask anything about your finances.</p>
      </div>
      <div className="md:max-w-none flex-1 md:flex md:flex-col md:min-h-0">
        <FullWidthChat />
      </div>
    </div>
  );
}

function FullWidthChat() {
  // Render the inline chat but stretch to full width on desktop with proper padding
  return (
    <div className="md:px-6 lg:px-8 md:pb-6 lg:pb-8 md:h-full md:flex md:flex-col">
      <ChatAssistantInlineWrapper />
    </div>
  );
}

// Lightweight wrapper to tweak styles of ChatAssistantInline for desktop fullscreen
function ChatAssistantInlineWrapper() {
  return (
    <div className="md:border md:rounded-xl md:p-6 md:shadow-sm md:h-full md:flex md:flex-col md:bg-background">
      <ChatAssistantInline />
    </div>
  );
}
