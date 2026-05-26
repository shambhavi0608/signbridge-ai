import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#F97316] text-black hover:bg-[#fb8a3d] active:bg-[#e96712] shadow-[0_8px_30px_-12px_rgba(249,115,22,0.6)]",
  secondary: "bg-white/8 text-white hover:bg-white/12 border border-white/10",
  ghost: "bg-transparent text-white/80 hover:bg-white/8 hover:text-white",
  danger: "bg-red-500/90 text-white hover:bg-red-500",
  outline: "border border-white/15 text-white hover:bg-white/8",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...rest }, ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/60",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit",
        variants[variant], sizes[size], className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
