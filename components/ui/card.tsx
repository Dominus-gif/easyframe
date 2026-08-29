import * as React from "react";

import { cn } from "@/lib/utils";

type CardVariant = "default" | "soft";

const variantClasses: Record<CardVariant, string> = {
  // Standard shadcn-style surface.
  default: "rounded-lg border bg-card text-card-foreground shadow-sm",
  // "Soft" surface tuned to the EasyFrame supercut dark theme: warm near-black
  // panel, hairline border, gentle top highlight and depth shadow.
  soft:
    "rounded-2xl border border-[#242020] bg-[#181616] " +
    "bg-gradient-to-b from-white/[0.035] to-transparent " +
    "text-[#FDFFF0] shadow-[0_1px_2px_rgba(0,0,0,0.4),0_18px_40px_rgba(0,0,0,0.28)] " +
    "transition-[transform,border-color,box-shadow] duration-300 " +
    "hover:-translate-y-0.5 hover:border-[#3A3333] hover:shadow-[0_2px_4px_rgba(0,0,0,0.5),0_26px_54px_rgba(255,0,85,0.10)]"
};

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }
>(({ className, variant = "default", ...props }, ref) => (
  <div ref={ref} className={cn(variantClasses[variant], className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-[#969692]", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
