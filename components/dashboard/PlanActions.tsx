"use client";

import { useState } from "react";

export function UpgradeButton({ plan, label }: { plan: "pro" | "agency"; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  }

  return (
    <button onClick={handleUpgrade} disabled={loading} className="btn-primary">
      {loading ? "Cargando..." : label}
    </button>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-secondary">
      {loading ? "Cargando..." : "Gestionar facturación"}
    </button>
  );
}
