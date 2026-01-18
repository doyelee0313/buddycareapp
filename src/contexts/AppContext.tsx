import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserType, UserProfile, CaregiverProfile, Mission, ConversationMessage, HeartNotification } from '@/types/app';

interface AppContextType {
  userType: UserType | null;
  setUserType: (type: UserType | null) => void;
  elderlyProfile: UserProfile;
  updateElderlyProfile: (profile: Partial<UserProfile>) => void;
  caregiverProfile: CaregiverProfile;
  completeMission: (missionId: string) => void;
  conversations: ConversationMessage[];
  addConversation: (message: ConversationMessage) => void;
  heartNotifications: HeartNotification[];
  sendHeart: () => void;
  updateMission: (mission: Mission) => void;
}

const defaultMissions: Mission[] = [
  { id: '1', type: 'medicine', title: 'Take Medicine', icon: '💊', completed: false, time: '9:00 AM' },
  { id: '2', type: 'meal', title: 'Meal Completed', icon: '🍽', completed: false },
  { id: '3', type: 'exercise', title: 'Exercise', icon: '🤸', completed: false },
  { id: '4', type: 'mood', title: 'Mood Check', icon: '😊', completed: false },
];

const defaultElderlyProfile: UserProfile = {
  id: '1',
  name: 'Grandma Rose',
  stepCount: 3250,
  stepGoal: 8000,
  missions: defaultMissions,
};

const defaultCaregiverProfile: CaregiverProfile = {
  id: '2',
  name: 'Sarah',
};

const defaultConversations: ConversationMessage[] = [
  {
    id: '1',
    role: 'puppy',
    content: 'Good morning! How are you feeling today?',
    timestamp: new Date(Date.now() - 3600000),
    emotionTag: 'neutral',
  },
  {
    id: '2',
    role: 'user',
    content: 'I feel pretty good today! Had a nice breakfast.',
    timestamp: new Date(Date.now() - 3500000),
    emotionTag: 'happy',
  },
  {
    id: '3',
    role: 'puppy',
    content: 'That\'s wonderful to hear! What did you have for breakfast?',
    timestamp: new Date(Date.now() - 3400000),
    emotionTag: 'happy',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [elderlyProfile, setElderlyProfile] = useState<UserProfile>(defaultElderlyProfile);
  const [caregiverProfile] = useState<CaregiverProfile>(defaultCaregiverProfile);
  const [conversations, setConversations] = useState<ConversationMessage[]>(defaultConversations);
  const [heartNotifications, setHeartNotifications] = useState<HeartNotification[]>([
    { id: '1', from: 'Grandma Rose', timestamp: new Date(), count: 5 },
  ]);

  const updateElderlyProfile = (profile: Partial<UserProfile>) => {
    setElderlyProfile(prev => ({ ...prev, ...profile }));
  };

  const completeMission = (missionId: string) => {
    setElderlyProfile(prev => ({
      ...prev,
      missions: prev.missions.map(m => 
        m.id === missionId ? { ...m, completed: !m.completed } : m
      ),
    }));
  };

  const addConversation = (message: ConversationMessage) => {
    setConversations(prev => [...prev, message]);
  };

  const sendHeart = () => {
    setHeartNotifications(prev => {
      const existing = prev.find(n => n.from === elderlyProfile.name);
      if (existing) {
        return prev.map(n => 
          n.from === elderlyProfile.name 
            ? { ...n, count: n.count + 1, timestamp: new Date() }
            : n
        );
      }
      return [...prev, { id: Date.now().toString(), from: elderlyProfile.name, timestamp: new Date(), count: 1 }];
    });
  };

  const updateMission = (mission: Mission) => {
    setElderlyProfile(prev => ({
      ...prev,
      missions: prev.missions.map(m => m.id === mission.id ? mission : m),
    }));
  };

  return (
    <AppContext.Provider value={{
      userType,
      setUserType,
      elderlyProfile,
      updateElderlyProfile,
      caregiverProfile,
      completeMission,
      conversations,
      addConversation,
      heartNotifications,
      sendHeart,
      updateMission,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
