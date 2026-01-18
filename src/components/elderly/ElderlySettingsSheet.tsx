import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export function ElderlySettingsSheet() {
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  const initials = profile?.display_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <motion.button
            className="flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            <Avatar className="w-14 h-14 border-3 border-primary/30 shadow-lg">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-full sm:max-w-md p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 pb-4">
              <SheetTitle className="text-2xl font-bold text-left">Settings</SheetTitle>
            </SheetHeader>

            {/* Profile Section */}
            <div className="px-6 pb-6">
              <motion.div 
                className="flex items-center gap-4 p-5 bg-muted/50 rounded-3xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Avatar className="w-20 h-20 border-3 border-primary/30">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {profile?.display_name || 'User'}
                  </h2>
                  <p className="text-lg text-muted-foreground">Elderly User</p>
                </div>
              </motion.div>
            </div>

            <Separator className="mx-6" />

            {/* Settings Options */}
            <div className="flex-1 px-6 py-6 space-y-3">
              <h3 className="text-lg font-semibold text-muted-foreground mb-4">
                User Settings
              </h3>
              
              <motion.button
                className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border-2 border-muted hover:border-primary/30 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xl font-medium">Profile Info</span>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </motion.button>

              <motion.button
                className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border-2 border-muted hover:border-primary/30 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xl font-medium">Preferences</span>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Logout Button at Bottom */}
            <div className="p-6 pt-0 mt-auto">
              <Button
                onClick={() => setShowLogoutConfirm(true)}
                variant="destructive"
                className="w-full h-16 text-xl font-bold rounded-2xl"
              >
                <LogOut className="w-6 h-6 mr-3" />
                Log Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="max-w-md mx-4 rounded-3xl p-8">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-3xl font-bold text-center">
              Are you sure you want to exit?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xl text-center text-muted-foreground">
              You will need to log in again to use the app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 sm:flex-col mt-6">
            <AlertDialogAction
              onClick={handleLogout}
              className="w-full h-16 text-xl font-bold rounded-2xl bg-destructive hover:bg-destructive/90"
            >
              Yes, Log Out
            </AlertDialogAction>
            <AlertDialogCancel className="w-full h-16 text-xl font-bold rounded-2xl border-2">
              No, Stay
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
