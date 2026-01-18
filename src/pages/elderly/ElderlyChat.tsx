import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowLeft, Send, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { supabase } from '@/integrations/supabase/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import puppy3dFace from '@/assets/puppy-3d-face.png';
import { ConversationMessage } from '@/types/app';
import { toast } from 'sonner';

function ElderlyChatContent() {
  const navigate = useNavigate();
  const { conversations, addConversation, elderlyProfile } = useApp();
  const { user } = useAuth();
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
  } = useSpeechRecognition();

  const {
    isSpeaking,
    isSupported: ttsSupported,
    speak,
    stop: stopSpeaking,
    error: ttsError,
  } = useTextToSpeech();

  // Sync speech transcript to input
  useEffect(() => {
    if (transcript) {
      setCurrentTranscript(transcript);
    }
  }, [transcript]);

  // Show speech errors
  useEffect(() => {
    if (speechError) {
      toast.error(speechError);
    }
  }, [speechError]);

  // Show TTS errors
  useEffect(() => {
    if (ttsError) {
      toast.error(ttsError);
    }
  }, [ttsError]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      // Auto-send if there's content
      if (currentTranscript.trim()) {
        handleSendMessage();
      }
    } else {
      resetTranscript();
      setCurrentTranscript('');
      startListening();
    }
  };

  const handleSendMessage = async () => {
    const message = currentTranscript.trim();
    if (!message || isLoading) return;

    setIsLoading(true);
    setCurrentTranscript('');
    resetTranscript();

    // Add user message immediately
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      emotionTag: 'neutral',
    };
    addConversation(userMessage);

    try {
      // Call AI edge function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message, 
          userId: user?.id || elderlyProfile.id 
        },
      });

      if (error) {
        throw error;
      }

      // Update user message with detected emotion
      if (data?.emotionTag) {
        userMessage.emotionTag = data.emotionTag;
      }

      // Add puppy response
      const puppyResponse = data?.response || "Woof! I'm here for you! 🐕";
      const puppyMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'puppy',
        content: puppyResponse,
        timestamp: new Date(),
      };
      addConversation(puppyMessage);

      // Speak the response if TTS is enabled
      if (ttsEnabled && ttsSupported) {
        // Remove emojis for cleaner speech
        const cleanText = puppyResponse.replace(/[\u{1F600}-\u{1F6FF}|\u{1F900}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '').trim();
        speak(cleanText);
      }
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Could not send message. Please try again.');
      
      // Fallback response
      const fallbackMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'puppy',
        content: "Woof! I didn't quite catch that. Could you say that again? 🐕",
        timestamp: new Date(),
      };
      addConversation(fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTranscript(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-top safe-area-bottom">
      {/* Header */}
      <motion.header 
        className="flex items-center gap-4 p-4 bg-card border-b border-border"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
      >
        <motion.button
          className="p-3 rounded-2xl bg-muted"
          onClick={() => navigate('/elderly')}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <motion.img 
          src={puppy3dFace} 
          alt="Buddy" 
          className="w-14 h-14 rounded-full object-cover"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="flex-1">
          <h1 className="text-elderly-lg">Buddy</h1>
          <p className="text-muted-foreground">Your AI companion</p>
        </div>
        
        {/* TTS Toggle */}
        {ttsSupported && (
          <motion.button
            className={`p-3 rounded-2xl ${ttsEnabled ? 'bg-primary text-white' : 'bg-muted'}`}
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setTtsEnabled(!ttsEnabled);
            }}
            whileTap={{ scale: 0.9 }}
            title={ttsEnabled ? 'Mute Buddy' : 'Unmute Buddy'}
          >
            {ttsEnabled ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </motion.button>
        )}
      </motion.header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {conversations.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-puppy'}>
                <p className="text-elderly-base">{message.content}</p>
                <p className="text-sm opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="chat-bubble-puppy">
                <motion.div 
                  className="flex gap-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="w-3 h-3 bg-primary rounded-full" />
                  <span className="w-3 h-3 bg-primary rounded-full" />
                  <span className="w-3 h-3 bg-primary rounded-full" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <motion.div 
        className="p-4 bg-card border-t border-border"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        {/* Listening visualizer */}
        {isListening && (
          <motion.div 
            className="flex items-center justify-center gap-1 mb-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-destructive rounded-full"
                animate={{ height: ['8px', '24px', '8px'] }}
                transition={{ 
                  duration: 0.5, 
                  repeat: Infinity, 
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
            <span className="ml-3 text-destructive font-medium">Listening...</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={currentTranscript}
            onChange={handleTextInput}
            placeholder={isListening ? "Speak now..." : "Type or tap mic to speak..."}
            className="flex-1 bg-muted rounded-2xl px-5 py-4 text-elderly-base outline-none focus:ring-2 focus:ring-primary"
            disabled={isListening}
          />
          
          {/* Send button */}
          {currentTranscript.trim() && !isListening && (
            <motion.button
              type="submit"
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              disabled={isLoading}
            >
              <Send className="w-6 h-6 text-white" />
            </motion.button>
          )}
          
          {/* Mic button */}
          <motion.button
            type="button"
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isListening 
                ? 'bg-destructive' 
                : 'bg-primary'
            }`}
            onClick={handleMicClick}
            whileTap={{ scale: 0.9 }}
            animate={isListening ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
            disabled={!isSupported}
          >
            {isListening ? (
              <MicOff className="w-7 h-7 text-white" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}
          </motion.button>
        </form>

        <p className="text-center text-muted-foreground mt-3 text-elderly-sm">
          {!isSupported 
            ? "Voice input not supported in this browser" 
            : isListening 
            ? "Tap again when done speaking" 
            : "Tap the microphone to speak"}
        </p>
      </motion.div>
    </div>
  );
}

export default function ElderlyChat() {
  return (
    <ProtectedRoute requiredUserType="elderly">
      <ElderlyChatContent />
    </ProtectedRoute>
  );
}
