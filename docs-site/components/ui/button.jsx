import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-brand)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-[var(--site-heading)] bg-[var(--site-heading)] text-[var(--site-bg)] hover:brightness-110",
        secondary: "border-[var(--site-border)] bg-[var(--site-surface)] text-[var(--site-heading)] hover:bg-[var(--site-surface-2)]",
        outline: "border-[var(--site-border)] bg-transparent text-[var(--site-heading)] hover:bg-[var(--site-surface-2)]",
        subtle: "border-transparent bg-[var(--site-surface-2)] text-[var(--site-heading)] hover:bg-[var(--site-surface-3)]",
        danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
