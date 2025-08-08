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
        "relative h-full w-full overflow-hidden rounded-2xl border",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-[linear-gradient(to_bottom,theme(colors.border/0.4)_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-8">
        {children}
      </div>
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
      className={cn("h-full w-full", className)}
      {...props}
    />
  );
});
LinesPatternCardBody.displayName = "LinesPatternCardBody";

export { LinesPatternCard, LinesPatternCardBody };