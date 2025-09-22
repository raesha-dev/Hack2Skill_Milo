import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { saveMood, getRecentMoods } from '@/lib/api';

export interface MoodEntry {
  id: string;
  mood: string;
  emoji: string;
  timestamp: string; // ISO string format
  note?: string;
}

interface MoodOption {
  value: string;
  emoji: string;
  label: string;
  color: string;
}

export const MoodLogger: React.FC = () => {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');

  const moodOptions: MoodOption[] = [
    { value: 'amazing', emoji: '🤩', label: 'Amazing', color: 'from-yellow-400 to-orange-500' },
    { value: 'happy', emoji: '😊', label: 'Happy', color: 'from-green-400 to-blue-500' },
    { value: 'okay', emoji: '😐', label: 'Okay', color: 'from-blue-400 to-purple-500' },
    { value: 'sad', emoji: '😔', label: 'Sad', color: 'from-purple-400 to-pink-500' },
    { value: 'anxious', emoji: '😰', label: 'Anxious', color: 'from-red-400 to-orange-500' },
    { value: 'angry', emoji: '😠', label: 'Angry', color: 'from-red-500 to-red-700' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const recentMoods = await getRecentMoods();
        setMoods(recentMoods);
      } catch (error) {
        console.warn('Failed to load recent moods:', error);
      }
    })();
  }, []);

  const handleMoodSelect = async (mood: MoodOption) => {
    if (mood.value === selectedMood) return;

    const newMood: MoodEntry = {
      id: Date.now().toString(),
      mood: mood.value,
      emoji: mood.emoji,
      timestamp: new Date().toISOString(), // store as ISO string
    };

    setMoods(prev => [newMood, ...prev]);
    setSelectedMood(mood.value);

    try {
      await saveMood(newMood);
    } catch (e) {
      console.warn('Failed to save mood', e);
    }
  };

  const growthPoints = moods.length * 10;
  const weeklyStreak = Math.min(moods.length, 7);

  return (
    <div className="p-4 h-full overflow-y-auto bg-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold mb-2">📝 How are you feeling?</h2>
        <p className="text-white/80">Tap an emoji to log your mood and grow your garden! 🌱</p>
      </div>

      {/* Mood Options */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {moodOptions.map((mood) => (
          <Button
            key={mood.value}
            onClick={() => handleMoodSelect(mood)}
            className={`h-16 bg-gradient-to-r ${mood.color} text-white font-medium shadow-lg hover:scale-105 transition-transform`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-sm">{mood.label}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Growth Stats */}
      <Card className="mb-6 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">🌸 Your Growth Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Growth Points</span>
                <span>{growthPoints} pts</span>
              </div>
              <Progress value={growthPoints % 100} />
              <p className="text-xs text-muted-foreground mt-1">
                {100 - (growthPoints % 100)} more points to next flower! 🌺
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Weekly Streak</span>
                <span>{weeklyStreak}/7 days</span>
              </div>
              <Progress value={(weeklyStreak / 7) * 100} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Moods */}
      <div>
        <h3 className="text-white text-lg font-semibold mb-3">Recent Moods</h3>
        <div className="space-y-2">
          {moods.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">No moods logged yet. Start by selecting how you feel! 💙</p>
              </CardContent>
            </Card>
          ) : (
            moods.slice(0, 5).map((mood) => {
              const moodData = moodOptions.find(m => m.value === mood.mood);
              return (
                <Card key={mood.id} className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{mood.emoji}</span>
                        <div>
                          <p className="font-medium">{moodData?.label ?? 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">+10 growth points earned! 🌱</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(mood.timestamp).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
