import { motion } from 'framer-motion';
import { Heart, Activity, Check, AlertCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { CaregiverNav } from '@/components/caregiver/CaregiverNav';
import puppyHappy from '@/assets/puppy-happy.png';
import puppySleepy from '@/assets/puppy-sleepy.png';

export default function CaregiverDashboard() {
  const { elderlyProfile, heartNotifications } = useApp();
  
  const completedMissions = elderlyProfile.missions.filter(m => m.completed).length;
  const totalMissions = elderlyProfile.missions.length;
  const stepPercentage = Math.round((elderlyProfile.stepCount / elderlyProfile.stepGoal) * 100);
  
  const getPuppyStatus = () => {
    if (completedMissions === 0) return { text: 'Puppy is hungry', status: 'warning', image: puppySleepy };
    if (completedMissions < 3) return { text: 'Puppy needs attention', status: 'warning', image: puppyHappy };
    return { text: 'Puppy is happy!', status: 'good', image: puppyHappy };
  };

  const puppyStatus = getPuppyStatus();
  const totalHearts = heartNotifications.reduce((sum, n) => sum + n.count, 0);

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-top">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Care Monitor</h1>
          <p className="text-muted-foreground">Monitoring {elderlyProfile.name}</p>
        </motion.div>

        {/* Puppy Status Card */}
        <motion.div 
          className="bg-card rounded-3xl p-6 shadow-card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <motion.img 
              src={puppyStatus.image}
              alt="Puppy status"
              className="w-20 h-20 object-contain"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">{elderlyProfile.name}'s Buddy</h2>
              <span className={`${puppyStatus.status === 'good' ? 'status-badge-good' : 'status-badge-warning'}`}>
                {puppyStatus.text}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Missions Card */}
          <motion.div 
            className="bg-card rounded-3xl p-5 shadow-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-status-good/20 p-2 rounded-xl">
                <Check className="w-5 h-5 text-status-good" />
              </div>
              <span className="font-semibold text-muted-foreground">Missions</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{completedMissions}/{totalMissions}</p>
            <p className="text-sm text-muted-foreground">completed today</p>
          </motion.div>

          {/* Steps Card */}
          <motion.div 
            className="bg-card rounded-3xl p-5 shadow-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-step-progress/20 p-2 rounded-xl">
                <Activity className="w-5 h-5 text-step-progress" />
              </div>
              <span className="font-semibold text-muted-foreground">Steps</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stepPercentage}%</p>
            <p className="text-sm text-muted-foreground">{elderlyProfile.stepCount.toLocaleString()} steps</p>
          </motion.div>
        </div>

        {/* Heart Notifications */}
        <motion.div 
          className="bg-gradient-to-r from-[hsl(350,85%,60%)] to-[hsl(350,75%,50%)] rounded-3xl p-6 text-white shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-12 h-12 fill-current" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold">You received {totalHearts} hearts!</h3>
              <p className="opacity-90">from {elderlyProfile.name}</p>
            </div>
          </div>
        </motion.div>

        {/* Mission Status List */}
        <motion.div 
          className="bg-card rounded-3xl p-5 shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-bold text-lg mb-4">Today's Missions</h3>
          <div className="space-y-3">
            {elderlyProfile.missions.map((mission, index) => (
              <motion.div 
                key={mission.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mission.icon}</span>
                  <span className="font-medium">{mission.title}</span>
                </div>
                {mission.completed ? (
                  <span className="bg-status-good text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Done
                  </span>
                ) : (
                  <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    Pending
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <CaregiverNav />
    </div>
  );
}
