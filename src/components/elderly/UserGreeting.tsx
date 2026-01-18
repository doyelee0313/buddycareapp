import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface UserGreetingProps {
  name: string;
  avatar?: string;
}

export function UserGreeting({ name, avatar }: UserGreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div 
      className="flex items-center gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Avatar */}
      <motion.div 
        className="w-16 h-16 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center overflow-hidden"
        whileHover={{ scale: 1.05 }}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-8 h-8 text-primary" />
        )}
      </motion.div>

      {/* Greeting text */}
      <div>
        <p className="text-muted-foreground text-elderly-sm">
          {getGreeting()},
        </p>
        <h1 className="text-elderly-xl text-foreground">
          {name} 👋
        </h1>
      </div>
    </motion.div>
  );
}
