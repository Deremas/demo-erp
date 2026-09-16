import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background transition placeholder:text-muted-foreground focus-visible:border-[hsl(var(--brand-cyan)/0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-cyan)/0.24)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        onFocus={(e) => {
          e.target.select();
          props.onFocus?.(e);
        }}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };