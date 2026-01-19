import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  user_type: 'elderly' | 'caregiver';
  pin_code?: string;
  caregiver_id?: string;
  linked_caregiver_id?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, userType: 'elderly' | 'caregiver', pinCode?: string, caregiverId?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithPin: (name: string, pin: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    userType: 'elderly' | 'caregiver',
    pinCode?: string,
    caregiverCode?: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });

    if (error) return { error };

    // Create profile after signup
    if (data.user) {
      let linkedCaregiverId: string | null = null;
      
      // For elderly users, look up the caregiver by their code
      if (userType === 'elderly' && caregiverCode) {
        const { data: caregiverProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('caregiver_id', caregiverCode.toUpperCase())
          .eq('user_type', 'caregiver')
          .single();
        
        if (caregiverProfile) {
          linkedCaregiverId = caregiverProfile.user_id;
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          display_name: displayName,
          user_type: userType,
          pin_code: pinCode,
          caregiver_id: userType === 'caregiver' ? caregiverCode : null,
          linked_caregiver_id: linkedCaregiverId,
        });

      if (profileError) {
        return { error: profileError as unknown as Error };
      }
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithPin = async (name: string, pin: string) => {
    // For elderly users, we search by display_name and pin_code
    // Pad PIN to meet Supabase's 6-character minimum password requirement
    const elderlyEmail = `${name.toLowerCase().replace(/\s+/g, '_')}@elderly.buddycare.app`;
    const paddedPin = `pin_${pin}`;
    
    const { error } = await supabase.auth.signInWithPassword({
      email: elderlyEmail,
      password: paddedPin,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signInWithPin,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
