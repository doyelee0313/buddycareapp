import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { CaregiverNav } from '@/components/caregiver/CaregiverNav';
import { supabase } from '@/integrations/supabase/client';

interface DbConversation {
  id: string;
  user_id: string;
  role: string;
  content: string;
  emotion_tag: string | null;
  created_at: string;
}

const emotionColors: Record<string, string> = {
  happy: 'bg-green-100 text-green-700 border-green-200',
  sad: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  pain_suspected: 'bg-red-100 text-red-700 border-red-200',
  anxious: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const emotionLabels: Record<string, string> = {
  happy: '😊 Happy',
  sad: '😢 Sad',
  neutral: '😐 Neutral',
  pain_suspected: '⚠️ Pain Suspected',
  anxious: '😟 Anxious',
};

export default function CaregiverLogs() {
  const { elderlyProfile } = useApp();
  const [dbConversations, setDbConversations] = useState<DbConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations from database
  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        setDbConversations(data || []);
      }
      setIsLoading(false);
    };

    fetchConversations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          setDbConversations(prev => [...prev, payload.new as DbConversation]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate emotion counts
  const emotionCounts = dbConversations.reduce((acc, conv) => {
    if (conv.emotion_tag && conv.role === 'user') {
      acc[conv.emotion_tag] = (acc[conv.emotion_tag] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Find concerning emotions
  const hasConcerningEmotions = emotionCounts.pain_suspected > 0 || emotionCounts.sad > 0 || emotionCounts.anxious > 0;

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-top">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Conversation Logs</h1>
          <p className="text-muted-foreground">AI-analyzed conversations with {elderlyProfile.name}</p>
        </motion.div>

        {/* Emotion Summary */}
        <motion.div 
          className="bg-card rounded-3xl p-5 shadow-card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-bold mb-4">Today's Emotional Summary</h3>
          {isLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-24 bg-muted animate-pulse rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(emotionLabels).map(([key, label]) => {
                const count = emotionCounts[key] || 0;
                if (count === 0) return null;
                return (
                  <span
                    key={key}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${emotionColors[key]}`}
                  >
                    {label} ({count})
                  </span>
                );
              })}
              {Object.values(emotionCounts).every(c => c === 0) && (
                <span className="text-muted-foreground">No conversations yet today</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Alert Banner if concerning emotions detected */}
        {hasConcerningEmotions && (
          <motion.div 
            className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 text-white mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="font-bold text-lg mb-2">⚠️ Attention Needed</h3>
            <p className="opacity-95">
              {elderlyProfile.name} may need some extra care today. 
              {emotionCounts.pain_suspected > 0 && " They mentioned some discomfort."}
              {emotionCounts.sad > 0 && " They seem a bit down."}
              {emotionCounts.anxious > 0 && " They expressed some worry."}
            </p>
          </motion.div>
        )}

        {/* Conversation Timeline */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-lg">Conversation History</h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-4 animate-pulse">
                  <div className="h-4 w-32 bg-muted rounded mb-2" />
                  <div className="h-6 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : dbConversations.length === 0 ? (
            <div className="bg-card rounded-2xl p-6 text-center">
              <p className="text-muted-foreground">No conversations yet. Conversations will appear here when {elderlyProfile.name} chats with Buddy.</p>
            </div>
          ) : (
            dbConversations.map((message, index) => (
              <motion.div
                key={message.id}
                className={`bg-card rounded-2xl p-4 shadow-card ${
                  message.role === 'user' ? 'ml-4' : 'mr-4'
                }`}
                initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-muted-foreground">
                    {message.role === 'puppy' ? '🐕 Buddy (AI)' : `👤 ${elderlyProfile.name}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-foreground mb-3">{message.content}</p>
                
                {message.emotion_tag && (
                  <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium border ${emotionColors[message.emotion_tag]}`}>
                    {emotionLabels[message.emotion_tag]}
                  </span>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* AI Insights */}
        <motion.div 
          className="bg-gradient-to-r from-caregiver-primary to-blue-500 rounded-3xl p-6 text-white mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold text-lg mb-2">🤖 AI Insight</h3>
          <p className="opacity-90">
            {dbConversations.length === 0 
              ? `Waiting for ${elderlyProfile.name} to start a conversation with Buddy. All messages will be analyzed for emotional insights.`
              : hasConcerningEmotions
                ? `Based on today's conversations, ${elderlyProfile.name} may benefit from a check-in call. Consider reaching out to see how they're doing.`
                : `Based on today's conversations, ${elderlyProfile.name} appears to be in good spirits. Their daily routine seems to be going well.`
            }
          </p>
        </motion.div>
      </div>

      <CaregiverNav />
    </div>
  );
}
