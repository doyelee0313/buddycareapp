import { motion } from 'framer-motion';
import puppy3dHappy from '@/assets/puppy-3d-happy.png';
import puppy3dSleepy from '@/assets/puppy-3d-sleepy.png';
import puppy3dExcited from '@/assets/puppy-3d-excited.png';

interface PuppyCharacterProps {
  mood: 'happy' | 'sleepy' | 'excited';
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function PuppyCharacter({ mood, onClick, size = 'large' }: PuppyCharacterProps) {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-64 h-64',
  };

  const getImageSrc = () => {
    switch (mood) {
      case 'excited':
        return puppy3dExcited;
      case 'sleepy':
        return puppy3dSleepy;
      default:
        return puppy3dHappy;
    }
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative cursor-pointer`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={
        mood === 'excited' 
          ? { y: [0, -20, 0], rotate: [-5, 5, -5] }
          : mood === 'happy'
          ? { y: [0, -10, 0] }
          : { rotate: [0, -3, 0, 3, 0] }
      }
      transition={{
        duration: mood === 'excited' ? 0.6 : 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Subtle shadow underneath */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/10 rounded-full blur-md"
        animate={
          mood === 'excited'
            ? { scale: [1, 0.8, 1], opacity: [0.3, 0.5, 0.3] }
            : { scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }
        }
        transition={{
          duration: mood === 'excited' ? 0.6 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.img
        src={getImageSrc()}
        alt="Buddy the puppy"
        className="w-full h-full object-contain drop-shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
      />
      
      {/* Sparkle effect for excited mood */}
      {mood === 'excited' && (
        <>
          <motion.span
            className="absolute -top-2 -right-2 text-2xl"
            animate={{ scale: [0, 1.2, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          >
            ✨
          </motion.span>
          <motion.span
            className="absolute -top-1 left-0 text-xl"
            animate={{ scale: [0, 1.2, 0], rotate: [0, -180, -360] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            ⭐
          </motion.span>
        </>
      )}
      
      {/* Speech bubble hint */}
      {onClick && (
        <motion.div
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💬
        </motion.div>
      )}
    </motion.div>
  );
}
