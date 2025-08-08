import { cn } from "@/lib/utils";
import React from "react";

const LinesPatternCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border p-8",
        className,
      )}
      {...props}
    >
      {/* The line pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      {/* A faint overlay to make the lines more subtle */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background/80" />
      {children}
    </div>
  );
});
LinesPatternCard.displayName = "LinesPatternCard";

const LinesPatternCardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("z-10 h-full w-full", className)}
      {...props}
    />
  );
});
LinesPatternCardBody.displayName = "LinesPatternCardBody";

export { LinesPatternCard, LinesPatternCardBody };
