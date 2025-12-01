"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CLOSED";
};

export default function CampaignStatusControls({ id, status }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  async function updateStatus(next: Props["status"]) {
    if (next === current) return;
    setLoading(true);
    try {
      setCurrent(next);
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        // on error, refresh from server state
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">
        {current}
      </span>
      <select
        className="rounded-full border border-zinc-300 bg-white px-2 py-1 text-xs hover:border-zinc-900"
        value={current}
        disabled={loading}
        onChange={(e) => updateStatus(e.target.value as Props["status"])}
      >
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
        <option value="CLOSED">Closed</option>
      </select>
    </div>
  );
}


