"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AuthPanel() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  useEffect(() => {
    const reason = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("error");
    if (!supabase) {
      showStatus("warning", "Sign in is not configured yet.");
      return undefined;
    }

    if (reason === "auth_required") showStatus("info", "Sign in to continue.");
    if (reason === "auth_not_configured") showStatus("warning", "Sign in is not configured yet.");

    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!cooldownUntil) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  async function submit(event) {
    event.preventDefault();
    showStatus("info", "");

    if (!supabase) return;

    if (cooldownSeconds > 0) {
      showStatus("warning", `Try again in ${cooldownSeconds} seconds.`);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      showStatus("error", "Enter your email and password.");
      return;
    }

    if (password.length < 6) {
      showStatus("error", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const nextPath = getNextPath();
    const action = mode === "signin"
      ? supabase.auth.signInWithPassword({ email: normalizedEmail, password })
      : supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
          }
        });

    const { data, error } = await action;
    setLoading(false);

    if (error) {
      handleAuthError(error);
      return;
    }

    if (mode === "signin" || data.session) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    showStatus("success", "Check your email to confirm your account.");
  }

  async function signOut() {
    setLoading(true);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setLoading(false);
    setUser(null);
    showStatus("success", "Signed out.");
    router.refresh();
  }

  function handleAuthError(error) {
    const seconds = rateLimitSeconds(error);
    if (seconds > 0) {
      setCooldownUntil(Date.now() + seconds * 1000);
      setNow(Date.now());
      showStatus("warning", `Too many attempts. Try again in ${seconds} seconds.`);
      return;
    }

    showStatus("error", normalizeAuthError(error.message));
  }

  function showStatus(type, message) {
    setStatusType(type);
    setStatus(message);
  }

  if (!supabase) {
    return (
      <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-6 text-center shadow-sm">
        <LogoHeader title="Sign in unavailable" />
        <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">
          Authentication is not configured for this deployment.
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-6 shadow-sm">
        <LogoHeader title="Account" />
        <div className="mt-6 rounded-xl border border-[var(--site-border)] bg-[var(--site-surface-2)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--site-muted)]">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--site-heading)]">{user.email}</p>
        </div>
        <Button className="mt-5 w-full" variant="outline" onClick={signOut} disabled={loading}>
          {loading && <Loader2 className="animate-spin" size={16} aria-hidden="true" />}
          {loading ? "Signing out..." : "Sign out"}
        </Button>
        <StatusMessage type={statusType} message={status} />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-6 shadow-sm">
      <LogoHeader title={mode === "signin" ? "Sign in" : "Create account"} />

      <div className="mt-6 grid grid-cols-2 rounded-lg bg-[var(--site-surface-2)] p-1">
        <button
          type="button"
          className={cn(
            "h-9 rounded-md text-sm font-semibold transition",
            mode === "signin" ? "bg-[var(--site-surface)] text-[var(--site-heading)] shadow-sm" : "text-[var(--site-muted)] hover:text-[var(--site-heading)]"
          )}
          onClick={() => {
            setMode("signin");
            showStatus("info", "");
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={cn(
            "h-9 rounded-md text-sm font-semibold transition",
            mode === "signup" ? "bg-[var(--site-surface)] text-[var(--site-heading)] shadow-sm" : "text-[var(--site-muted)] hover:text-[var(--site-heading)]"
          )}
          onClick={() => {
            setMode("signup");
            showStatus("info", "");
          }}
        >
          Sign up
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--site-text)]">Email</span>
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--site-text)]">Password</span>
          <Input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
        </label>
      </div>

      <Button className="mt-5 w-full" type="submit" disabled={loading || cooldownSeconds > 0}>
        {loading && <Loader2 className="animate-spin" size={16} aria-hidden="true" />}
        {loading
          ? "Please wait..."
          : cooldownSeconds > 0
            ? `Try again in ${cooldownSeconds}s`
            : mode === "signin" ? "Sign in" : "Create account"}
      </Button>

      <StatusMessage type={statusType} message={status} />
    </form>
  );
}

function LogoHeader({ title }) {
  return (
    <div className="text-center">
      <img src="/logo.png" alt="01 Interview" className="mx-auto h-16 w-auto object-contain" />
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--site-heading)]">{title}</h1>
    </div>
  );
}

function getNextPath() {
  if (typeof window === "undefined") return "/workspace";
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//") || /[\r\n]/.test(next)) return "/workspace";
  return next;
}

function StatusMessage({ type, message }) {
  if (!message) return null;
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={cn(
        "mt-4 flex items-start gap-2 rounded-md border p-3 text-sm leading-6",
        type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        type === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        type === "error" && "border-red-200 bg-red-50 text-red-800",
        type === "info" && "border-blue-200 bg-blue-50 text-blue-800"
      )}
      role={type === "error" || type === "warning" ? "alert" : "status"}
      aria-live="polite"
    >
      <Icon className="mt-0.5 flex-none" size={16} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

function rateLimitSeconds(error) {
  const message = String(error?.message || "");
  if (error?.status !== 429 && !/rate|too many|security purposes/i.test(message)) return 0;
  const match = message.match(/(\d+)\s*seconds?/i);
  return match ? Math.min(300, Math.max(15, Number(match[1]))) : 60;
}

function normalizeAuthError(message) {
  const text = String(message || "Authentication failed.");
  if (/invalid login credentials/i.test(text)) return "Invalid email or password.";
  if (/email not confirmed/i.test(text)) return "Confirm your email before signing in.";
  return text;
}
