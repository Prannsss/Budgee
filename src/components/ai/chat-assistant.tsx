"use client";

import { useState } from "react";
import { Bot, Loader2, Send, User } from "lucide-react";

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

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatAssistant({ trigger }: { trigger?: React.ReactElement }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

    setIsLoading(true);
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const result = await answerFinanceQuestion({ question: input });
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

    setIsLoading(true);
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const result = await answerFinanceQuestion({ question: input });
      setMessages([...newMessages, { role: "assistant", content: result.answer }]);
    } catch (error) {
      console.error("Error answering finance question:", error);
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't get an answer. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="relative rounded-lg border p-4 min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-160px)] md:border-0 md:p-0">
  <ScrollArea className="w-full pr-4 pb-28 md:pr-0 md:pb-24 md:h-[calc(100vh-260px)]">
        <div className="space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="grid place-items-center min-h-[50vh] md:h-72">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
                  <Bot className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <h4 className="font-medium leading-none">Budgee AI</h4>
                <p className="text-sm text-muted-foreground">Ask me anything about your finances.</p>
              </div>
            </div>
          )}
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
      <form
        onSubmit={handleSubmit}
        className="fixed left-4 right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+80px)] z-50 flex w-auto items-center gap-2 rounded-full border bg-background/90 shadow-lg backdrop-blur px-3 py-2
                   md:sticky md:bottom-10 md:z-auto md:w-full md:max-w-2xl md:mx-auto md:left-auto md:right-auto md:translate-x-0"
      >
        <Input
          id="message"
          placeholder="Type your question..."
          className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
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
  );
}
