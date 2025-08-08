import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function VerifyEmailPage() {
  const { signIn } = useAuth();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!email) {
    // This shouldn't happen in normal flow, but as a fallback, redirect to login.
    navigate("/login");
    return null;
  }

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(searchParams.get("redirect") || "/dashboard");
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  return (
    <div className="flex items-center justify-center h-full flex-col">
      <Card className="min-w-[350px] pb-0 border shadow-md">
        <CardHeader className="text-center mt-4">
          <CardTitle>Check your email</CardTitle>
          <CardDescription>We've sent a code to {email}</CardDescription>
        </CardHeader>
        <form onSubmit={handleOtpSubmit}>
          <CardContent className="pb-4">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="code" value={otp} />

            <div className="flex justify-center">
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                    const form = (e.target as HTMLElement).closest("form");
                    if (form) {
                      form.requestSubmit();
                    }
                  }
                }}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
            )}
            <p className="text-sm text-muted-foreground text-center mt-4">
              Didn't receive a code?{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate("/login")}
              >
                Try again
              </Button>
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/login")}
              disabled={isLoading}
              className="w-full"
            >
              Use different email
            </Button>
          </CardFooter>
        </form>
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
