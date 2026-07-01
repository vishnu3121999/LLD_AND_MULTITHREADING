import { cn } from "../../lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] px-3 text-sm text-[var(--site-heading)] outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-brand)] focus:ring-2 focus:ring-[var(--site-brand-soft)]",
        className
      )}
      {...props}
    />
  );
}
