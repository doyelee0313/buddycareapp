import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CaregiverAuthForm from '@/components/auth/CaregiverAuthForm';
import ElderlyAuthForm from '@/components/auth/ElderlyAuthForm';
import buddycareLogo from '@/assets/buddycare-logo.png';

type AuthMode = 'select' | 'elderly' | 'caregiver';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('select');
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.user_type === 'elderly') {
        navigate('/elderly');
      } else {
        navigate('/caregiver');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-[hsl(35,60%,95%)] flex items-center justify-center">
        <motion.img
          src={buddycareLogo}
          alt="Loading..."
          className="w-36 h-36 rounded-3xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-[hsl(35,60%,95%)] flex flex-col items-center justify-center p-6 safe-area-bottom">
      <AnimatePresence mode="wait">
        {mode === 'select' && (
          <motion.div
            key="select"
            className="w-full max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Logo & Title */}
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.img
                src={buddycareLogo}
                alt="BuddyCare Logo"
                className="w-44 h-44 mx-auto mb-4 drop-shadow-xl rounded-3xl"
                animate={{ 
                  y: [0, -8, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <p className="text-xl text-muted-foreground">
                Your AI Companion for Care
              </p>
            </motion.div>

            {/* Role Selection */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-center text-muted-foreground mb-6 text-lg font-medium">
                Who are you?
              </p>

              {/* Elderly User Button */}
              <motion.button
                className="w-full bg-gradient-to-r from-primary to-[hsl(30,90%,55%)] text-primary-foreground py-7 px-8 rounded-3xl shadow-lg flex items-center justify-center gap-4 text-2xl font-bold"
                onClick={() => setMode('elderly')}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 40px -10px hsl(var(--primary) / 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-4xl">👴</span>
                <span>I'm a User</span>
              </motion.button>

              {/* Caregiver Button */}
              <motion.button
                className="w-full bg-gradient-to-r from-caregiver-primary to-blue-500 text-white py-7 px-8 rounded-3xl shadow-lg flex items-center justify-center gap-4 text-2xl font-bold"
                onClick={() => setMode('caregiver')}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 40px -10px hsl(210 80% 50% / 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-4xl">👩‍⚕️</span>
                <span>I'm a Caregiver</span>
              </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.p
              className="text-center text-muted-foreground text-sm mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Made with ❤️ for better care
            </motion.p>
          </motion.div>
        )}

        {mode === 'elderly' && (
          <ElderlyAuthForm key="elderly" onBack={() => setMode('select')} />
        )}

        {mode === 'caregiver' && (
          <CaregiverAuthForm key="caregiver" onBack={() => setMode('select')} />
        )}
      </AnimatePresence>
    </div>
  );
}
