import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Coffee, Ticket, Clock, CheckCircle, Copy, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

interface Coupon {
  id: string;
  coupon_type: string;
  coupon_title: string;
  coupon_description: string | null;
  coupon_code: string;
  hearts_required: number;
  earned_at: string;
  redeemed_at: string | null;
  is_redeemed: boolean;
  expires_at: string | null;
}

export function CouponBox() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const fetchCoupons = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('caregiver_coupons')
      .select('*')
      .eq('caregiver_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
    } else {
      setCoupons(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchCoupons();
    }
  }, [isOpen, user]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  const handleRedeemCoupon = async (couponId: string) => {
    const { error } = await supabase
      .from('caregiver_coupons')
      .update({
        is_redeemed: true,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', couponId);

    if (error) {
      toast.error('Failed to mark as redeemed');
    } else {
      toast.success('Coupon marked as redeemed!');
      fetchCoupons();
    }
  };

  const activeCoupons = coupons.filter(c => !c.is_redeemed);
  const redeemedCoupons = coupons.filter(c => c.is_redeemed);

  const getCouponIcon = (type: string) => {
    switch (type) {
      case 'coffee':
        return <Coffee className="w-6 h-6" />;
      default:
        return <Ticket className="w-6 h-6" />;
    }
  };

  const getExpiryStatus = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const daysLeft = differenceInDays(new Date(expiresAt), new Date());
    if (daysLeft < 0) return { text: 'Expired', color: 'text-destructive' };
    if (daysLeft <= 7) return { text: `${daysLeft} days left`, color: 'text-amber-600' };
    return { text: `${daysLeft} days left`, color: 'text-muted-foreground' };
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors">
          <Gift className="h-4 w-4" />
          <span>Coupon Box</span>
          {activeCoupons.length > 0 && (
            <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              {activeCoupons.length}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl">
              <Gift className="w-5 h-5 text-white" />
            </div>
            My Coupon Box
          </SheetTitle>
        </SheetHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Gift className="w-8 h-8 text-amber-500" />
              </motion.div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No coupons yet</h3>
              <p className="text-muted-foreground text-sm">
                Collect 20 hearts to earn your first reward!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Coupons */}
              {activeCoupons.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    Available ({activeCoupons.length})
                  </h3>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {activeCoupons.map((coupon, index) => {
                        const expiryStatus = getExpiryStatus(coupon.expires_at);
                        return (
                          <motion.div
                            key={coupon.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div className="bg-amber-100 dark:bg-amber-900 p-2.5 rounded-xl text-amber-600 dark:text-amber-400">
                                {getCouponIcon(coupon.coupon_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-foreground">{coupon.coupon_title}</h4>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {coupon.coupon_description}
                                </p>
                                
                                {/* Coupon Code */}
                                <div className="mt-3 flex items-center gap-2">
                                  <code className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg font-mono text-sm font-bold border">
                                    {coupon.coupon_code}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopyCode(coupon.coupon_code)}
                                    className="h-8 px-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Footer info */}
                                <div className="mt-3 flex items-center justify-between">
                                  {expiryStatus && (
                                    <span className={`text-xs flex items-center gap-1 ${expiryStatus.color}`}>
                                      <Clock className="w-3 h-3" />
                                      {expiryStatus.text}
                                    </span>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRedeemCoupon(coupon.id)}
                                    className="h-7 text-xs"
                                  >
                                    Mark as Used
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Redeemed Coupons */}
              {redeemedCoupons.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Used ({redeemedCoupons.length})
                  </h3>
                  <div className="space-y-2">
                    {redeemedCoupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="bg-muted/50 rounded-xl p-3 opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-muted p-2 rounded-lg text-muted-foreground">
                            {getCouponIcon(coupon.coupon_type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-through">{coupon.coupon_title}</h4>
                            <p className="text-xs text-muted-foreground">
                              Redeemed {coupon.redeemed_at ? format(new Date(coupon.redeemed_at), 'MMM d, yyyy') : ''}
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
