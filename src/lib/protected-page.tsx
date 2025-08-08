import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export function Protected({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return; // 1. Wait for auth to load

    // 2. If not authenticated, redirect to login, preserving the intended destination
    if (!isAuthenticated) {
      const from = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(from)}`, { replace: true });
      return;
    }

    // If user is authenticated, proceed with onboarding and routing logic
    if (user) {
      const onboardingStep = user.onboardingStep ?? 0;
      const isOnboardingComplete = onboardingStep >= 4;
      const currentPath = location.pathname;
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect');

      // 3. Handle onboarding redirection
      if (!isOnboardingComplete) {
        const onboardingPaths = [
          "/onboarding/profile",
          "/onboarding/goals",
          "/onboarding/achievements",
          "/onboarding/preferences",
        ];
        const targetOnboardingPath = onboardingPaths[onboardingStep];
        
        if (currentPath !== targetOnboardingPath) {
          navigate(targetOnboardingPath, { replace: true });
        }
        return; // Render the onboarding step
      }

      // 4. Handle post-onboarding routing
      if (isOnboardingComplete) {
        // If coming from login with a redirect param, go there
        if (redirect && redirect !== "/" && !redirect.startsWith('/onboarding')) {
           navigate(redirect, { replace: true });
        } else {
          // Otherwise, if on an onboarding or login page, go to dashboard
          const isAtOnboarding = /^\/onboarding/.test(currentPath);
          const isAtLogin = currentPath === '/login';
          if (isAtOnboarding || isAtLogin) {
            navigate("/dashboard", { replace: true });
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, user, location, navigate]);

  // While loading or if redirection is in progress, show a loader
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // 4. If all checks pass, render the requested component
  return <>{children}</>;
}