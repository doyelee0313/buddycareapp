import { motion } from 'framer-motion';

interface UserGreetingProps {
  name: string;
}

export function UserGreeting({ name }: UserGreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-muted-foreground text-elderly-sm">
        {getGreeting()},
      </p>
      <h1 className="text-elderly-xl text-foreground">
        {name} 👋
      </h1>
    </motion.div>
  );
}
