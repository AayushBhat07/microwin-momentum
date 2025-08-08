import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { GoogleIcon } from "./GoogleIcon";

export function AuthCard() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google")
      .catch((err) => {
        console.error("Google sign-in error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to sign in with Google. Please try again.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      await signIn("email-otp", formData);
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full flex-col">
      <Card className="min-w-[350px] pb-0 border shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Get Started</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <GoogleIcon />
            Sign in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <form onSubmit={handleEmailSubmit} className="grid gap-2">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  className="pl-9"
                  disabled={isLoading}
                  required
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                size="icon"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </form>
        </CardContent>
        <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
          Secured by{" "}
          <a
            href="https://vly.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            vly.ai
          </a>
        </div>
      </Card>
    </div>
  );
}