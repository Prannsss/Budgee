"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Loader2, Send, User, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useUserData } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";
import { TokenManager } from "@/lib/api-service";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  isError?: boolean;
};

// Suggested questions for quick start
const SUGGESTED_QUESTIONS = [
  "How am I doing financially this month?",
  "Where am I spending the most money?",
  "How can I save more money?",
  "What's my current savings rate?",
  "Give me a summary of my finances",
];

// Simple markdown-like formatting for chat messages
function formatMessage(content: string): React.ReactNode {
  // Split by newlines and process each line
  const lines = content.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Handle numbered lists (1. 2. 3. etc)
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      return (
        <div key={lineIndex} className="flex gap-2 my-1">
          <span className="font-medium text-primary min-w-[1.5rem]">{numberedMatch[1]}.</span>
          <span>{formatInlineText(numberedMatch[2])}</span>
        </div>
      );
    }
    
    // Handle bullet points (- or •)
    const bulletMatch = line.match(/^[-•]\s+(.*)$/);
    if (bulletMatch) {
      return (
        <div key={lineIndex} className="flex gap-2 my-1">
          <span className="text-primary">•</span>
          <span>{formatInlineText(bulletMatch[1])}</span>
        </div>
      );
    }
    
    // Handle emoji bullet points (common in AI responses)
    const emojiBulletMatch = line.match(/^([💰🎯👏💪✨📊💵💸🏦📈📉🎉💡🔥⭐️])\s*(.*)$/);
    if (emojiBulletMatch) {
      return (
        <div key={lineIndex} className="flex gap-2 my-1">
          <span>{emojiBulletMatch[1]}</span>
          <span>{formatInlineText(emojiBulletMatch[2])}</span>
        </div>
      );
    }
    
    // Empty lines become spacing
    if (line.trim() === '') {
      return <div key={lineIndex} className="h-2" />;
    }
    
    // Regular paragraphs
    return (
      <p key={lineIndex} className="my-1">
        {formatInlineText(line)}
      </p>
    );
  });
}

// Format inline text (handles currency, percentages, etc)
function formatInlineText(text: string): React.ReactNode {
  // Highlight currency amounts (₱ or $)
  const parts = text.split(/(₱[\d,]+\.?\d*|\$[\d,]+\.?\d*|\d+%)/g);
  
  return parts.map((part, i) => {
    if (part.match(/^[₱$][\d,]+\.?\d*$/)) {
      return (
        <span key={i} className="font-semibold text-primary">
          {part}
        </span>
      );
    }
    if (part.match(/^\d+%$/)) {
      return (
        <span key={i} className="font-semibold text-blue-600 dark:text-blue-400">
          {part}
        </span>
      );
    }
    return part;
  });
}

