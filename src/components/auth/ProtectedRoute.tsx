import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import puppyHappy from '@/assets/puppy-3d-happy.png';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: 'elderly' | 'caregiver';
}

export default function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/');
      } else if (requiredUserType && profile && profile.user_type !== requiredUserType) {
        // Redirect to correct dashboard if user type doesn't match
        navigate(profile.user_type === 'elderly' ? '/elderly' : '/caregiver');
      }
    }
  }, [user, profile, loading, requiredUserType, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-[hsl(35,60%,95%)] flex items-center justify-center">
        <motion.img
          src={puppyHappy}
          alt="Loading..."
          className="w-24 h-24"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredUserType && profile && profile.user_type !== requiredUserType) {
    return null;
  }

  return <>{children}</>;
}
