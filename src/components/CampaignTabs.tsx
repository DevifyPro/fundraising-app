"use client";

import { useState } from "react";

type Donation = {
  id: string;
  amount: number;
  donorName: string | null;
  isAnonymous: boolean;
  createdAt: string | Date;
};

type Props = {
  story: string;
  donations: Donation[];
};

const tabs = ["Story", "Updates", "Donors"] as const;

export default function CampaignTabs({ story, donations }: Props) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Story");

  return (
    <div>
      <div className="flex gap-4 border-b border-zinc-200 text-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`pb-2 text-xs font-medium ${
              active === tab
                ? "border-b-2 border-zinc-900 text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {tab}
            {tab === "Donors" && donations.length > 0 && (
              <span className="ml-1 rounded-full bg-zinc-100 px-1.5 text-[10px] font-medium text-zinc-700">
                {donations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 text-sm text-zinc-800">
        {active === "Story" && (
          <article className="prose prose-sm max-w-none text-zinc-800">
            <p className="whitespace-pre-line">{story}</p>
          </article>
        )}
        {active === "Updates" && (
          <p className="text-xs text-zinc-600">
            No updates yet. Organizers will share news and progress here.
          </p>
        )}
        {active === "Donors" && (
          <>
            {donations.length === 0 ? (
              <p className="text-xs text-zinc-600">
                No donations yet. Be the first to support this campaign.
              </p>
            ) : (
              <ul className="space-y-2 text-xs text-zinc-700">
                {donations.map((d) => (
                  <li key={d.id} className="flex items-baseline justify-between">
                    <span>
                      {d.isAnonymous ? "Anonymous" : d.donorName || "Supporter"}
                    </span>
                    <span className="font-medium">
                      ${(d.amount / 100).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}


