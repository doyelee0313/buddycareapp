import { motion } from 'framer-motion';
import { Home, Settings, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/caregiver', icon: Home, label: 'Dashboard' },
  { path: '/caregiver/missions', icon: Settings, label: 'Missions' },
  { path: '/caregiver/logs', icon: MessageSquare, label: 'Logs' },
];

export function CaregiverNav() {
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
                  ? 'text-caregiver-primary bg-caregiver-primary/10' 
                  : 'text-muted-foreground'
              }`}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.9 }}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-semibold">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
