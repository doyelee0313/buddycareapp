import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import AuthPage from "./pages/AuthPage";
import ElderlyHome from "./pages/elderly/ElderlyHome";
import ElderlyChat from "./pages/elderly/ElderlyChat";
import ElderlyCall from "./pages/elderly/ElderlyCall";
import CaregiverDashboard from "./pages/caregiver/CaregiverDashboard";
import CaregiverMissions from "./pages/caregiver/CaregiverMissions";
import CaregiverLogs from "./pages/caregiver/CaregiverLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth / Login */}
              <Route path="/" element={<AuthPage />} />
              
              {/* Elderly User Routes */}
              <Route path="/elderly" element={<ElderlyHome />} />
              <Route path="/elderly/chat" element={<ElderlyChat />} />
              <Route path="/elderly/call" element={<ElderlyCall />} />
              
              {/* Caregiver Routes */}
              <Route path="/caregiver" element={<CaregiverDashboard />} />
              <Route path="/caregiver/missions" element={<CaregiverMissions />} />
              <Route path="/caregiver/logs" element={<CaregiverLogs />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
