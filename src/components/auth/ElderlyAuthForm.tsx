import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Delete, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import puppyHappy from '@/assets/puppy-3d-happy.png';

interface ElderlyAuthFormProps {
  onBack: () => void;
}

export default function ElderlyAuthForm({ onBack }: ElderlyAuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const { signInWithPin, signUp } = useAuth();
  const { toast } = useToast();

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signInWithPin(name, pin);
        if (error) {
          setError('Invalid name or PIN. Please try again.');
        }
      } else {
        // For signup, generate email from name and pad PIN for Supabase's 6-char minimum
        const elderlyEmail = `${name.toLowerCase().replace(/\s+/g, '_')}@elderly.puppycare.app`;
        const paddedPin = `pin_${pin}`;
        const { error } = await signUp(elderlyEmail, paddedPin, name, 'elderly', pin);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('This name is already taken. Please login or use a different name.');
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: 'Welcome to PuppyCare! 🐕',
            description: 'Your account has been created successfully!',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const numpadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'delete'],
  ];

  return (
    <motion.div
      className="w-full max-w-lg mx-auto px-4"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-lg"
      >
        <ArrowLeft className="w-6 h-6" />
        <span className="text-xl">Back</span>
      </button>

      {/* Header with Puppy */}
      <div className="text-center mb-6">
        <motion.img
          src={puppyHappy}
          alt="Friendly puppy"
          className="w-24 h-24 mx-auto mb-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <h2 className="text-3xl font-bold text-foreground">
          {isLogin ? 'Welcome Back!' : 'Create Your Account'}
        </h2>
        <p className="text-xl text-muted-foreground mt-2">
          {isLogin ? 'Enter your name and PIN' : 'Choose your name and PIN'}
        </p>
      </div>

      {/* Name Input - Large and accessible */}
      <div className="mb-6">
        <label className="block text-xl font-semibold text-foreground mb-3">
          Your Name
        </label>
        <Input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          className="h-16 text-2xl text-center font-semibold rounded-2xl border-2 border-muted focus:border-primary"
        />
      </div>

      {/* PIN Display */}
      <div className="mb-6">
        <label className="block text-xl font-semibold text-foreground mb-3 text-center">
          Your 4-Digit PIN
        </label>
        <div className="flex justify-center gap-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={`w-16 h-20 rounded-2xl border-3 flex items-center justify-center text-4xl font-bold ${
                pin[i] 
                  ? 'bg-primary/10 border-primary text-primary' 
                  : 'bg-muted/30 border-muted-foreground/30'
              }`}
              animate={pin[i] ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              {pin[i] ? '●' : ''}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          className="text-destructive text-xl text-center mb-4 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {numpadButtons.flat().map((btn) => (
          <motion.button
            key={btn}
            onClick={() => {
              if (btn === 'delete') handleDelete();
              else if (btn === 'clear') handleClear();
              else handlePinPress(btn);
            }}
            className={`h-20 rounded-2xl text-3xl font-bold transition-all ${
              btn === 'delete' || btn === 'clear'
                ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                : 'bg-card border-2 border-muted hover:bg-primary/10 hover:border-primary text-foreground'
            }`}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {btn === 'delete' ? (
              <Delete className="w-8 h-8 mx-auto" />
            ) : btn === 'clear' ? (
              <span className="text-lg">Clear</span>
            ) : (
              btn
            )}
          </motion.button>
        ))}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={loading || pin.length !== 4 || !name.trim()}
        className="w-full h-20 text-2xl font-bold rounded-2xl bg-gradient-to-r from-primary to-[hsl(30,90%,55%)] hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : isLogin ? (
          '🐕 Let\'s Go!'
        ) : (
          '🎉 Create Account'
        )}
      </Button>

      {/* Toggle Login/Signup */}
      <p className="text-center mt-6 text-lg text-muted-foreground">
        {isLogin ? "First time here? " : 'Already have an account? '}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setPin('');
          }}
          className="text-primary font-bold hover:underline text-xl"
        >
          {isLogin ? 'Create Account' : 'Sign In'}
        </button>
      </p>
    </motion.div>
  );
}
