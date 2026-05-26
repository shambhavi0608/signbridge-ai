import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const pad = { none: "", sm: "p-3", md: "p-5", lg: "p-6" };

export const Card = forwardRef<HTMLDivElement, Props>(function Card(
  { className, padding = "md", ...rest }, ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl glass shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]",
        pad[padding], className,
      )}
      {...rest}
    />
  );
});
