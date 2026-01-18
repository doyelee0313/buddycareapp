import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { CaregiverNav } from '@/components/caregiver/CaregiverNav';

const emotionColors = {
  happy: 'bg-green-100 text-green-700 border-green-200',
  sad: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  pain_suspected: 'bg-red-100 text-red-700 border-red-200',
  anxious: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const emotionLabels = {
  happy: '😊 Happy',
  sad: '😢 Sad',
  neutral: '😐 Neutral',
  pain_suspected: '⚠️ Pain Suspected',
  anxious: '😟 Anxious',
};

export default function CaregiverLogs() {
  const { conversations, elderlyProfile } = useApp();

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
          <div className="flex flex-wrap gap-2">
            {Object.entries(emotionLabels).slice(0, 3).map(([key, label]) => {
              const count = conversations.filter(c => c.emotionTag === key).length;
              return (
                <span
                  key={key}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border ${emotionColors[key as keyof typeof emotionColors]}`}
                >
                  {label} ({count})
                </span>
              );
            })}
          </div>
        </motion.div>

        {/* Conversation Timeline */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-lg">Conversation History</h3>
          
          {conversations.map((message, index) => (
            <motion.div
              key={message.id}
              className={`bg-card rounded-2xl p-4 shadow-card ${
                message.role === 'user' ? 'ml-4' : 'mr-4'
              }`}
              initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-muted-foreground">
                  {message.role === 'puppy' ? '🐕 Buddy (AI)' : `👤 ${elderlyProfile.name}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <p className="text-foreground mb-3">{message.content}</p>
              
              {message.emotionTag && (
                <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium border ${emotionColors[message.emotionTag]}`}>
                  {emotionLabels[message.emotionTag]}
                </span>
              )}
            </motion.div>
          ))}
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
            Based on today's conversations, {elderlyProfile.name} appears to be in good spirits. 
            They mentioned having a nice breakfast, which is a positive indicator for their daily routine.
          </p>
        </motion.div>
      </div>

      <CaregiverNav />
    </div>
  );
}
