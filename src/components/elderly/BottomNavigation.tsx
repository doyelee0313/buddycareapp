import { motion } from 'framer-motion';
import { Home, MessageCircle, Phone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/elderly', icon: Home, label: 'Home' },
  { path: '/elderly/chat', icon: MessageCircle, label: 'Talk' },
  { path: '/elderly/call', icon: Phone, label: 'Call' },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-30"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl min-w-[80px] transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.9 }}
            >
              <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-sm font-semibold">{item.label}</span>
              
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
