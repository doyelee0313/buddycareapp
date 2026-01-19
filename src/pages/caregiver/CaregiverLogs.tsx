import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, MessageSquare, Calendar, Smile, Loader2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { CaregiverNav } from '@/components/caregiver/CaregiverNav';
import { supabase } from '@/integrations/supabase/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { toast } from 'sonner';

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

interface AISummary {
  date: Date;
  dateStr: string;
  summary: string;
  hasConcern: boolean;
  concernReason: string | null;
  emotions: string[];
  messageCount: number;
  isLoading?: boolean;
  conversations: DbConversation[];
}

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
  const [linkedElderlyId, setLinkedElderlyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllMissions, setShowAllMissions] = useState(false);
  const [aiSummaries, setAiSummaries] = useState<AISummary[]>([]);
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());

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
        setLinkedElderlyId(elderlyData.user_id);

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

        // Fetch cached summaries
        const { data: cachedSummaries } = await supabase
          .from('daily_summaries')
          .select('*')
          .eq('user_id', elderlyData.user_id)
          .gte('summary_date', format(sevenDaysAgo, 'yyyy-MM-dd'))
          .order('summary_date', { ascending: false });

        if (cachedSummaries && cachedSummaries.length > 0) {
          const summaries: AISummary[] = cachedSummaries.map(s => {
            const date = new Date(s.summary_date);
            const allDayConvs = convData?.filter(c => 
              isSameDay(new Date(c.created_at), date)
            ) || [];
            const userConvs = allDayConvs.filter(c => c.role === 'user');
            
            return {
              date,
              dateStr: s.summary_date,
              summary: s.summary,
              hasConcern: s.has_concern || false,
              concernReason: s.concern_reason,
              emotions: userConvs.filter(c => c.emotion_tag).map(c => c.emotion_tag!),
              messageCount: userConvs.length,
              conversations: allDayConvs,
            };
          });
          setAiSummaries(summaries);
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

  // Generate AI summary for a specific day
  const generateSummaryForDay = useCallback(async (
    date: Date, 
    conversations: DbConversation[]
  ): Promise<AISummary | null> => {
    if (!linkedElderlyId || !linkedElderlyName) return null;

    const dateStr = format(date, 'yyyy-MM-dd');
    const dayConvs = conversations.filter(c => 
      isSameDay(new Date(c.created_at), date)
    );

    if (dayConvs.length === 0) return null;

    const userMessages = dayConvs.filter(c => c.role === 'user');

    try {
      const response = await supabase.functions.invoke('summarize-daily-chat', {
        body: {
          conversations: dayConvs,
          elderlyName: linkedElderlyName,
          date: dateStr,
          elderlyUserId: linkedElderlyId,
        }
      });

      if (response.error) {
        console.error('Summary error:', response.error);
        return null;
      }

      const data = response.data;

      return {
        date,
        dateStr,
        summary: data.summary || 'Unable to generate summary.',
        hasConcern: data.hasConcern || false,
        concernReason: data.concernReason || null,
        emotions: userMessages.filter(c => c.emotion_tag).map(c => c.emotion_tag!),
        messageCount: userMessages.length,
        conversations: dayConvs,
      };
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return null;
    }
  }, [linkedElderlyId, linkedElderlyName]);

  // Generate all missing summaries
  const generateMissingSummaries = useCallback(async () => {
    if (!linkedElderlyId || dbConversations.length === 0) return;

    setIsGeneratingSummaries(true);

    // Group conversations by day
    const dayMap = new Map<string, { date: Date; convs: DbConversation[] }>();
    dbConversations.forEach(conv => {
      const dateStr = format(new Date(conv.created_at), 'yyyy-MM-dd');
      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, { 
          date: startOfDay(new Date(conv.created_at)), 
          convs: [] 
        });
      }
      dayMap.get(dateStr)!.convs.push(conv);
    });

    // Find days without summaries
    const existingDates = new Set(aiSummaries.map(s => s.dateStr));
    const missingDays = Array.from(dayMap.entries())
      .filter(([dateStr]) => !existingDates.has(dateStr))
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

    if (missingDays.length === 0) {
      toast.info('All summaries are up to date');
      setIsGeneratingSummaries(false);
      return;
    }

    // Add loading placeholders
    const loadingPlaceholders: AISummary[] = missingDays.map(([dateStr, { date, convs }]) => ({
      date,
      dateStr,
      summary: '',
      hasConcern: false,
      concernReason: null,
      emotions: convs.filter(c => c.role === 'user' && c.emotion_tag).map(c => c.emotion_tag!),
      messageCount: convs.filter(c => c.role === 'user').length,
      isLoading: true,
      conversations: convs,
    }));

    setAiSummaries(prev => [...loadingPlaceholders, ...prev].sort((a, b) => 
      new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime()
    ));

    // Generate summaries one by one to avoid rate limits
    for (const [dateStr, { date, convs }] of missingDays) {
      const summary = await generateSummaryForDay(date, convs);
      
      if (summary) {
        setAiSummaries(prev => prev.map(s => 
          s.dateStr === dateStr ? { ...summary, isLoading: false } : s
        ));
      } else {
        // Remove failed placeholder
        setAiSummaries(prev => prev.filter(s => !(s.dateStr === dateStr && s.isLoading)));
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsGeneratingSummaries(false);
    toast.success('Summaries generated successfully');
  }, [linkedElderlyId, dbConversations, aiSummaries, generateSummaryForDay]);

  // Auto-generate summaries when data loads
  useEffect(() => {
    if (!isLoading && dbConversations.length > 0 && aiSummaries.length === 0 && linkedElderlyId) {
      generateMissingSummaries();
    }
  }, [isLoading, dbConversations.length, aiSummaries.length, linkedElderlyId]);

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

  // Get mission stats for last 7 days
  const getMissionStats = () => {
    const stats: { date: Date; missions: string[]; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(new Date(), i);
      const dayMissions = missionCompletions.filter(m => 
        isSameDay(new Date(m.completed_at), date)
      );
      // Get unique mission types only
      const uniqueMissionTypes = [...new Set(dayMissions.map(m => m.mission_type))];
      stats.push({
        date,
        missions: uniqueMissionTypes,
        count: Math.min(uniqueMissionTypes.length, 4), // Cap at 4 missions max
      });
    }
    return stats;
  };

  const last7DaysEmotions = getLast7DaysEmotions();
  const missionStats = getMissionStats();
  const displayedMissions = showAllMissions ? missionStats : missionStats.slice(0, 3);
  const displayName = linkedElderlyName || elderlyProfile.name;

  const toggleChatExpansion = (dateStr: string) => {
    setExpandedChats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

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
                        {stat.count}/4
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Daily Chat Summaries</h3>
            </div>
            {!isLoading && dbConversations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={generateMissingSummaries}
                disabled={isGeneratingSummaries}
                className="text-xs"
              >
                {isGeneratingSummaries ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : aiSummaries.length === 0 && dbConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No conversations yet</p>
              <p className="text-sm">Chats will appear here when {displayName} talks to Buddy</p>
            </div>
          ) : (
            <div className="space-y-4">
              {aiSummaries.map((summary, index) => {
                const emotionSummary = summary.emotions.length > 0
                  ? [...new Set(summary.emotions)].map(e => emotionEmojis[e] || '').join(' ')
                  : '';
                
                return (
                  <motion.div
                    key={summary.dateStr}
                    className={`p-4 rounded-xl border-2 ${
                      summary.hasConcern 
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-muted/30 border-transparent'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    {/* Header with date and concern indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{format(summary.date, 'EEEE, MMM d')}</span>
                        {emotionSummary && <span className="text-lg">{emotionSummary}</span>}
                      </div>
                      {summary.hasConcern && (
                        <motion.div
                          className="flex items-center gap-1 text-red-600"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <AlertTriangle className="w-5 h-5" />
                          <span className="text-xs font-bold">CONCERN</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Message count */}
                    <div className="text-xs text-muted-foreground mb-2">
                      {summary.messageCount} messages from {displayName}
                    </div>

                    {/* AI Summary */}
                    {summary.isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating AI summary...
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{summary.summary}</p>
                    )}

                    {/* Concern reason if flagged */}
                    {summary.hasConcern && summary.concernReason && (
                      <div className="mt-3 p-2 bg-red-100 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800 font-medium flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {summary.concernReason}
                        </p>
                      </div>
                    )}

                    {/* View Chat Button */}
                    {summary.conversations.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 w-full text-xs"
                        onClick={() => toggleChatExpansion(summary.dateStr)}
                      >
                        {expandedChats.has(summary.dateStr) ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Hide Chat
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            View Full Chat
                          </>
                        )}
                      </Button>
                    )}

                    {/* Expanded Chat Messages */}
                    <AnimatePresence>
                      {expandedChats.has(summary.dateStr) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 border-t pt-4 space-y-3 max-h-80 overflow-y-auto"
                        >
                          {summary.conversations.map((conv) => (
                            <div
                              key={conv.id}
                              className={`flex gap-2 ${
                                conv.role === 'user' ? 'justify-start' : 'justify-end'
                              }`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                                  conv.role === 'user'
                                    ? 'bg-primary/10 text-foreground'
                                    : 'bg-muted text-foreground'
                                }`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-xs font-medium">
                                    {conv.role === 'user' ? `🧓 ${displayName}` : '🐕 Buddy'}
                                  </span>
                                  {conv.emotion_tag && (
                                    <span className="text-sm">{emotionEmojis[conv.emotion_tag]}</span>
                                  )}
                                </div>
                                <p className="text-sm">{conv.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(conv.created_at), 'h:mm a')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
