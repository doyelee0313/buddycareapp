import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, MessageSquare, Calendar, Smile } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { CaregiverNav } from '@/components/caregiver/CaregiverNav';
import { supabase } from '@/integrations/supabase/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfDay, endOfDay, isSameDay } from 'date-fns';

interface DbConversation {
  id: string;
  user_id: string;
  role: string;
  content: string;
  emotion_tag: string | null;
  created_at: string;
}

interface MissionCompletion {
  id: string;
  user_id: string;
  mission_type: string;
  completed_at: string;
}

interface DailySummary {
  date: Date;
  emotions: string[];
  conversations: DbConversation[];
  hasDanger: boolean;
}

// Danger keywords for detection
const DANGER_KEYWORDS = [
  'pain', 'hurt', 'ache', 'sore', 'agony',
  'lonely', 'alone', 'nobody', 'isolated', 'abandoned',
  'emergency', 'help', 'fall', 'fell', 'accident',
  'scared', 'afraid', 'terrified', 'panic',
  'die', 'death', 'dying', 'end it',
  'chest pain', 'can\'t breathe', 'dizzy', 'faint'
];

const emotionEmojis: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  neutral: '😐',
  pain_suspected: '😣',
  anxious: '😟',
};

const emotionColors: Record<string, string> = {
  happy: 'bg-green-100 border-green-300',
  sad: 'bg-blue-100 border-blue-300',
  neutral: 'bg-gray-100 border-gray-300',
  pain_suspected: 'bg-red-100 border-red-300',
  anxious: 'bg-yellow-100 border-yellow-300',
};

