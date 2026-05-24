"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, LogIn, ShieldCheck, UserPlus } from "lucide-react";
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
      showStatus("warning", "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return undefined;
    }

    if (reason === "auth_required") showStatus("info", "Sign in to continue.");
    if (reason === "auth_not_configured") showStatus("warning", "Supabase auth is not configured for protected routes.");

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

    if (!supabase) {
      return;
    }

    if (cooldownSeconds > 0) {
      showStatus("warning", `Supabase is rate-limiting this auth action. Try again in ${cooldownSeconds} seconds.`);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      showStatus("error", "Email and password are required.");
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
      showStatus("success", "Signed in. Redirecting...");
      router.replace(nextPath);
      router.refresh();
      return;
    }

    showStatus("success", "Account created. Check your email to confirm the account, then sign in.");
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

  if (!supabase) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 text-amber-700" size={20} aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold tracking-normal text-amber-950">Auth Configuration Required</h2>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, then restart the app. Protected pages are intentionally blocked until Supabase is configured.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-700">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-normal text-slate-950">Signed In</h2>
            <p className="mt-1 truncate text-sm leading-6 text-slate-600">{user.email}</p>
          </div>
        </div>
        <Button className="mt-6 w-full" variant="outline" onClick={signOut} disabled={loading}>
          {loading ? "Signing out..." : "Sign out"}
        </Button>
        <StatusMessage type={statusType} message={status} />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-normal text-slate-950">{mode === "signin" ? "Sign in" : "Create account"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use the same account to access protected tools and future premium content.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
        <Button
          type="button"
          variant={mode === "signin" ? "default" : "secondary"}
          className="border-transparent"
          onClick={() => {
            setMode("signin");
            showStatus("info", "");
          }}
        >
          <LogIn size={16} aria-hidden="true" />
          Sign in
        </Button>
        <Button
          type="button"
          variant={mode === "signup" ? "default" : "secondary"}
          className="border-transparent"
          onClick={() => {
            setMode("signup");
            showStatus("info", "");
          }}
        >
          <UserPlus size={16} aria-hidden="true" />
          Sign up
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
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
          <span className="text-sm font-medium text-slate-700">Password</span>
          <Input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
          />
        </label>
      </div>

      <Button className="mt-6 w-full" type="submit" disabled={loading || cooldownSeconds > 0}>
        {loading && <Loader2 className="animate-spin" size={16} aria-hidden="true" />}
        {loading
          ? "Working..."
          : cooldownSeconds > 0
            ? `Try again in ${cooldownSeconds}s`
            : mode === "signin" ? "Sign in" : "Create account"}
      </Button>

      <StatusMessage type={statusType} message={status} />

      {mode === "signup" && (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Supabase sends a confirmation email for new accounts. Repeated sign-up attempts can trigger provider rate limits.
        </p>
      )}
    </form>
  );

  function handleAuthError(error) {
    const seconds = rateLimitSeconds(error);
    if (seconds > 0) {
      setCooldownUntil(Date.now() + seconds * 1000);
      setNow(Date.now());
      showStatus("warning", `Supabase rate limit reached. Wait ${seconds} seconds before trying again. If the account was just created, check your inbox and then use Sign in.`);
      return;
    }

    showStatus("error", normalizeAuthError(error.message));
  }

  function showStatus(type, message) {
    setStatusType(type);
    setStatus(message);
  }
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
  if (/email not confirmed/i.test(text)) return "Email is not confirmed yet. Check your inbox for the confirmation link.";
  return text;
}
