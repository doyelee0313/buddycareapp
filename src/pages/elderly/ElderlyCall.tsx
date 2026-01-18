import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Phone, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

export default function ElderlyCall() {
  const navigate = useNavigate();
  const { caregiverProfile } = useApp();
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState<'video' | 'voice' | null>(null);

  const startCall = (type: 'video' | 'voice') => {
    setCallType(type);
    setIsCalling(true);
  };

  const endCall = () => {
    setIsCalling(false);
    setCallType(null);
  };

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <motion.header 
        className="flex items-center gap-4 p-4"
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
        <h1 className="text-elderly-xl">Contact</h1>
      </motion.header>

      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* Caregiver Info */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div 
            className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-6xl mb-6 mx-auto"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            👩‍⚕️
          </motion.div>
          <h2 className="text-elderly-2xl text-foreground mb-2">{caregiverProfile.name}</h2>
          <p className="text-elderly-base text-muted-foreground">Your Caregiver</p>
        </motion.div>

        {/* Call Buttons */}
        <motion.div 
          className="w-full max-w-sm space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Video Call Button */}
          <motion.button
            className="w-full py-6 px-8 rounded-3xl bg-gradient-to-r from-primary to-[hsl(30,90%,55%)] text-primary-foreground flex items-center justify-center gap-4 shadow-button"
            onClick={() => startCall('video')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Video className="w-10 h-10" />
            <span className="text-elderly-xl">Video Call</span>
          </motion.button>

          {/* Voice Call Button */}
          <motion.button
            className="w-full py-6 px-8 rounded-3xl bg-gradient-to-r from-secondary to-[hsl(140,40%,75%)] text-secondary-foreground flex items-center justify-center gap-4 shadow-soft"
            onClick={() => startCall('voice')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Phone className="w-10 h-10" />
            <span className="text-elderly-xl">Voice Call</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Call Screen Overlay */}
      <AnimatePresence>
        {isCalling && (
          <motion.div
            className="fixed inset-0 z-50 bg-gradient-to-b from-primary to-[hsl(20,70%,40%)] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Calling indicator */}
            <motion.div
              className="text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.div 
                className="w-40 h-40 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-7xl mb-8 mx-auto"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                👩‍⚕️
              </motion.div>
              
              <h2 className="text-elderly-2xl text-white mb-2">{caregiverProfile.name}</h2>
              
              <motion.p 
                className="text-elderly-lg text-white/80"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {callType === 'video' ? 'Video calling...' : 'Calling...'}
              </motion.p>

              {/* Ripple effect */}
              <div className="relative mt-8">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 mx-auto w-40 h-40 rounded-full border-4 border-white/30"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* End Call Button */}
            <motion.button
              className="absolute bottom-20 w-20 h-20 rounded-full bg-destructive flex items-center justify-center"
              onClick={endCall}
              whileTap={{ scale: 0.9 }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <X className="w-10 h-10 text-white" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
