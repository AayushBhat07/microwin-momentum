import { useAuth } from "@/hooks/use-auth";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export function Protected({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    // If user is authenticated, check onboarding status
    if (user) {
      const onboardingStep = user.onboardingStep ?? 0;
      const currentPath = location.pathname;

      if (onboardingStep < 4) {
        const onboardingPaths = [
          "/onboarding/profile",
          "/onboarding/goals",
          "/onboarding/achievements",
          "/onboarding/preferences",
        ];
        const targetPath = onboardingPaths[onboardingStep];

        if (currentPath !== targetPath) {
          navigate(targetPath, { replace: true });
        }
      } else {
        // User is fully onboarded
        const isAtOnboarding = /^\/onboarding/.test(currentPath);
        const isAtLogin = currentPath === '/login';
        if (isAtOnboarding || isAtLogin) {
          navigate("/dashboard", { replace: true });
        }
      }
    }
  }, [isAuthenticated, isLoading, user, location.pathname, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin " />
      </div>
    );
  }

  return <>{children}</>;
}