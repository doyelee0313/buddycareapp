import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Pill, AlertCircle, User, Edit2, Save, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PatientProfile {
  id?: string;
  user_id?: string;
  chronic_diseases: string[];
  current_medications: string[];
  allergies: string[];
  health_status_summary: string | null;
  emergency_contact: string | null;
}

interface LinkedElderly {
  user_id: string;
  display_name: string;
}

export function PatientSummaryCard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkedElderly, setLinkedElderly] = useState<LinkedElderly | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // Editable fields
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [healthSummary, setHealthSummary] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

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
          const profile = profileData as unknown as PatientProfile;
          setPatientProfile(profile);
          setChronicDiseases((profile.chronic_diseases || []).join(', '));
          setMedications((profile.current_medications || []).join(', '));
          setAllergies((profile.allergies || []).join(', '));
          setHealthSummary(profile.health_status_summary || '');
          setEmergencyContact(profile.emergency_contact || '');
        }
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!linkedElderly) return;
    
    setSaving(true);
    
    const profileData = {
      user_id: linkedElderly.user_id,
      chronic_diseases: chronicDiseases.split(',').map(s => s.trim()).filter(Boolean),
      current_medications: medications.split(',').map(s => s.trim()).filter(Boolean),
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
      health_status_summary: healthSummary || null,
      emergency_contact: emergencyContact || null,
    };

    try {
      if (patientProfile?.id) {
        // Update existing
        const { error } = await supabase
          .from('patient_profiles' as any)
          .update(profileData)
          .eq('id', patientProfile.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('patient_profiles' as any)
          .insert(profileData);
        
        if (error) throw error;
      }
      
      toast.success('Patient profile saved successfully');
      setEditModalOpen(false);
      fetchPatientData();
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save patient profile');
    } finally {
      setSaving(false);
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
    <>
      <motion.div
        className="bg-card rounded-3xl p-5 shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-2 rounded-xl">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg">{linkedElderly.display_name}'s Health Summary</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditModalOpen(true)}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
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

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md mx-4 rounded-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/10 to-primary/5">
            <DialogTitle className="text-2xl font-bold">
              Edit {linkedElderly.display_name}'s Profile
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" /> Chronic Diseases
              </label>
              <Input
                placeholder="e.g., Diabetes, Hypertension (comma separated)"
                value={chronicDiseases}
                onChange={(e) => setChronicDiseases(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Pill className="w-4 h-4" /> Current Medications
              </label>
              <Input
                placeholder="e.g., Metformin, Lisinopril (comma separated)"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Allergies
              </label>
              <Input
                placeholder="e.g., Penicillin, Peanuts (comma separated)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2">
                Health Status Summary
              </label>
              <Textarea
                placeholder="Brief health overview..."
                value={healthSummary}
                onChange={(e) => setHealthSummary(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Emergency Contact
              </label>
              <Input
                placeholder="Phone number or contact info"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <Separator />

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
