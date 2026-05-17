"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const payload = await response.json();
    setLoading(false);
    setStatus(payload.message || (response.ok ? "Subscribed" : "Unable to subscribe"));
    if (response.ok) setEmail("");
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-2 sm:flex-row">
      <Input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
      />
      <Button type="submit" disabled={loading}>
        <Mail size={16} aria-hidden="true" />
        {loading ? "Sending" : "Join"}
      </Button>
      {status && <p className="text-sm text-slate-600 sm:basis-full">{status}</p>}
    </form>
  );
}
