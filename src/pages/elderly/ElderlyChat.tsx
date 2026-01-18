import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import puppyFace from '@/assets/puppy-face.png';
import { ConversationMessage } from '@/types/app';

const puppyQuestions = [
  "What did you eat this morning?",
  "How are you feeling right now?",
  "Did you sleep well last night?",
  "Would you like to go for a walk today?",
  "Is there anything on your mind?",
  "What made you smile today?",
];

export default function ElderlyChat() {
  const navigate = useNavigate();
  const { conversations, addConversation, elderlyProfile } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleMicClick = () => {
    if (isListening) {
      // Stop listening and save the message
      setIsListening(false);
      if (currentTranscript.trim()) {
        const userMessage: ConversationMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: currentTranscript,
          timestamp: new Date(),
          emotionTag: 'neutral',
        };
        addConversation(userMessage);

        // Simulate puppy response after a delay
        setTimeout(() => {
          const randomQuestion = puppyQuestions[Math.floor(Math.random() * puppyQuestions.length)];
          const puppyMessage: ConversationMessage = {
            id: (Date.now() + 1).toString(),
            role: 'puppy',
            content: randomQuestion,
            timestamp: new Date(),
          };
          addConversation(puppyMessage);
        }, 1500);

        setCurrentTranscript('');
      }
    } else {
      // Start listening (simulated)
      setIsListening(true);
      // In production, this would use Web Speech API
      // For demo, we'll just simulate typing
    }
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTranscript(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTranscript.trim()) {
      handleMicClick();
    }
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
          src={puppyFace} 
          alt="Puppy" 
          className="w-12 h-12 rounded-full"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div>
          <h1 className="text-elderly-lg">Buddy</h1>
          <p className="text-muted-foreground">Your AI companion</p>
        </div>
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
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <motion.div 
        className="p-4 bg-card border-t border-border"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={currentTranscript}
            onChange={handleTextInput}
            placeholder={isListening ? "Listening..." : "Type or tap to speak..."}
            className="flex-1 bg-muted rounded-2xl px-5 py-4 text-elderly-base outline-none focus:ring-2 focus:ring-primary"
          />
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
          >
            {isListening ? (
              <MicOff className="w-7 h-7 text-white" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}
          </motion.button>
        </form>

        <p className="text-center text-muted-foreground mt-3 text-elderly-sm">
          {isListening ? "Tap again when done speaking" : "Tap the microphone to speak"}
        </p>
      </motion.div>
    </div>
  );
}
