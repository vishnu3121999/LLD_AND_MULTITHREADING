import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-y rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] px-3 py-2 text-sm text-[var(--site-heading)] outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-brand)] focus:ring-2 focus:ring-[var(--site-brand-soft)]",
        className
      )}
      {...props}
    />
  );
});
