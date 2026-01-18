import { motion } from 'framer-motion';
import puppyHappy from '@/assets/puppy-happy.png';
import puppySleepy from '@/assets/puppy-sleepy.png';

interface PuppyCharacterProps {
  mood: 'happy' | 'sleepy' | 'excited';
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function PuppyCharacter({ mood, onClick, size = 'large' }: PuppyCharacterProps) {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-56 h-56',
  };

  const imageSrc = mood === 'sleepy' ? puppySleepy : puppyHappy;

  return (
    <motion.div
      className={`${sizeClasses[size]} relative cursor-pointer`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={
        mood === 'excited' 
          ? { y: [0, -15, 0], rotate: [-3, 3, -3] }
          : mood === 'happy'
          ? { y: [0, -8, 0] }
          : { rotate: [0, -2, 0, 2, 0] }
      }
      transition={{
        duration: mood === 'excited' ? 0.5 : 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.img
        src={imageSrc}
        alt="Puppy companion"
        className="w-full h-full object-contain drop-shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
      />
      
      {/* Speech bubble hint */}
      {onClick && (
        <motion.div
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-lg"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💬
        </motion.div>
      )}
    </motion.div>
  );
}
