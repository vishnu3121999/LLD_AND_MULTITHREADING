"use client";

import { useEffect, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { fileStorageGetItem, fileStorageRemoveItem, fileStorageSetItem, migrateLegacyBrowserStorage } from "../lib/file-storage-client";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AuthPanel() {
  const supabase = getSupabaseBrowserClient();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDemoUser() {
      await migrateLegacyBrowserStorage();
      const demoUser = await fileStorageGetItem("lld-playbook.demo-user");
      if (!cancelled && demoUser) setUser({ email: demoUser, demo: true });
    }

    if (!supabase) {
      loadDemoUser();
      return () => {
        cancelled = true;
      };
    }

    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.subscription.unsubscribe();
  }, [supabase]);

  async function submit(event) {
    event.preventDefault();
    setStatus("");

    if (!supabase) {
      await fileStorageSetItem("lld-playbook.demo-user", email);
      setUser({ email, demo: true });
      setStatus("Demo session created. Add Supabase env vars for production auth.");
      return;
    }

    const action = mode === "signin"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });

    const { error } = await action;
    setStatus(error ? error.message : mode === "signin" ? "Signed in" : "Check your email to confirm the account");
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    await fileStorageRemoveItem("lld-playbook.demo-user");
    setUser(null);
    setStatus("Signed out");
  }

  if (user) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold tracking-normal text-slate-950">Account</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{user.email}</p>
        {user.demo && <p className="mt-2 text-sm leading-6 text-amber-700">Demo auth is active because Supabase keys are not configured.</p>}
        <Button className="mt-5" variant="outline" onClick={signOut}>Sign out</Button>
        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex gap-2">
        <Button type="button" variant={mode === "signin" ? "default" : "outline"} onClick={() => setMode("signin")}>
          <LogIn size={16} aria-hidden="true" />
          Sign in
        </Button>
        <Button type="button" variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>
          <UserPlus size={16} aria-hidden="true" />
          Sign up
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <Input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
      </div>
      <Button className="mt-6 w-full" type="submit">
        {mode === "signin" ? "Sign in" : "Create account"}
      </Button>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        Configure Supabase URL and anon key to use real auth. Without keys, this page uses a local demo session.
      </p>
      {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
    </form>
  );
}
