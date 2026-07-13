"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "./ui/button";

export function PricingAction({ plan = "premium" }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function checkout() {
    setLoading(true);
    setStatus("");
    const response = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const payload = await response.json();
    setLoading(false);

    if (response.status === 401) {
      window.location.href = "/auth?next=/pricing";
      return;
    }

    if (payload.url) {
      window.location.href = payload.url;
      return;
    }

    setStatus(payload.error || "Unable to start checkout");
  }

  return (
    <div>
      <Button onClick={checkout} disabled={loading} className="w-full">
        <CreditCard size={16} aria-hidden="true" />
        {loading ? "Starting checkout" : "Upgrade"}
      </Button>
      {status && <p className="mt-3 text-sm text-red-700">{status}</p>}
    </div>
  );
}
