"use client";

import { ChatAssistantInline } from "@/components/ai/chat-assistant";

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Budgee Chatbot</h1>
        <p className="text-muted-foreground">Ask anything about your finances.</p>
      </div>
      <div className="md:max-w-none">
        <FullWidthChat />
      </div>
    </div>
  );
}

function FullWidthChat() {
  // Render the inline chat but stretch to full width on desktop and remove border for immersive feel
  return (
    <div className="md:-mx-2 lg:-mx-4">
      <ChatAssistantInlineWrapper />
    </div>
  );
}

// Lightweight wrapper to tweak styles of ChatAssistantInline for desktop fullscreen
function ChatAssistantInlineWrapper() {
  return (
    <div className="md:border-0 md:p-0">
      <ChatAssistantInline />
    </div>
  );
}
