import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Camera, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatWithBot } from '@/lib/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'milo';
  timestamp: Date;
  mood?: string;
}

interface ChatInterfaceProps {
  messageColor: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messageColor }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm Milo, your digital buddy 🌸 I'm here to listen, support, and grow with you. How are you feeling today?",
      sender: 'milo',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getMessageGradient = (color: string) => {
    const gradients: Record<string, string> = {
      pink: 'var(--gradient-pink)',
      ocean: 'var(--gradient-ocean)',
      sunset: 'var(--gradient-sunset)',
      forest: 'var(--gradient-forest)',
      lavender: 'var(--gradient-lavender)',
      rose: 'var(--gradient-rose)'
    };
    return gradients[color] || gradients.pink;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsSending(true);

    try {
      // FIX: extract the `response` string from chatWithBot
      const miloData = await chatWithBot(userMessage.text);

      const miloResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: miloData.response, // <- use the actual string
        sender: 'milo',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, miloResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "Sorry, Milo is having trouble responding right now.",
        sender: 'milo',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-sm">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'text-white shadow-lg'
                  : 'bg-white/90 text-gray-800 shadow-lg'
              }`}
              style={message.sender === 'user' ? { background: getMessageGradient(messageColor) } : {}}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2">
        <div className="flex space-x-2 mb-3">
          <Button
            size="sm"
            variant="secondary"
            className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30"
            onClick={() => setNewMessage("😊 I'm feeling good")}
            disabled={isSending}
          >
            😊 I'm feeling good
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30"
            onClick={() => setNewMessage("😔 Having a tough day")}
            disabled={isSending}
          >
            😔 Having a tough day
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30"
            onClick={() => setNewMessage("🤗 Need some support")}
            disabled={isSending}
          >
            🤗 Need some support
          </Button>
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-cream border-t border-cream/20 p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-cream-foreground hover:bg-cream-foreground/10"
            disabled={isSending}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-cream-foreground hover:bg-cream-foreground/10"
            disabled={isSending}
          >
            <Camera className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Message Milo..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-white border-cream/30 text-cream-foreground placeholder:text-cream-foreground/50"
            disabled={isSending}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-cream-foreground hover:bg-cream-foreground/10"
            disabled={isSending}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="text-white"
            style={{ background: getMessageGradient(messageColor) }}
            disabled={isSending || !newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
