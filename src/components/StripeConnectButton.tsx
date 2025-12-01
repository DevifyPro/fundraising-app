"use client";

import { useState } from "react";

type Props = {
  isConnected: boolean;
};

export default function StripeConnectButton({ isConnected }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/stripe/connect", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to connect Stripe");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-70"
    >
      {loading
        ? "Loading..."
        : isConnected
          ? "Manage Stripe account"
          : "Connect Stripe"}
    </button>
  );
}

