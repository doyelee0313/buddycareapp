import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserGreeting } from '@/components/elderly/UserGreeting';
import { PuppyCharacter } from '@/components/elderly/PuppyCharacter';
import { MissionButton } from '@/components/elderly/MissionButton';
import { MissionCompletionModal } from '@/components/elderly/MissionCompletionModal';
import { StepProgress } from '@/components/elderly/StepProgress';
import { HeartButton } from '@/components/elderly/HeartButton';
import { BottomNavigation } from '@/components/elderly/BottomNavigation';
import { ElderlySettingsSheet } from '@/components/elderly/ElderlySettingsSheet';
import { supabase } from '@/integrations/supabase/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Mission } from '@/types/app';

function ElderlyHomeContent() {
  const navigate = useNavigate();
  const { elderlyProfile, caregiverProfile, completeMission, sendHeart } = useApp();
  const { profile, user } = useAuth();
  const [linkedCaregiverName, setLinkedCaregiverName] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [completedMissionTypes, setCompletedMissionTypes] = useState<Set<string>>(new Set());
  
  // Use auth profile name if available
  const displayName = profile?.display_name || elderlyProfile.name;
  const caregiverName = linkedCaregiverName || caregiverProfile.name;

  // Update last activity and fetch linked caregiver
  useEffect(() => {
    const updateActivityAndFetchCaregiver = async () => {
      if (!user) return;
      
      // Update last activity timestamp
      await supabase
        .from('profiles')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('user_id', user.id);
      
      // Fetch linked caregiver
      if (profile?.linked_caregiver_id) {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', profile.linked_caregiver_id)
          .maybeSingle();
        
        if (data) {
          setLinkedCaregiverName(data.display_name);
        }
      }
    };

    updateActivityAndFetchCaregiver();
  }, [user, profile?.linked_caregiver_id]);

  // Fetch today's completed missions
  useEffect(() => {
    const fetchCompletedMissions = async () => {
      if (!user) return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data } = await supabase
        .from('mission_completions')
        .select('mission_type')
        .eq('user_id', user.id)
        .gte('completed_at', today.toISOString());
      
      if (data) {
        setCompletedMissionTypes(new Set(data.map(m => m.mission_type)));
      }
    };

    fetchCompletedMissions();
  }, [user]);
  
  // Determine puppy mood based on missions completed
  const completedCount = completedMissionTypes.size;
  const getPuppyMood = (): 'sleeping' | 'awake' | 'smiling' | 'excited' | 'love' => {
    if (completedCount === 0) return 'sleeping';
    if (completedCount === 1) return 'awake';
    if (completedCount === 2) return 'smiling';
    if (completedCount === 3) return 'excited';
    return 'love'; // 4+ missions
  };

  const puppyMood = getPuppyMood();

  const getPuppyMessage = () => {
    switch (puppyMood) {
      case 'sleeping':
        return "I'm sleepy... Let's do some missions! 😴";
      case 'awake':
        return "I'm awake now! Keep going! 👀";
      case 'smiling':
        return "You're doing great! 😊";
      case 'excited':
        return "Wow! Amazing progress! 🎉";
      case 'love':
        return "I love you so much! You're the best! 💕";
    }
  };

  const handleMissionClick = (mission: Mission) => {
    if (completedMissionTypes.has(mission.type)) return;
    setSelectedMission(mission);
  };

  const handleMissionComplete = (missionId: string) => {
    const mission = elderlyProfile.missions.find(m => m.id === missionId);
    if (mission) {
      setCompletedMissionTypes(prev => new Set([...prev, mission.type]));
      completeMission(missionId);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-top">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header with Profile and Greeting */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <ElderlySettingsSheet />
            <div className="flex-1">
              <UserGreeting name={displayName} />
            </div>
          </div>
          {/* Caregiver Name - Top Right */}
          <motion.div 
            className="text-right"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-xs text-muted-foreground">Caregiver</p>
            <p className="text-sm font-semibold text-primary">{caregiverName}</p>
          </motion.div>
        </div>

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
            {getPuppyMessage()}
          </motion.p>
          
          <PuppyCharacter 
            mood={puppyMood} 
            onClick={() => navigate('/elderly/chat')}
            size="large"
          />
        </motion.div>

        {/* Mission Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {elderlyProfile.missions.map((mission, index) => {
            const isCompleted = completedMissionTypes.has(mission.type);
            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <MissionButton
                  mission={{ ...mission, completed: isCompleted }}
                  onClick={() => handleMissionClick(mission)}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Step Progress */}
        <StepProgress 
          current={elderlyProfile.stepCount} 
          goal={elderlyProfile.stepGoal} 
        />
      </div>

      {/* Mission Completion Modal */}
      <MissionCompletionModal
        mission={selectedMission}
        open={!!selectedMission}
        onClose={() => setSelectedMission(null)}
        onComplete={handleMissionComplete}
      />

      {/* Heart Button */}
      <HeartButton 
        onSend={sendHeart} 
        caregiverName={caregiverName} 
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
