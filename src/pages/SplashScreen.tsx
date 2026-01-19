import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import puppyMain from '@/assets/puppy-3d-main.png';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { setUserType } = useApp();

  const handleSelectUser = (type: 'elderly' | 'caregiver') => {
    setUserType(type);
    navigate(type === 'elderly' ? '/elderly' : '/caregiver');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-[hsl(35,60%,95%)] flex flex-col items-center justify-center p-6">
      {/* Logo & Title */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.img
          src={puppyMain}
          alt="PuppyCare Logo"
          className="w-40 h-40 mx-auto mb-6 drop-shadow-lg"
          animate={{ 
            y: [0, -10, 0],
            rotate: [-2, 2, -2]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <h1 className="text-4xl font-extrabold text-foreground mb-2">
          BuddyCare
        </h1>
        <p className="text-xl text-muted-foreground">
          Your AI Companion for Care
        </p>
      </motion.div>

      {/* User Type Selection */}
      <motion.div
        className="w-full max-w-sm space-y-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <p className="text-center text-muted-foreground mb-6 text-lg">
          Who are you?
        </p>

        {/* Elderly User Button */}
        <motion.button
          className="w-full bg-gradient-to-r from-primary to-[hsl(30,90%,55%)] text-primary-foreground py-6 px-8 rounded-3xl shadow-button flex items-center justify-center gap-4 text-xl font-bold"
          onClick={() => handleSelectUser('elderly')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-3xl">👴</span>
          <span>I'm a User</span>
        </motion.button>

        {/* Caregiver Button */}
        <motion.button
          className="w-full bg-gradient-to-r from-caregiver-primary to-blue-500 text-white py-6 px-8 rounded-3xl shadow-lg flex items-center justify-center gap-4 text-xl font-bold"
          onClick={() => handleSelectUser('caregiver')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-3xl">👩‍⚕️</span>
          <span>I'm a Caregiver</span>
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.p
        className="absolute bottom-8 text-muted-foreground text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Made with ❤️ for better care
      </motion.p>
    </div>
  );
}
