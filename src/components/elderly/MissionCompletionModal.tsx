import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Check, X, Dumbbell, Heart, Undo2 } from 'lucide-react';
import { Mission } from '@/types/app';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MissionCompletionModalProps {
  mission: Mission | null;
  open: boolean;
  isCompleted: boolean;
  onClose: () => void;
  onComplete: (missionId: string) => void;
  onCancel: (missionId: string) => void;
}

const moodEmojis = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-100' },
  { emoji: '😌', label: 'Calm', color: 'bg-blue-100' },
  { emoji: '😔', label: 'Sad', color: 'bg-gray-100' },
  { emoji: '😤', label: 'Frustrated', color: 'bg-red-100' },
  { emoji: '😴', label: 'Tired', color: 'bg-purple-100' },
  { emoji: '🥰', label: 'Loved', color: 'bg-pink-100' },
];

const exerciseTypes = [
  { icon: '🚶', label: 'Walking' },
  { icon: '🧘', label: 'Yoga' },
  { icon: '💪', label: 'Stretching' },
  { icon: '🏃', label: 'Light Jog' },
  { icon: '🩰', label: 'Dancing' },
  { icon: '🏋️', label: 'Exercises' },
];

export function MissionCompletionModal({ mission, open, isCompleted, onClose, onComplete, onCancel }: MissionCompletionModalProps) {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleComplete = async () => {
    if (!mission || !user) return;
    
    setIsCompleting(true);
    
    try {
      // Record mission completion in database
      const { error } = await supabase
        .from('mission_completions')
        .insert({
          user_id: user.id,
          mission_type: mission.type,
        });
      
      if (error) throw error;
      
      onComplete(mission.id);
      toast.success(`${mission.title} completed! 🎉`);
      resetAndClose();
    } catch (err) {
      console.error('Error completing mission:', err);
      toast.error('Failed to complete mission');
    } finally {
      setIsCompleting(false);
    }
  };

  const resetAndClose = () => {
    setSelectedMood(null);
    setSelectedExercise(null);
    setPhotoPreview(null);
    onClose();
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = () => {
    fileInputRef.current?.click();
  };

  if (!mission) return null;

  // Show cancel UI for completed missions
  if (isCompleted) {
    return (
      <Dialog open={open} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md mx-4 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <span className="text-4xl">{mission.icon}</span>
              {mission.title}
            </DialogTitle>
          </DialogHeader>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
              >
                <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
              </motion.div>
              <p className="text-xl text-muted-foreground">
                This mission is completed! 🎉
              </p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Need to undo this?
              </p>
            </div>
            
            <Button
              variant="outline"
              className="w-full h-16 text-xl rounded-2xl border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => {
                onCancel(mission.id);
                resetAndClose();
              }}
            >
              <Undo2 className="w-6 h-6 mr-2" />
              Cancel Mission
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  const renderMissionContent = () => {
    switch (mission.type) {
      case 'meal':
        return (
          <div className="space-y-6">
            <p className="text-xl text-center text-muted-foreground">
              Take a photo of your empty plate! 📸
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoCapture}
            />
            
            {photoPreview ? (
              <motion.div 
                className="relative rounded-2xl overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <img 
                  src={photoPreview} 
                  alt="Meal photo" 
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={() => setPhotoPreview(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-20 rounded-2xl flex-col gap-2"
                  onClick={openCamera}
                >
                  <Camera className="w-8 h-8" />
                  <span>Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-20 rounded-2xl flex-col gap-2"
                  onClick={openCamera}
                >
                  <Upload className="w-8 h-8" />
                  <span>Upload</span>
                </Button>
              </div>
            )}
            
            <Button
              className="w-full h-16 text-xl rounded-2xl"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              <Check className="w-6 h-6 mr-2" />
              {photoPreview ? 'Complete Meal' : 'Skip Photo & Complete'}
            </Button>
          </div>
        );

      case 'exercise':
        return (
          <div className="space-y-6">
            <p className="text-xl text-center text-muted-foreground">
              What exercise did you do? 🏃‍♂️
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {exerciseTypes.map((exercise) => (
                <motion.button
                  key={exercise.label}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    selectedExercise === exercise.label 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted bg-card hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedExercise(exercise.label)}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-4xl">{exercise.icon}</span>
                  <span className="text-sm font-medium">{exercise.label}</span>
                </motion.button>
              ))}
            </div>
            
            <Button
              className="w-full h-16 text-xl rounded-2xl"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              <Dumbbell className="w-6 h-6 mr-2" />
              {selectedExercise ? `Log ${selectedExercise}` : 'Complete Exercise'}
            </Button>
          </div>
        );

      case 'mood':
        return (
          <div className="space-y-6">
            <p className="text-xl text-center text-muted-foreground">
              How are you feeling today? 💭
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {moodEmojis.map((mood) => (
                <motion.button
                  key={mood.label}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    selectedMood === mood.label 
                      ? 'border-primary bg-primary/10 scale-105' 
                      : `border-muted ${mood.color} hover:border-primary/50`
                  }`}
                  onClick={() => setSelectedMood(mood.label)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-5xl">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                </motion.button>
              ))}
            </div>
            
            <Button
              className="w-full h-16 text-xl rounded-2xl"
              onClick={handleComplete}
              disabled={!selectedMood || isCompleting}
            >
              <Heart className="w-6 h-6 mr-2" />
              Log Mood
            </Button>
          </div>
        );

      case 'medicine':
        return (
          <div className="space-y-6">
            <motion.div 
              className="text-center py-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <span className="text-8xl">💊</span>
              <p className="text-xl text-muted-foreground mt-4">
                Did you take your medicine?
              </p>
              <p className="text-lg text-muted-foreground/70 mt-2">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </motion.div>
            
            <Button
              className="w-full h-20 text-2xl rounded-2xl bg-green-600 hover:bg-green-700"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              <Check className="w-8 h-8 mr-3" />
              Mark as Taken
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-md mx-4 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <span className="text-4xl">{mission.icon}</span>
            {mission.title}
          </DialogTitle>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={mission.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderMissionContent()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}