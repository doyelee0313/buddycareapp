import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserGreeting } from '@/components/elderly/UserGreeting';
import { PuppyCharacter } from '@/components/elderly/PuppyCharacter';
import { MissionButton } from '@/components/elderly/MissionButton';
import { StepProgress } from '@/components/elderly/StepProgress';
import { HeartButton } from '@/components/elderly/HeartButton';
import { BottomNavigation } from '@/components/elderly/BottomNavigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ElderlyHomeContent() {
  const navigate = useNavigate();
  const { elderlyProfile, caregiverProfile, completeMission, sendHeart } = useApp();
  const { profile } = useAuth();
  
  // Use auth profile name if available
  const displayName = profile?.display_name || elderlyProfile.name;
  
  // Determine puppy mood based on missions completed
  const completedCount = elderlyProfile.missions.filter(m => m.completed).length;
  const puppyMood = completedCount >= 3 ? 'excited' : completedCount >= 1 ? 'happy' : 'sleepy';

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-top">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header with greeting */}
        <UserGreeting name={displayName} />

        {/* Puppy Section */}
        <motion.div 
          className="flex flex-col items-center my-8 bg-puppy-bg rounded-[3rem] py-8 px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.p 
            className="text-elderly-lg text-center text-muted-foreground mb-4"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {puppyMood === 'excited' 
              ? "I'm so happy! You're doing great! 🎉" 
              : puppyMood === 'happy'
              ? "Tap me to chat! 💬"
              : "Let's complete some missions! 🌟"}
          </motion.p>
          
          <PuppyCharacter 
            mood={puppyMood} 
            onClick={() => navigate('/elderly/chat')}
            size="large"
          />
        </motion.div>

        {/* Mission Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {elderlyProfile.missions.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <MissionButton
                mission={mission}
                onClick={() => completeMission(mission.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Step Progress */}
        <StepProgress 
          current={elderlyProfile.stepCount} 
          goal={elderlyProfile.stepGoal} 
        />
      </div>

      {/* Heart Button */}
      <HeartButton 
        onSend={sendHeart} 
        caregiverName={caregiverProfile.name} 
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export default function ElderlyHome() {
  return (
    <ProtectedRoute requiredUserType="elderly">
      <ElderlyHomeContent />
    </ProtectedRoute>
  );
}
