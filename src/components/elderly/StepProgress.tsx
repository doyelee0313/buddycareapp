import { motion } from 'framer-motion';
import { Footprints } from 'lucide-react';

interface StepProgressProps {
  current: number;
  goal: number;
}

export function StepProgress({ current, goal }: StepProgressProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const remaining = Math.max(goal - current, 0);

  return (
    <motion.div 
      className="bg-card rounded-4xl p-6 shadow-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          className="bg-step-progress/20 p-3 rounded-2xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          <Footprints className="w-8 h-8 text-step-progress" />
        </motion.div>
        <div>
          <p className="text-elderly-lg text-foreground">
            {current.toLocaleString()} steps
          </p>
          <p className="text-elderly-sm text-muted-foreground">
            {remaining.toLocaleString()} steps to goal
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="step-progress-bar overflow-hidden">
        <motion.div
          className="step-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Goal indicator */}
      <div className="flex justify-between mt-2 text-muted-foreground">
        <span className="text-lg">0</span>
        <span className="text-lg font-semibold">{goal.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}
