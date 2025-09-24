'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatWidget() : unknown {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm here to help with your printing needs. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          data.response || "I apologize, but I couldn't process your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // If human support is needed, show a notification
      if (data.needsHuman) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content:
                'Would you like me to connect you with a human representative? You can also email us at support@gangrunprinting.com',
              timestamp: new Date(),
            },
          ])
        }, 1000)
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please email us at support@gangrunprinting.com for assistance.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          aria-label="Open chat"
          className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-background border rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Printing Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by AI</p>
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
            >
              <Input
                className="flex-1"
                disabled={isLoading}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button disabled={isLoading || !input.trim()} size="icon" type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI assistant may make mistakes. For orders, contact support.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