export function ChatAssistant({ trigger }: { trigger?: React.ReactElement }) {
  const { user } = useAuth();
  const { transactions, accounts, totals, isLoading: isDataLoading } = useUserData();
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
    const newMessages: Message[] = [...messages, { role: "user", content: input, timestamp: new Date().toISOString() }];
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
        recentTransactions: transactions.slice(-20).map(txn => ({
          date: txn.date,
          description: txn.description,
          amount: txn.amount,
          category: txn.category,
        })),
        categoryTotals,
      };

      // Call backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }
      
      const response = await fetch(`${apiUrl}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: input,
          userId: user.id,
          financialData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        if (response.status === 429) {
          throw new Error('AI is temporarily busy. Please wait a moment and try again.');
        }
        throw new Error(errorData.error || errorData.message || 'Failed to get AI response');
      }

      const result = await response.json();
      setMessages([...newMessages, { role: "assistant", content: result.answer, timestamp: new Date().toISOString() }]);
    } catch (error) {
      console.error("Error answering finance question:", error);
      let errorMessage = "Sorry, I couldn't get an answer. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('not configured') || error.message.includes('not properly configured')) {
          errorMessage = "AI service is not configured. Please contact support.";
        } else if (error.message.includes('API key')) {
          errorMessage = "There's an issue with the AI configuration. Please try again later.";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('Session expired') || error.message.includes('Not authenticated') || error.message.includes('log in')) {
          errorMessage = "Your session has expired. Please refresh the page and log in again.";
        } else if (error.message.includes('busy') || error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate')) {
          errorMessage = "I'm a bit busy right now! 😅 Please wait a few seconds and try again.";
        }
      }
      
      setMessages([...newMessages, { role: "assistant", content: errorMessage, timestamp: new Date().toISOString(), isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasAIAccess = user?.plan?.aiEnabled !== false;

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
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="font-medium leading-none">Budgee AI</h4>
            </div>
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
                            <AvatarFallback className={cn(
                              message.isError ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                            )}>
                              {message.isError ? <AlertCircle size={16}/> : <Bot size={16}/>}
                            </AvatarFallback>
                        </Avatar>
                    )}
                  <div className={cn(
                    "rounded-lg p-3 text-sm max-w-[85%]",
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : message.isError 
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted'
                  )}>
                    {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                  </div>
                  {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-secondary"><User size={16}/></AvatarFallback>
                        </Avatar>
                    )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary"><Bot size={16}/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 text-sm bg-muted flex items-center gap-1">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder={hasAIAccess ? "Ask about your finances..." : "Upgrade to use AI"}
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading || !hasAIAccess}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input || !hasAIAccess} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
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
  const { transactions, accounts, totals, isLoading: isDataLoading } = useUserData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryQuestion, setRetryQuestion] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

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

  const sendMessage = async (question: string) => {
    if (!question || !user?.id) return;

    setIsLoading(true);
    setRetryQuestion(null);
    const timestamp = new Date().toISOString();
    const newMessages: Message[] = [...messages, { role: "user", content: question, timestamp }];
    setMessages(newMessages);
    setInput("");

    try {
      // Prepare category totals
      const categoryTotals = transactions.reduce((acc: Record<string, number>, txn) => {
        acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
        return acc;
      }, {} as Record<string, number>);

      // Prepare financial data with user context
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
        recentTransactions: transactions.slice(-20).map(txn => ({
          date: txn.date,
          description: txn.description,
          amount: txn.amount,
          category: txn.category,
        })),
        categoryTotals,
      };

      // Call backend API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }
      
      const response = await fetch(`${apiUrl}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          userId: user.id,
          financialData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        if (response.status === 429) {
          throw new Error('AI is temporarily busy. Please wait a moment and try again.');
        }
        throw new Error(errorData.error || errorData.message || 'Failed to get AI response');
      }

      const result = await response.json();
      setMessages([...newMessages, { 
        role: "assistant", 
        content: result.answer,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error("Error answering finance question:", error);
      let errorMessage = "Sorry, I couldn't get an answer. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('not configured') || error.message.includes('not properly configured')) {
          errorMessage = "AI service is not configured. Please contact support.";
        } else if (error.message.includes('API key')) {
          errorMessage = "There's an issue with the AI configuration. Please try again later.";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('Session expired') || error.message.includes('Not authenticated') || error.message.includes('log in')) {
          errorMessage = "Your session has expired. Please refresh the page and log in again.";
        } else if (error.message.includes('busy') || error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate')) {
          errorMessage = "I'm a bit busy right now! 😅 Please wait a few seconds and try again.";
        }
      }
      
      setRetryQuestion(question);
      setMessages([...newMessages, { 
        role: "assistant", 
        content: errorMessage,
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleRetry = () => {
    if (retryQuestion) {
      // Remove the last error message
      setMessages(prev => prev.slice(0, -1));
      sendMessage(retryQuestion);
    }
  };

  const clearChatHistory = () => {
    if (user?.id) {
      const storageKey = `budgee_chat_history_${user.id}`;
      localStorage.removeItem(storageKey);
      setMessages([]);
      setRetryQuestion(null);
    }
  };

  // Check if user has AI enabled in their plan
  const hasAIAccess = user?.plan?.aiEnabled !== false;

  // Listen for clear chat event from parent
  useEffect(() => {
    const handleClearChatEvent = () => {
      clearChatHistory();
    };
    
    window.addEventListener('budgee:clearChat', handleClearChatEvent);
    return () => {
      window.removeEventListener('budgee:clearChat', handleClearChatEvent);
    };
  }, [user?.id]);

  return (
    <div className="relative rounded-lg border p-4 min-h-[calc(100vh-140px)] md:min-h-0 md:h-full md:border-0 md:p-0 md:flex md:flex-col">
      <ScrollArea className="w-full pr-4 pb-28 md:pr-6 md:pb-4 md:flex-1 md:overflow-y-auto">
        <div className="space-y-4 md:space-y-6 md:max-w-4xl md:mx-auto">
          {/* Not authenticated state */}
          {!user && (
            <div className="grid place-items-center min-h-[50vh] md:min-h-[200px]">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive" aria-hidden>
                  <AlertCircle className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h4 className="font-medium leading-none md:text-lg">Not Authenticated</h4>
                <p className="text-sm text-muted-foreground md:text-base mt-2">Please log in to use Budgee AI.</p>
              </div>
            </div>
          )}
          
          {/* Loading user data state */}
          {user && isDataLoading && messages.length === 0 && (
            <div className="grid place-items-center min-h-[50vh] md:min-h-[200px]">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse" aria-hidden>
                  <Bot className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h4 className="font-medium leading-none md:text-lg">Loading your financial data...</h4>
                <p className="text-sm text-muted-foreground md:text-base mt-2">Getting everything ready for you.</p>
              </div>
            </div>
          )}
          
          {/* Welcome state with suggested questions */}
          {user && !isDataLoading && messages.length === 0 && !isLoading && (
            <div className="grid place-items-center min-h-[50vh] md:min-h-[200px]">
              <div className="text-center max-w-md">
                <div className="mx-auto mb-3 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary" aria-hidden>
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h4 className="font-medium leading-none md:text-lg">
                  Hey {user.firstName || user.name?.split(' ')[0] || 'there'}! 👋
                </h4>
                <p className="text-sm text-muted-foreground md:text-base mt-2 mb-6">
                  I'm Budgee, your personal finance buddy. Ask me anything about your money!
                </p>
                
                {/* Suggested questions */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs md:text-sm h-auto py-2 px-3 whitespace-normal text-left"
                      onClick={() => handleSuggestedQuestion(question)}
                      disabled={!hasAIAccess}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Chat messages */}
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-start gap-2 md:gap-3",
                message.role === 'user' ? 'justify-end' : ''
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                  <AvatarFallback className={cn(
                    "bg-gradient-to-br",
                    message.isError 
                      ? "from-destructive/20 to-destructive/10 text-destructive" 
                      : "from-primary/20 to-primary/10 text-primary"
                  )}>
                    {message.isError ? <AlertCircle size={16} className="md:w-5 md:h-5"/> : <Bot size={16} className="md:w-5 md:h-5"/>}
                  </AvatarFallback>
                </Avatar>
              )}
              <div 
                className={cn(
                  "rounded-2xl p-3 md:p-4 text-sm md:text-base max-w-[85%] md:max-w-[75%]",
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-md' 
                    : message.isError
                      ? 'bg-destructive/10 text-destructive rounded-bl-md'
                      : 'bg-muted rounded-bl-md'
                )}
              >
                {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                
                {/* Retry button for error messages */}
                {message.isError && retryQuestion && index === messages.length - 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-auto py-1 px-2 text-xs"
                    onClick={handleRetry}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try again
                  </Button>
                )}
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                  <AvatarFallback className="bg-secondary">
                    <User size={16} className="md:w-5 md:h-5"/>
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-start gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                  <Bot size={16} className="md:w-5 md:h-5"/>
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-bl-md p-3 md:p-4 text-sm bg-muted flex items-center gap-1">
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="fixed left-4 right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+80px)] z-50 flex w-auto items-center gap-2 rounded-full border bg-background/95 shadow-lg backdrop-blur-md px-3 py-2
                   md:static md:bottom-auto md:z-auto md:w-full md:max-w-3xl md:mx-auto md:left-auto md:right-auto md:mt-6 md:mb-0 md:flex-shrink-0"
      >
        <Input
          id="message"
          placeholder={hasAIAccess ? "Ask me about your finances..." : "Upgrade to use AI features"}
          className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10 md:h-12 md:text-base"
          autoComplete="off"
          value={input}
          onChange={handleInputChange}
          disabled={isLoading || !hasAIAccess}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input || !hasAIAccess} 
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md md:h-12 md:w-12 transition-transform hover:scale-105"
        >
          <Send className="h-4 w-4 md:h-5 md:w-5 -translate-x-[1px] translate-y-[1px]" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
