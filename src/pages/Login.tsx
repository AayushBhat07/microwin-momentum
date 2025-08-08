import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function LoginPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectUrl = searchParams.get("redirect") || "/dashboard";
      navigate(redirectUrl, { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, searchParams]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return <AuthCard />;
}