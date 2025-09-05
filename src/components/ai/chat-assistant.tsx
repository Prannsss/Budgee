"use client";

import { useState } from "react";
import { useActions, useStreamableValue, useUIState } from "ai/rsc";
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

export function ChatAssistant() {
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
        <Button variant="outline" size="icon" className="rounded-full">
          <Bot />
          <span className="sr-only">Open AI Chat</span>
        </Button>
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
            <Button type="submit" size="icon" disabled={isLoading || !input}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
