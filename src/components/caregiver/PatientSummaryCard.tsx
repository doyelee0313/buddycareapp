import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Pill, AlertCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface PatientProfile {
  chronic_diseases: string[];
  current_medications: string[];
  allergies: string[];
  health_status_summary: string | null;
}

interface LinkedElderly {
  user_id: string;
  display_name: string;
}

export function PatientSummaryCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [linkedElderly, setLinkedElderly] = useState<LinkedElderly | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchPatientData();
    }
  }, [user]);

  const fetchPatientData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Fetch linked elderly profile
      const { data: elderlyData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('linked_caregiver_id', user.id)
        .maybeSingle();

      if (elderlyData) {
        setLinkedElderly(elderlyData);
        
        // Fetch patient profile
        const { data: profileData } = await supabase
          .from('patient_profiles' as any)
          .select('*')
          .eq('user_id', elderlyData.user_id)
          .maybeSingle();

        if (profileData) {
          setPatientProfile(profileData as unknown as PatientProfile);
        }
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="bg-card rounded-3xl p-5 shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-muted rounded-full" />
            <div className="h-6 w-24 bg-muted rounded-full" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!linkedElderly) {
    return (
      <motion.div
        className="bg-card rounded-3xl p-5 shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-muted p-3 rounded-xl">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-lg">No Patient Linked</h3>
            <p className="text-sm text-muted-foreground">Waiting for patient to connect</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const hasConditions = patientProfile?.chronic_diseases?.length;
  const hasMedications = patientProfile?.current_medications?.length;
  const hasAllergies = patientProfile?.allergies?.length;

  return (
    <motion.div
      className="bg-card rounded-3xl p-5 shadow-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-primary/20 p-2 rounded-xl">
          <User className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-bold text-lg">{linkedElderly.display_name}'s Health Summary</h3>
      </div>

      {/* Medical Conditions */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-muted-foreground">Medical Conditions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasConditions ? (
            patientProfile.chronic_diseases.map((disease, i) => (
              <Badge 
                key={i} 
                variant="secondary" 
                className="rounded-full px-3 py-1 bg-red-100 text-red-700 border border-red-200"
              >
                {disease}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">No conditions recorded</span>
          )}
        </div>
      </div>

      {/* Current Medications */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Pill className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-muted-foreground">Current Medications</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasMedications ? (
            patientProfile.current_medications.map((med, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="rounded-full px-3 py-1 border-blue-300 text-blue-700 bg-blue-50"
              >
                {med}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">No medications recorded</span>
          )}
        </div>
      </div>

      {/* Allergies */}
      {hasAllergies && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-muted-foreground">Allergies</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {patientProfile.allergies.map((allergy, i) => (
              <Badge 
                key={i} 
                variant="destructive" 
                className="rounded-full px-3 py-1"
              >
                {allergy}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