function CaregiverLogsContent() {
  const { elderlyProfile } = useApp();
  const { user } = useAuth();
  const [dbConversations, setDbConversations] = useState<DbConversation[]>([]);
  const [missionCompletions, setMissionCompletions] = useState<MissionCompletion[]>([]);
  const [linkedElderlyName, setLinkedElderlyName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllMissions, setShowAllMissions] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch linked elderly
      const { data: elderlyData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('linked_caregiver_id', user.id)
        .maybeSingle();

      if (elderlyData) {
        setLinkedElderlyName(elderlyData.display_name);

        // Fetch conversations (last 7 days)
        const sevenDaysAgo = subDays(new Date(), 7);
        const { data: convData } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', elderlyData.user_id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (convData) {
          setDbConversations(convData);
        }

        // Fetch mission completions (last 7 days)
        const { data: missionsData } = await supabase
          .from('mission_completions')
          .select('*')
          .eq('user_id', elderlyData.user_id)
          .gte('completed_at', sevenDaysAgo.toISOString())
          .order('completed_at', { ascending: false });

        if (missionsData) {
          setMissionCompletions(missionsData);
        }
      }
      setIsLoading(false);
    };

    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('logs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, (payload) => {
        setDbConversations(prev => [...prev, payload.new as DbConversation]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mission_completions' }, (payload) => {
        setMissionCompletions(prev => [payload.new as MissionCompletion, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Check for danger signals in text
  const hasDangerSignal = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return DANGER_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  // Get emotions for the last 7 days
  const getLast7DaysEmotions = () => {
    const days: { date: Date; emotions: string[] }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayConversations = dbConversations.filter(conv => 
        conv.role === 'user' && 
        conv.emotion_tag &&
        isSameDay(new Date(conv.created_at), date)
      );
      const emotions = dayConversations.map(c => c.emotion_tag!);
      days.push({ date, emotions });
    }
    return days;
  };

  // Get daily summaries for chat
  const getDailySummaries = (): DailySummary[] => {
    const summaryMap = new Map<string, DailySummary>();
    
    dbConversations.forEach(conv => {
      const dateKey = format(new Date(conv.created_at), 'yyyy-MM-dd');
      if (!summaryMap.has(dateKey)) {
        summaryMap.set(dateKey, {
          date: startOfDay(new Date(conv.created_at)),
          emotions: [],
          conversations: [],
          hasDanger: false,
        });
      }
      const summary = summaryMap.get(dateKey)!;
      summary.conversations.push(conv);
      if (conv.emotion_tag && conv.role === 'user') {
        summary.emotions.push(conv.emotion_tag);
      }
      if (hasDangerSignal(conv.content)) {
        summary.hasDanger = true;
      }
    });

    return Array.from(summaryMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // Get mission stats for last 7 days
  const getMissionStats = () => {
    const stats: { date: Date; missions: string[]; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(new Date(), i);
      const dayMissions = missionCompletions.filter(m => 
        isSameDay(new Date(m.completed_at), date)
      );
      stats.push({
        date,
        missions: dayMissions.map(m => m.mission_type),
        count: dayMissions.length,
      });
    }
    return stats;
  };

  const last7DaysEmotions = getLast7DaysEmotions();
  const dailySummaries = getDailySummaries();
  const missionStats = getMissionStats();
  const displayedMissions = showAllMissions ? missionStats : missionStats.slice(0, 3);
  const displayName = linkedElderlyName || elderlyProfile.name;

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-top">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-muted-foreground">Monitoring {displayName}'s wellbeing</p>
        </motion.div>

        {/* Section 1: Emotion Logs */}
        <motion.div 
          className="bg-card rounded-3xl p-5 shadow-card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Smile className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Emotional Trend (7 Days)</h3>
          </div>
          
          {isLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="flex-1 h-16 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {last7DaysEmotions.map((day, index) => {
                const dominantEmotion = day.emotions.length > 0 
                  ? day.emotions.sort((a, b) => 
                      day.emotions.filter(e => e === b).length - day.emotions.filter(e => e === a).length
                    )[0]
                  : null;
                
                return (
                  <motion.div
                    key={index}
                    className={`flex-1 min-w-[60px] rounded-xl p-3 text-center border-2 ${
                      dominantEmotion ? emotionColors[dominantEmotion] : 'bg-muted/50 border-muted'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <div className="text-2xl mb-1">
                      {dominantEmotion ? emotionEmojis[dominantEmotion] : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(day.date, 'EEE')}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Section 2: Mission History */}
        <motion.div 
          className="bg-card rounded-3xl p-5 shadow-card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Mission History</h3>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <AnimatePresence>
                  {displayedMissions.map((stat, index) => (
                    <motion.div
                      key={format(stat.date, 'yyyy-MM-dd')}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div>
                        <p className="font-medium">{format(stat.date, 'EEEE, MMM d')}</p>
                        <p className="text-sm text-muted-foreground">
                          {stat.count > 0 
                            ? stat.missions.join(', ')
                            : 'No missions completed'
                          }
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        stat.count >= 3 
                          ? 'bg-green-100 text-green-700'
                          : stat.count > 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {stat.count}/5
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {missionStats.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full mt-3"
                  onClick={() => setShowAllMissions(!showAllMissions)}
                >
                  {showAllMissions ? (
                    <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>View More <ChevronDown className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              )}
            </>
          )}
        </motion.div>

        {/* Section 3: AI Chat Summaries */}
        <motion.div 
          className="bg-card rounded-3xl p-5 shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Daily Chat Summaries</h3>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : dailySummaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No conversations yet</p>
              <p className="text-sm">Chats will appear here when {displayName} talks to Buddy</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dailySummaries.map((summary, index) => {
                const userMessages = summary.conversations.filter(c => c.role === 'user');
                const emotionSummary = summary.emotions.length > 0
                  ? [...new Set(summary.emotions)].map(e => emotionEmojis[e] || '').join(' ')
                  : '';
                
                return (
                  <motion.div
                    key={format(summary.date, 'yyyy-MM-dd')}
                    className={`p-4 rounded-xl border-2 ${
                      summary.hasDanger 
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-muted/30 border-transparent'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    {/* Header with date and danger indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{format(summary.date, 'EEEE, MMM d')}</span>
                        {emotionSummary && <span className="text-lg">{emotionSummary}</span>}
                      </div>
                      {summary.hasDanger && (
                        <motion.div
                          className="flex items-center gap-1 text-red-600"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <AlertTriangle className="w-5 h-5" />
                          <span className="text-xs font-bold">ALERT</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Summary content */}
                    <div className="text-sm text-muted-foreground mb-2">
                      {userMessages.length} messages from {displayName}
                    </div>

                    {/* Sample messages */}
                    <div className="space-y-2">
                      {userMessages.slice(0, 2).map((msg, msgIndex) => {
                        const isDanger = hasDangerSignal(msg.content);
                        return (
                          <div
                            key={msg.id}
                            className={`text-sm p-2 rounded-lg ${
                              isDanger 
                                ? 'bg-red-100 text-red-800 border border-red-300' 
                                : 'bg-background'
                            }`}
                          >
                            {isDanger && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                            "{msg.content.length > 80 
                              ? msg.content.substring(0, 80) + '...' 
                              : msg.content}"
                            <span className="text-xs text-muted-foreground ml-2">
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </span>
                          </div>
                        );
                      })}
                      {userMessages.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{userMessages.length - 2} more messages
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <CaregiverNav />
    </div>
  );
}

export default function CaregiverLogs() {
  return (
    <ProtectedRoute requiredUserType="caregiver">
      <CaregiverLogsContent />
    </ProtectedRoute>
  );
}
