import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex h-10 items-center rounded-md border border-[var(--site-border)] bg-[var(--site-surface)] p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-8 items-center justify-center rounded px-3 text-sm font-medium text-[var(--site-muted)] transition data-[state=active]:bg-[var(--site-heading)] data-[state=active]:text-[var(--site-bg)]",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn("mt-5", className)} {...props} />;
}
