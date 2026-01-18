import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface HeartButtonProps {
  onSend: () => void;
  caregiverName: string;
}

interface FloatingHeart {
  id: number;
  x: number;
  delay: number;
}

export function HeartButton({ onSend, caregiverName }: HeartButtonProps) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleClick = () => {
    // Create floating hearts
    const newHearts: FloatingHeart[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 200 - 100,
      delay: Math.random() * 0.3,
    }));
    
    setHearts(prev => [...prev, ...newHearts]);
    setShowOverlay(true);
    onSend();

    // Clean up
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 2000);

    setTimeout(() => setShowOverlay(false), 1500);
  };

  return (
    <>
      {/* Full screen overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-elderly-xl text-white text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                className="text-7xl mb-4"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5 }}
              >
                ❤️
              </motion.div>
              <p className="drop-shadow-lg">Sent to {caregiverName}!</p>
            </motion.div>

            {/* Floating hearts */}
            {hearts.map(heart => (
              <motion.div
                key={heart.id}
                className="absolute text-5xl"
                initial={{ 
                  y: 0, 
                  x: heart.x,
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  y: -300, 
                  scale: [0, 1.5, 1],
                  opacity: [1, 1, 0] 
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: heart.delay,
                  ease: 'easeOut' 
                }}
              >
                ❤️
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button with explanation */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
        {/* Explanation text */}
        <motion.div
          className="bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg max-w-[180px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm font-medium text-foreground leading-tight">
            Tap to send love to {caregiverName} 💕
          </p>
        </motion.div>

        {/* Heart button */}
        <motion.button
          className="heart-button w-18 h-18 flex items-center justify-center"
          onClick={handleClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: '72px', height: '72px' }}
        >
          <Heart className="w-9 h-9 fill-current" />
        </motion.button>
      </div>
    </>
  );
}
