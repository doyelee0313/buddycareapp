import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Mission } from '@/types/app';

interface MissionButtonProps {
  mission: Mission;
  onClick: () => void;
}

const missionStyles = {
  medicine: 'mission-medicine',
  meal: 'mission-meal',
  exercise: 'mission-exercise',
  mood: 'mission-mood',
};

export function MissionButton({ mission, onClick }: MissionButtonProps) {
  return (
    <motion.button
      className={`mission-button-uniform ${missionStyles[mission.type]} relative overflow-hidden`}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Completed overlay */}
      {mission.completed && (
        <motion.div
          className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-full p-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
          </motion.div>
        </motion.div>
      )}

      {/* Icon */}
      <span className="text-5xl" role="img" aria-label={mission.title}>
        {mission.icon}
      </span>
      
      {/* Title */}
      <span className="text-elderly-base font-bold text-center leading-tight mt-2">
        {mission.title}
      </span>

      {/* Time if available */}
      {mission.time && (
        <span className="text-base opacity-80 font-medium">
          {mission.time}
        </span>
      )}
    </motion.button>
  );
}
