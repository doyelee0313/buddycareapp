import { motion } from 'framer-motion';
import puppy3dSleepy from '@/assets/puppy-3d-sleepy.png';
import puppy3dAwake from '@/assets/puppy-3d-awake.png';
import puppy3dSmiling from '@/assets/puppy-3d-smiling.png';
import puppy3dExcited from '@/assets/puppy-3d-excited.png';
import puppy3dLove from '@/assets/puppy-3d-love.png';

interface PuppyCharacterProps {
  mood: 'sleeping' | 'awake' | 'smiling' | 'excited' | 'love';
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
      case 'sleeping':
        return puppy3dSleepy;
      case 'awake':
        return puppy3dAwake;
      case 'smiling':
        return puppy3dSmiling;
      case 'excited':
        return puppy3dExcited;
      case 'love':
        return puppy3dLove;
      default:
        return puppy3dAwake;
    }
  };

  const getAnimation = () => {
    switch (mood) {
      case 'sleeping':
        return { rotate: [0, -3, 0, 3, 0], scale: [1, 1.02, 1] };
      case 'awake':
        return { y: [0, -5, 0] };
      case 'smiling':
        return { y: [0, -10, 0], rotate: [-2, 2, -2] };
      case 'excited':
        return { y: [0, -20, 0], rotate: [-5, 5, -5] };
      case 'love':
        return { y: [0, -15, 0], scale: [1, 1.05, 1] };
      default:
        return { y: [0, -5, 0] };
    }
  };

  const getDuration = () => {
    switch (mood) {
      case 'sleeping':
        return 3;
      case 'excited':
        return 0.6;
      case 'love':
        return 1;
      default:
        return 2;
    }
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative cursor-pointer`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={getAnimation()}
      transition={{
        duration: getDuration(),
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Subtle shadow underneath */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/10 rounded-full blur-md"
        animate={
          mood === 'excited' || mood === 'love'
            ? { scale: [1, 0.8, 1], opacity: [0.3, 0.5, 0.3] }
            : { scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }
        }
        transition={{
          duration: getDuration(),
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
      
      {/* Hearts for love mood */}
      {mood === 'love' && (
        <>
          <motion.span
            className="absolute -top-4 right-4 text-3xl"
            animate={{ y: [0, -20, 0], opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          >
            ❤️
          </motion.span>
          <motion.span
            className="absolute -top-2 left-4 text-2xl"
            animate={{ y: [0, -25, 0], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            💕
          </motion.span>
          <motion.span
            className="absolute top-0 right-0 text-xl"
            animate={{ y: [0, -15, 0], opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            💖
          </motion.span>
        </>
      )}

      {/* Z's for sleeping */}
      {mood === 'sleeping' && (
        <>
          <motion.span
            className="absolute -top-2 right-2 text-2xl text-muted-foreground/60"
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          >
            💤
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
