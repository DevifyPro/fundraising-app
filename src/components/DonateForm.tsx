"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  campaignId: string;
  disabled?: boolean;
};

export default function DonateForm({ campaignId, disabled }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState("25");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setError(null);
    setLoading(true);
    try {
      const cents = Math.round(Number(amount) * 100);
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          amount: cents,
          name,
          message,
          isAnonymous,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Donation failed");
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url as string;
      } else {
        setError("Could not start checkout session");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-3 text-sm">
      <div>
        <label className="block text-xs font-medium text-zinc-700">
          Amount (USD)
        </label>
        <div className="mt-1 flex gap-2">
          {[10, 25, 50, 100].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className={`flex-1 rounded-full border px-2 py-1 text-xs ${
                amount === String(preset)
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-zinc-300 text-zinc-700 hover:border-zinc-900"
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-700">
          Name (optional)
        </label>
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isAnonymous}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-700">
          Message (optional)
        </label>
        <textarea
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-zinc-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        Give anonymously
      </label>
      <p className="text-[11px] text-zinc-500">
        Many people give around <span className="font-medium">$25</span>, but any
        amount helps.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={disabled || loading}
        className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-70"
      >
        {disabled
          ? "Campaign not accepting donations"
          : loading
            ? "Processing..."
            : "Donate now"}
      </button>
    </form>
  );
}


