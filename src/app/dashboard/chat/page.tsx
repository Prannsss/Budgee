"use client";

import { ChatAssistantInline } from "@/components/ai/chat-assistant";
import { useAuth } from "@/contexts/auth-context";
import { useUserData } from "@/hooks/use-user-data";
import { Bot, Sparkles, TrendingUp, PiggyBank, Wallet, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function ChatPage() {
  const { user } = useAuth();
  const { totals, isLoading } = useUserData();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleClearChat = () => {
    if (user?.id) {
      const storageKey = `budgee_chat_history_${user.id}`;
      localStorage.removeItem(storageKey);
      // Dispatch event to notify ChatAssistantInline to clear its state
      window.dispatchEvent(new Event('budgee:clearChat'));
    }
    setClearDialogOpen(false);
  };

  return (
    <div className="flex flex-col space-y-2 md:space-y-0 md:-m-4 lg:-m-6 md:h-[calc(100vh-0px)]">
      <div className="md:px-10 md:pt-6 lg:px-14 lg:pt-8 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight font-headline md:text-3xl">Budgee AI</h1>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Powered by Gemini
                </Badge>
              </div>
              <p className="text-muted-foreground">Your personal finance assistant</p>
            </div>
          </div>
          
          {/* Quick Financial Summary with Delete Button */}
          {user && !isLoading && (
            <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
              <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1.5 border border-green-500/20">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  ₱{totals.totalIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1.5 border border-red-500/20">
                <Wallet className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">
                  ₱{totals.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1.5 border border-blue-500/20">
                <PiggyBank className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  ₱{totals.savings.toLocaleString()}
                </span>
              </div>
              
              {/* Delete Chat Button */}
              <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full p-2 h-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this chat session? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearChat} className="bg-destructive hover:bg-destructive/90">
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
      <div className="md:max-w-none flex-1 md:flex md:flex-col md:min-h-0">
        <FullWidthChat />
      </div>
    </div>
  );
}

function FullWidthChat() {
  return (
    <div className="md:px-6 lg:px-8 md:pb-6 lg:pb-8 md:h-full md:flex md:flex-col">
      <ChatAssistantInlineWrapper />
    </div>
  );
}

function ChatAssistantInlineWrapper() {
  return (
    <div className="md:border md:rounded-xl md:p-6 md:shadow-sm md:h-full md:flex md:flex-col md:bg-background">
      <ChatAssistantInline />
    </div>
  );
}
