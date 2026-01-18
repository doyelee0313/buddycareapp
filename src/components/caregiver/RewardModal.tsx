import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Coffee, Sparkles, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RewardModalProps {
  totalHearts: number;
  onCouponClaimed: () => void;
}

const HEARTS_PER_COUPON = 20;

// Generate a random coupon code
function generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'LOVE-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function RewardModal({ totalHearts, onCouponClaimed }: RewardModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimedCouponsCount, setClaimedCouponsCount] = useState(0);
  const { user } = useAuth();

  // Calculate how many coupons can be earned
  const earnableCoupons = Math.floor(totalHearts / HEARTS_PER_COUPON);
  const unclaimedCoupons = earnableCoupons - claimedCouponsCount;
  const canClaimReward = unclaimedCoupons > 0;

  // Fetch claimed coupons count
  useEffect(() => {
    const fetchClaimedCoupons = async () => {
      if (!user) return;
      
      const { count } = await supabase
        .from('caregiver_coupons')
        .select('*', { count: 'exact' })
        .eq('caregiver_id', user.id);
      
      if (count !== null) {
        setClaimedCouponsCount(count);
      }
    };

    fetchClaimedCoupons();
  }, [user, claimed]);

  // Show modal when a new coupon becomes available
  useEffect(() => {
    if (canClaimReward && !claimed) {
      setIsOpen(true);
    }
  }, [canClaimReward, claimed]);

  const handleClaimReward = async () => {
    if (!user || isClaiming) return;
    
    setIsClaiming(true);
    
    const couponCode = generateCouponCode();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3); // 3 months expiry

    const { error } = await supabase
      .from('caregiver_coupons')
      .insert({
        caregiver_id: user.id,
        coupon_type: 'coffee',
        coupon_title: '☕ Free Coffee Coupon',
        coupon_description: 'Enjoy a complimentary beverage at participating cafes. Thank you for your dedication!',
        coupon_code: couponCode,
        hearts_required: HEARTS_PER_COUPON,
        expires_at: expiresAt.toISOString(),
      });

    if (error) {
      console.error('Error claiming coupon:', error);
      toast.error('Failed to claim coupon', {
        description: 'Please try again later',
      });
    } else {
      setClaimed(true);
      toast.success('🎉 Coupon claimed!', {
        description: 'Check your Coupon Box to view it',
      });
      onCouponClaimed();
      
      // Reset claimed state after closing
      setTimeout(() => {
        setClaimed(false);
        setIsOpen(false);
      }, 2000);
    }
    
    setIsClaiming(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md rounded-3xl border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 overflow-hidden">
        {/* Confetti background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F'][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <DialogHeader className="relative z-10">
          <motion.div
            className="mx-auto mb-4"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Gift className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            🎉 Congratulations! 🎉
          </DialogTitle>
          
          <DialogDescription className="text-center text-base">
            You've collected <span className="font-bold text-primary">{HEARTS_PER_COUPON} hearts</span> of love!
            <br />
            Claim your special reward!
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!claimed ? (
            <motion.div
              key="coupon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10"
            >
              {/* Coupon Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-dashed border-amber-300 dark:border-amber-600 my-4">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-xl">
                    <Coffee className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-foreground">Free Coffee Coupon</h4>
                    <p className="text-sm text-muted-foreground">
                      Enjoy at participating cafes
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Valid for 3 months</span>
                </div>
              </div>

              <Button
                onClick={handleClaimReward}
                disabled={isClaiming}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl shadow-lg"
              >
                {isClaiming ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Gift className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <>
                    <Gift className="w-6 h-6 mr-2" />
                    Claim Reward
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 text-center py-6"
            >
              <motion.div
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-green-600">Coupon Claimed!</h3>
              <p className="text-muted-foreground mt-2">Check your Coupon Box</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors z-20"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
