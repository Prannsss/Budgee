"use client";

import { useState, useEffect } from "react";
import { Bot, Loader2, Send, User, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { answerFinanceQuestion } from "@/ai/flows/ai-answer-finance-questions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useUserData } from "@/hooks/use-user-data";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatAssistant({ trigger }: { trigger?: React.ReactElement }) {
  const { user } = useAuth();
  const { transactions, accounts, totals } = useUserData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || !user?.id) return;

    setIsLoading(true);
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      // Prepare category totals
      const categoryTotals = transactions.reduce((acc: Record<string, number>, txn) => {
        acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
        return acc;
      }, {} as Record<string, number>);

      // Prepare financial data
      const financialData = {
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        savings: totals.savings,
        accounts: accounts.map(acc => ({
          name: acc.name,
          type: acc.type,
          balance: acc.balance,
          lastFour: acc.lastFour,
        })),
        recentTransactions: transactions.slice(-10).map(txn => ({
          date: txn.date,
          description: txn.description,
          amount: txn.amount,
          category: txn.category,
        })),
        categoryTotals,
      };

      const result = await answerFinanceQuestion({ 
        question: input,
        userId: user.id,
        financialData,
      });
      setMessages([...newMessages, { role: "assistant", content: result.answer }]);
    } catch (error) {
      console.error("Error answering finance question:", error);
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't get an answer. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="icon" className="rounded-full">
            <Bot />
            <span className="sr-only">Open AI Chat</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 mr-4" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Budgee AI</h4>
            <p className="text-sm text-muted-foreground">
              Ask me anything about your finances.
            </p>
          </div>
          <ScrollArea className="h-64 w-full pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot size={16}/></AvatarFallback>
                        </Avatar>
                    )}
                  <div className={`rounded-lg p-3 text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><User size={16}/></AvatarFallback>
                        </Avatar>
                    )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot size={16}/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 text-sm bg-muted flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="Type your question..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
              <Send className="h-4 w-4 -translate-x-[1px] translate-y-[1px]" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Inline page-friendly chat without a popover
export function ChatAssistantInline() {
  const { user } = useAuth();
  const { transactions, accounts, totals } = useUserData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const storageKey = `budgee_chat_history_${user.id}`;
      const savedMessages = localStorage.getItem(storageKey);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.error("Error loading chat history:", error);
        }
      }
    }
  }, [user?.id]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id && messages.length > 0) {
      const storageKey = `budgee_chat_history_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || !user?.id) return;

    setIsLoading(true);
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      // Prepare category totals
      const categoryTotals = transactions.reduce((acc: Record<string, number>, txn) => {
        acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
        return acc;
      }, {} as Record<string, number>);

      // Prepare financial data
      const financialData = {
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        savings: totals.savings,
        accounts: accounts.map(acc => ({
          name: acc.name,
          type: acc.type,
          balance: acc.balance,
          lastFour: acc.lastFour,
        })),
        recentTransactions: transactions.slice(-10).map(txn => ({
          date: txn.date,
          description: txn.description,
          amount: txn.amount,
          category: txn.category,
        })),
        categoryTotals,
      };

      const result = await answerFinanceQuestion({ 
        question: input,
        userId: user.id,
        financialData,
      });
      setMessages([...newMessages, { role: "assistant", content: result.answer }]);
    } catch (error) {
      console.error("Error answering finance question:", error);
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't get an answer. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    if (user?.id) {
      const storageKey = `budgee_chat_history_${user.id}`;
      localStorage.removeItem(storageKey);
      setMessages([]);
    }
  };

  return (
  <div className="relative rounded-lg border p-4 min-h-[calc(100vh-140px)] md:min-h-0 md:h-full md:border-0 md:p-0 md:flex md:flex-col">
  <ScrollArea className="w-full pr-4 pb-28 md:pr-6 md:pb-4 md:flex-1 md:overflow-y-auto">
        <div className="space-y-4 md:space-y-6 md:max-w-4xl md:mx-auto">
          {!user && (
            <div className="grid place-items-center min-h-[50vh] md:min-h-[200px]">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive" aria-hidden>
                  <Bot className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h4 className="font-medium leading-none md:text-lg">Not Authenticated</h4>
                <p className="text-sm text-muted-foreground md:text-base mt-2">Please log in to use Budgee AI.</p>
              </div>
            </div>
          )}
          {user && messages.length === 0 && !isLoading && (
            <div className="grid place-items-center min-h-[50vh] md:min-h-[200px]">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
                  <Bot className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h4 className="font-medium leading-none md:text-lg">Budgee AI</h4>
                <p className="text-sm text-muted-foreground md:text-base mt-2">Ask me anything about your finances.</p>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-2 md:gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarFallback><Bot size={16} className="md:w-5 md:h-5"/></AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg p-3 md:p-4 text-sm md:text-base max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {message.content}
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarFallback><User size={16} className="md:w-5 md:h-5"/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarFallback><Bot size={16} className="md:w-5 md:h-5"/></AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 md:p-4 text-sm bg-muted flex items-center">
                <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin"/>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 md:max-w-3xl md:mx-auto md:w-full">
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearChatHistory}
            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-xs">Clear chat</span>
          </Button>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="fixed left-4 right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+80px)] z-50 flex w-auto items-center gap-2 rounded-full border bg-background/90 shadow-lg backdrop-blur px-3 py-2
                   md:static md:bottom-auto md:z-auto md:w-full md:max-w-3xl md:mx-auto md:left-auto md:right-auto md:mt-6 md:mb-0 md:flex-shrink-0"
      >
        <Input
          id="message"
          placeholder="Type your question..."
          className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10 md:h-12 md:text-base"
          autoComplete="off"
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md md:h-12 md:w-12">
          <Send className="h-4 w-4 md:h-5 md:w-5 -translate-x-[1px] translate-y-[1px]" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
