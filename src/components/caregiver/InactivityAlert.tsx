import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

interface InactivityAlertProps {
  stepCount: number;
}

export function InactivityAlert({ stepCount }: InactivityAlertProps) {
  const { user } = useAuth();
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [linkedElderlyName, setLinkedElderlyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLastActivity();
    }
  }, [user]);

  const fetchLastActivity = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, last_activity_at')
        .eq('linked_caregiver_id', user.id)
        .maybeSingle();

      if (data) {
        setLinkedElderlyName(data.display_name);
        setLastActivity(data.last_activity_at ? new Date(data.last_activity_at) : null);
      }
    } catch (err) {
      console.error('Error fetching last activity:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if inactive for 24 hours
  const isInactive = () => {
    if (!lastActivity) return true; // No activity recorded
    const now = new Date();
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity >= 24;
  };

  // Check if step count is zero
  const hasNoSteps = stepCount === 0;

  const showAlert = !loading && (isInactive() || hasNoSteps);

  const getAlertMessage = () => {
    const name = linkedElderlyName || 'Patient';
    if (isInactive() && hasNoSteps) {
      return `⚠️ ${name} hasn't opened the app in 24+ hours and has 0 steps today!`;
    }
    if (isInactive()) {
      return `⚠️ ${name} hasn't opened the app in over 24 hours!`;
    }
    if (hasNoSteps) {
      return `⚠️ ${name} has 0 steps recorded today. Consider checking in.`;
    }
    return '';
  };

  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-4 shadow-lg mb-4"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center gap-3 text-white">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <AlertTriangle className="w-8 h-8" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Inactivity Alert</h3>
              <p className="text-sm opacity-95">{getAlertMessage()}</p>
            </div>
            <Activity className="w-6 h-6 opacity-60" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
