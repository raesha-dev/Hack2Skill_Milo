import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MessageCircle, Heart, Shield, Users, ExternalLink, Pause } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateTTS } from '@/lib/api'; // Assumes Google Cloud TTS endpoint in backend

export const EmergencyHelp: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const crisisResources = [
    {
      id: 'crisis',
      title: '🚨 Crisis Hotline',
      subtitle: 'Available 24/7',
      phone: '988',
      description: 'Immediate support for thoughts of self-harm or suicide',
      color: 'from-red-400 to-red-600',
      urgent: true,
      phoneLink: '988'
    },
    {
      id: 'text',
      title: '💬 Crisis Text Line',
      subtitle: 'Text support available',
      phone: 'Text HOME to 741741',
      description: 'Free, confidential support via text message',
      color: 'from-blue-400 to-blue-600',
      urgent: true,
      phoneLink: ''
    },
    {
      id: 'teen',
      title: '🌟 Teen Line',
      subtitle: 'Peer support',
      phone: '1-800-852-8336',
      description: 'Teens helping teens through difficult times',
      color: 'from-purple-400 to-purple-600',
      urgent: false,
      phoneLink: '18008528336'
    }
  ];

  // Self-care Actions
  const selfCareOptions = [
    {
      title: 'Deep Breathing',
      icon: '🫁',
      action: 'Start 5-minute breathing',
      description: 'Immediate anxiety relief',
      ttsText: "Let's do a calming breathing exercise together. Breathe in slowly for 4 seconds, hold for 4 seconds, breathe out for 4 seconds. Repeat this for a few minutes and notice how your body relaxes."
    },
    {
      title: 'Grounding Exercise',
      icon: '🌍',
      action: 'Try 5-4-3-2-1 technique',
      description: 'Connect with your surroundings',
      ttsText: "Look around you and try to notice 5 things you can see, 4 things you can feel, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This grounding exercise can help you feel present and safe."
    },
    {
      title: 'Call a Trusted Person',
      icon: '📞',
      action: 'Contact someone you trust',
      description: 'Reach out to a friend or family member',
      ttsText: "Consider reaching out to someone you trust. A phone call or message can make you feel less alone."
    },
    {
      title: 'Safety Plan',
      icon: '🛡️',
      action: 'Review your safety plan',
      description: 'Remember your coping strategies',
      ttsText: "Take a moment to remember your safety plan and coping strategies. You have gotten through tough times before, and you can again."
    }
  ];

  const playAudio = async (ttsText: string) => {
    setLoadingAudio(true);
    setAudioUrl(null); // Clears any previous audio
    try {
      const ttsResponse = await generateTTS(ttsText);
      setAudioUrl(ttsResponse.audio_url);
    } catch {
      alert("Could not play guidance audio right now.");
    } finally {
      setLoadingAudio(false);
    }
  };

  const stopAudio = () => {
    setAudioUrl(null);
  };

  return (
    <div className="p-4 h-full overflow-y-auto bg-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold mb-2">🚨 Support & Safety</h2>
        <p className="text-white/80">You matter. Help is always available.</p>
      </div>
      {/* Emergency Alert */}
      <Alert className="mb-6 bg-red-50 border-red-200">
        <Shield className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>If you're in immediate danger or having thoughts of self-harm:</strong>
          <br />
          Call 911 or go to your nearest emergency room right away.
        </AlertDescription>
      </Alert>

      {/* Crisis Resources */}
      <div className="mb-6">
        <h3 className="text-white text-lg font-semibold mb-3">🆘 Crisis Support</h3>
        <div className="space-y-3">
          {crisisResources.map((resource) => (
            <Card
              key={resource.id}
              className={`bg-gradient-to-r ${resource.color} text-white ${resource.urgent ? 'ring-2 ring-white/50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{resource.title}</h4>
                    <p className="text-white/90 text-sm">{resource.subtitle}</p>
                    <p className="text-white/80 text-sm mt-1">{resource.description}</p>
                  </div>
                  <div className="text-right">
                    <Button
                      variant="secondary"
                      className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                      onClick={() => {
                        if (resource.phoneLink) {
                          window.open(`tel:${resource.phoneLink}`, '_blank');
                        }
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {resource.phone}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Immediate Self-Care */}
      <div className="mb-6">
        <h3 className="text-white text-lg font-semibold mb-3">💙 Right Now, You Can...</h3>
        <div className="grid gap-3">
          {selfCareOptions.map((option, index) => (
            <Card key={index} className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <h4 className="font-semibold">{option.title}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingAudio}
                      onClick={() => playAudio(option.ttsText)}
                    >
                      {option.action}
                    </Button>
                    {audioUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Stop audio"
                        onClick={stopAudio}
                      >
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {/* Audio Player below */}
                {audioUrl && (
                  <div className="mt-3">
                    <audio src={audioUrl} autoPlay controls onEnded={stopAudio} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Professional Resources */}
      <Card className="mb-6 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Professional Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Find a Therapist</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Professional counselors who understand what you're going through
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open("https://www.psychologytoday.com/us/therapists", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Psychology Today Directory
              </Button>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Mental Health Apps</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Additional resources for daily mental health support
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://www.headspace.com/", "_blank")}
                >
                  Headspace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://www.calm.com/", "_blank")}
                >
                  Calm
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gentle Reminders */}
      <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
        <CardContent className="p-4 text-center">
          <Heart className="w-8 h-8 mx-auto mb-3 text-white" />
          <h4 className="font-semibold mb-2">You Are Not Alone</h4>
          <p className="text-white/90 text-sm mb-3">
            What you're feeling is valid. Reaching out for help is a sign of strength, not weakness.
          </p>
          <p className="text-white/80 text-xs">
            Crisis passes. Hope remains. You matter more than you know. 💙
          </p>
        </CardContent>
      </Card>

      {/* Safety Planning Note */}
      <Alert className="mt-4 bg-blue-50 border-blue-200">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>Safety Planning:</strong> Consider creating a safety plan with a trusted adult,
          counselor, or therapist. This helps you prepare coping strategies for difficult moments.
        </AlertDescription>
      </Alert>
    </div>
  );
};
