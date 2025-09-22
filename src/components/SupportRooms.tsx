import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, MessageCircle, Shield } from 'lucide-react';

interface SupportRoom {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  icon: string;
  theme: string;
  recentMoods: { mood: string; count: number; emoji: string }[];
}

interface AnonymousMessage {
  id: string;
  message: string;
  mood: string;
  timestamp: Date;
  hearts: number;
}

// Backend API base URL (configurable via env)
const API_ROOT = import.meta.env.VITE_BACKEND_API || "http://localhost:5000/api";

// Fetch support rooms data from backend Firestore collection
async function fetchSupportRooms(): Promise<SupportRoom[]> {
  // Replace this with your backend API fetching support rooms if dynamic, else keep static
  return [
    {
      id: '1',
      name: 'Daily Check-ins',
      description: "Share how you're feeling today in a safe space",
      memberCount: 247,
      icon: '🌅',
      theme: 'from-blue-400 to-purple-500',
      recentMoods: [
        { mood: 'okay', count: 12, emoji: '😐' },
        { mood: 'anxious', count: 8, emoji: '😰' },
        { mood: 'happy', count: 15, emoji: '😊' },
      ],
    },
    {
      id: '2',
      name: 'Student Support',
      description: 'Connect with others navigating school and study stress',
      memberCount: 189,
      icon: '📚',
      theme: 'from-green-400 to-blue-500',
      recentMoods: [
        { mood: 'stressed', count: 18, emoji: '😤' },
        { mood: 'determined', count: 9, emoji: '💪' },
        { mood: 'tired', count: 11, emoji: '😴' },
      ],
    },
    {
      id: '3',
      name: 'Anxiety Garden',
      description: 'A gentle space for those dealing with worry and anxiety',
      memberCount: 156,
      icon: '🌸',
      theme: 'from-pink-400 to-purple-500',
      recentMoods: [
        { mood: 'anxious', count: 14, emoji: '😰' },
        { mood: 'breathing', count: 7, emoji: '🫁' },
        { mood: 'hopeful', count: 6, emoji: '🌈' },
      ],
    },
    {
      id: '4',
      name: 'Gratitude Circle',
      description: "Share what you're grateful for and spread positivity",
      memberCount: 203,
      icon: '🙏',
      theme: 'from-yellow-400 to-orange-500',
      recentMoods: [
        { mood: 'grateful', count: 22, emoji: '🙏' },
        { mood: 'blessed', count: 11, emoji: '✨' },
        { mood: 'content', count: 9, emoji: '😌' },
      ],
    },
  ];
}

// Fetch anonymous messages for a given room from backend Firestore collection
async function fetchMessages(roomId: string): Promise<AnonymousMessage[]> {
  try {
    const res = await fetch(`${API_ROOT}/anonymousMessages?roomId=${roomId}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    // Convert timestamps from string to Date objects if necessary
    return data.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch {
    // fallback empty array on error
    return [];
  }
}

// Send "heart" increment action to backend and optimistically update hearts count
async function sendHeart(messageId: string) {
  try {
    await fetch(`${API_ROOT}/anonymousMessages/${messageId}/heart`, {
      method: 'POST',
    });
    // No return required; UI updates handled optimistically in component
  } catch {
    // Error handling can be extended
  }
}

export const SupportRooms: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<SupportRoom | null>(null);
  const [supportRooms, setSupportRooms] = useState<SupportRoom[]>([]);
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);

  // Load support rooms once
  useEffect(() => {
    (async () => {
      const rooms = await fetchSupportRooms();
      setSupportRooms(rooms);
    })();
  }, []);

  // Load messages when room changes
  useEffect(() => {
    if (!selectedRoom) {
      setMessages([]);
      return;
    }
    (async () => {
      const msgs = await fetchMessages(selectedRoom.id);
      setMessages(msgs);
    })();
  }, [selectedRoom]);

  const handleSendHeart = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, hearts: msg.hearts + 1 } : msg
      )
    );
    sendHeart(messageId); // fire and forget backend update
  };

  return (
    <div className="p-4 h-full overflow-y-auto bg-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold mb-2">🏠 Support Rooms</h2>
        <p className="text-white/80">
          Connect anonymously with others who understand
        </p>
      </div>
      {!selectedRoom ? (
        // Room selection list
        <div className="space-y-4">
          {/* Privacy Notice */}
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">
                    Your Privacy is Protected
                  </h4>
                  <p className="text-sm text-blue-700">
                    All messages are anonymous. No personal information is
                    shared. This is a safe space for authentic connection.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Room List */}
          {supportRooms.map((room) => (
            <Card
              key={room.id}
              className="bg-white/90 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRoom(room)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-r ${room.theme} flex items-center justify-center text-2xl`}
                    >
                      {room.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{room.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {room.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-muted-foreground text-sm mb-1">
                      <Users className="w-4 h-4 mr-1" />
                      {room.memberCount}
                    </div>
                  </div>
                </div>
                {/* Recent Moods */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Recent community moods:
                  </p>
                  <div className="flex space-x-2">
                    {room.recentMoods.map((mood, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {mood.emoji} {mood.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Selected room’s detail & messages
        <div className="space-y-4">
          {/* Room Header */}
          <Card
            className={`bg-gradient-to-r ${selectedRoom.theme} text-white`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedRoom.icon}</span>
                  <div>
                    <h3>{selectedRoom.name}</h3>
                    <p className="text-white/90 text-sm">{selectedRoom.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRoom(null)}
                  className="text-white hover:bg-white/20"
                >
                  ← Back
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-white/90">
                    <Users className="w-4 h-4 mr-1" />
                    {selectedRoom.memberCount} members
                  </div>
                  <div className="flex items-center text-white/90">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {messages.length} recent messages
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Community Stats */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">🌍 Community Pulse</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                How others in this room are feeling today:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.recentMoods.map((mood, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {mood.emoji} {mood.count} people feeling {mood.mood}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Remember: You're not alone in what you're experiencing 💙
              </p>
            </CardContent>
          </Card>
          {/* Anonymous Messages */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold">Recent Anonymous Shares</h4>
            {messages.map((message) => (
              <Card key={message.id} className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm flex-1">{message.message}</p>
                    <span className="text-xs text-muted-foreground ml-2">
                      {getTimeAgo(message.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      Anonymous • {message.mood}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendHeart(message.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {message.hearts}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Share Section */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Share Anonymously</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Share how you're feeling to help others know they're not alone. Your
                message will be completely anonymous.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  😔 Having a tough day
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  😰 Feeling anxious
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  💪 Staying strong
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  🙏 Grateful today
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                * Feature coming soon: Full anonymous messaging
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Helper function outside component to avoid duplicate declarations
function getTimeAgo(timestamp: Date) {
  const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
