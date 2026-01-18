import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Pill, Heart, AlertCircle, Phone, X, Edit2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface PatientProfile {
  id: string;
  user_id: string;
  chronic_diseases: string[];
  current_medications: string[];
  health_status_summary: string | null;
  allergies: string[];
  emergency_contact: string | null;
}

interface LinkedElderly {
  user_id: string;
  display_name: string;
}

export function PatientProfileModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkedElderly, setLinkedElderly] = useState<LinkedElderly | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  
  // Editable fields
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [healthSummary, setHealthSummary] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  useEffect(() => {
    if (open && user) {
      fetchLinkedElderly();
    }
  }, [open, user]);

  const fetchLinkedElderly = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Fetch linked elderly profile
      const { data: elderlyData, error: elderlyError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('linked_caregiver_id', user.id)
        .maybeSingle();

      if (elderlyError) {
        console.error('Error fetching linked elderly:', elderlyError);
        return;
      }

      if (elderlyData) {
        setLinkedElderly(elderlyData);
        
        // Fetch patient profile using raw query since types aren't updated yet
        const { data: profileData, error: profileError } = await supabase
          .from('patient_profiles' as any)
          .select('*')
          .eq('user_id', elderlyData.user_id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching patient profile:', profileError);
        }

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
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!linkedElderly) return;
    
    setLoading(true);
    
    const profileData = {
      user_id: linkedElderly.user_id,
      chronic_diseases: chronicDiseases.split(',').map(s => s.trim()).filter(Boolean),
      current_medications: medications.split(',').map(s => s.trim()).filter(Boolean),
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
      health_status_summary: healthSummary || null,
      emergency_contact: emergencyContact || null,
    };

    try {
      if (patientProfile) {
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
      setIsEditing(false);
      fetchLinkedElderly();
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save patient profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          className="w-full p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20 hover:border-primary/40 transition-colors text-left"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-xl">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Patient Profile</h3>
              <p className="text-sm text-muted-foreground">View medical information</p>
            </div>
          </div>
        </motion.button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md mx-4 rounded-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {linkedElderly ? `${linkedElderly.display_name}'s Profile` : 'Patient Profile'}
            </DialogTitle>
            {linkedElderly && !isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !linkedElderly ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No linked patient found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Ask your elderly user to link their account to you.
              </p>
            </div>
          ) : isEditing ? (
            // Edit Mode
            <div className="space-y-5">
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

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-5">
              {/* Chronic Diseases */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Chronic Diseases</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patientProfile?.chronic_diseases?.length ? (
                    patientProfile.chronic_diseases.map((disease, i) => (
                      <Badge key={i} variant="secondary" className="rounded-full px-3 py-1">
                        {disease}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No chronic diseases recorded</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Current Medications */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Pill className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Current Medications</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patientProfile?.current_medications?.length ? (
                    patientProfile.current_medications.map((med, i) => (
                      <Badge key={i} variant="outline" className="rounded-full px-3 py-1 border-blue-300 text-blue-700">
                        {med}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No medications recorded</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Allergies */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Allergies</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patientProfile?.allergies?.length ? (
                    patientProfile.allergies.map((allergy, i) => (
                      <Badge key={i} variant="destructive" className="rounded-full px-3 py-1">
                        {allergy}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No allergies recorded</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Health Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Health Status Summary</h3>
                <p className="text-muted-foreground bg-muted/50 p-4 rounded-xl">
                  {patientProfile?.health_status_summary || 'No health summary available. Click Edit to add one.'}
                </p>
              </div>

              {/* Emergency Contact */}
              {patientProfile?.emergency_contact && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency Contact</p>
                      <p className="font-medium">{patientProfile.emergency_contact}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}