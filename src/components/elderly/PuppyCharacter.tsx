import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Puppy3DModel } from './Puppy3DModel';

interface PuppyCharacterProps {
  mood: 'sleeping' | 'awake' | 'smiling' | 'excited' | 'love';
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

function LoadingFallback({ size }: { size: string }) {
  const sizeClasses: Record<string, string> = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-64 h-64',
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      <motion.div
        className="w-16 h-16 rounded-full bg-primary/20"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}

export function PuppyCharacter({ mood, onClick, size = 'large' }: PuppyCharacterProps) {
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-72 h-72',
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative cursor-pointer`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Suspense fallback={<LoadingFallback size={size} />}>
        <Puppy3DModel mood={mood} />
      </Suspense>
      
      {/* Speech bubble hint */}
      {onClick && (
        <motion.div
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg z-10"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💬
        </motion.div>
      )}
    </motion.div>
  );
}
