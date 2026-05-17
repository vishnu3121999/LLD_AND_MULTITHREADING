import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-slate-950 bg-slate-950 text-white hover:bg-slate-800",
        secondary: "border-slate-200 bg-white text-slate-950 hover:bg-slate-100",
        outline: "border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100",
        subtle: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
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
