import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("rounded-lg border border-slate-200 bg-white shadow-soft", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("space-y-2 p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-lg font-semibold leading-tight text-slate-950", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm leading-6 text-slate-600", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
