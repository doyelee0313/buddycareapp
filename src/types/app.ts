export type UserType = 'elderly' | 'caregiver';

export interface Mission {
  id: string;
  type: 'medicine' | 'meal' | 'exercise' | 'mood';
  title: string;
  icon: string;
  completed: boolean;
  time?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  stepCount: number;
  stepGoal: number;
  missions: Mission[];
}

export interface CaregiverProfile {
  id: string;
  name: string;
  avatar?: string;
}

export interface ConversationMessage {
  id: string;
  role: 'puppy' | 'user';
  content: string;
  timestamp: Date;
  emotionTag?: 'happy' | 'sad' | 'neutral' | 'pain_suspected' | 'anxious';
}

export interface HeartNotification {
  id: string;
  from: string;
  timestamp: Date;
  count: number;
}
