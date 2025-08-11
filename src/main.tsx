import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "@/components/VlyToolbar";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Dashboard from "./pages/Dashboard.tsx";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Protected } from "@/lib/protected-page";
import ProfilePage from "./pages/Profile.tsx";
import LoginPage from "@/pages/Login.tsx";
import VerifyEmailPage from "./pages/VerifyEmail.tsx";
import ProfileSetupPage from "./pages/onboarding/ProfileSetup.tsx";
import GoalSettingPage from "./pages/onboarding/GoalSetting.tsx";
import AchievementIntroPage from "./pages/onboarding/AchievementIntro.tsx";
import PreferencesPage from "./pages/onboarding/Preferences.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/onboarding/profile" element={<Protected><ProfileSetupPage onComplete={() => {}} /></Protected>} />
            <Route path="/onboarding/goals" element={<Protected><GoalSettingPage onComplete={() => {}} /></Protected>} />
            <Route path="/onboarding/achievements" element={<Protected><AchievementIntroPage /></Protected>} />
            <Route path="/onboarding/preferences" element={<Protected><PreferencesPage /></Protected>} />
            <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
            <Route path="/u/:username" element={<UserProfilePage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);