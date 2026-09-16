"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 rounded-xl text-[12px] font-black uppercase tracking-[0.12em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[linear-gradient(135deg,hsl(var(--brand-blue)),hsl(var(--brand-cyan)))] text-primary-foreground shadow-[0_14px_28px_rgba(3,105,161,0.22)] hover:shadow-[0_16px_34px_rgba(3,105,161,0.30)]",
        secondary: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--brand-sky)/0.28)]",
        outline: "border border-border/80 bg-background/50 shadow-sm hover:border-[hsl(var(--brand-cyan)/0.45)] hover:bg-[hsl(var(--accent)/0.56)] hover:text-[hsl(var(--brand-blue))] dark:border-border",
        ghost: "hover:bg-[hsl(var(--accent)/0.62)] hover:text-[hsl(var(--brand-blue))]",
        destructive: "bg-rose-600 text-white shadow-lg shadow-rose-900/10 hover:bg-rose-700",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4",
        lg: "h-14 px-8",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };