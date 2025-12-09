"use client";

import { ChatAssistantInline } from "@/components/ai/chat-assistant";
import { useAuth } from "@/contexts/auth-context";
import { useUserData } from "@/hooks/use-user-data";
import { Bot, Sparkles, TrendingUp, PiggyBank, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ChatPage() {
  const { user } = useAuth();
  const { totals, isLoading } = useUserData();

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
          
          {/* Quick Financial Summary */}
          {user && !isLoading && (
            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
              <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-xs md:text-sm font-medium border border-green-500/20">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                <span className="text-green-700 dark:text-green-400">
                  Income: ₱{totals.totalIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-xs md:text-sm font-medium border border-red-500/20">
                <Wallet className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                <span className="text-red-700 dark:text-red-400">
                  Expenses: ₱{totals.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs md:text-sm font-medium border border-blue-500/20">
                <PiggyBank className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                <span className="text-blue-700 dark:text-blue-400">
                  Savings: ₱{totals.savings.toLocaleString()}
                </span>
              </div>
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
