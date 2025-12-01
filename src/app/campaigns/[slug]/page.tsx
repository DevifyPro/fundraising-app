import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DonateForm from "@/components/DonateForm";
import CampaignTabs from "@/components/CampaignTabs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) {
    return {};
  }
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
  });
  if (!campaign) return {};
  return {
    title: `${campaign.title} | Fundraise`,
    description: campaign.story.slice(0, 140),
  };
}

export default async function CampaignPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      owner: { select: { name: true } },
      donations: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!campaign) {
    notFound();
  }

  const progress =
    campaign.goalAmount > 0
      ? Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))
      : 0;

  return (
    <div className="grid gap-8 md:grid-cols-[3fr,2fr]">
      <div className="space-y-4">
        {campaign.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="h-64 w-full rounded-xl object-cover"
          />
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {campaign.title}
          </h1>
          {campaign.raisedAmount >= campaign.goalAmount && campaign.goalAmount > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
              Goal reached
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-600">
          Organized by{" "}
          <span className="font-medium text-zinc-900">
            {campaign.owner?.name ?? "Anonymous"}
          </span>
        </p>
        <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-baseline justify-between text-sm">
            <p className="text-zinc-900">
              <span className="text-xl font-semibold">
                ${(campaign.raisedAmount / 100).toLocaleString()}
              </span>{" "}
              raised
            </p>
            <p className="text-xs text-zinc-600">
              of ${(campaign.goalAmount / 100).toLocaleString()} goal
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {campaign.status === "COMPLETED" && (
            <p className="mt-1 text-xs text-zinc-600">
              This fundraiser has been <span className="font-medium">completed</span>. 
              You can still read the story and see the support it received.
            </p>
          )}
          {campaign.status === "CLOSED" && (
            <p className="mt-1 text-xs text-zinc-600">
              This fundraiser is <span className="font-medium">closed</span> and is no longer accepting donations.
            </p>
          )}
        </div>
        <CampaignTabs story={campaign.story} donations={campaign.donations} />
      </div>
      <aside className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Support this fundraiser
          </h2>
          <DonateForm campaignId={campaign.id} disabled={campaign.status !== "ACTIVE"} />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-zinc-900">
            Recent donations
          </h3>
          {campaign.donations.length === 0 ? (
            <p className="text-xs text-zinc-600">
              No donations yet. Be the first to support this campaign.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-zinc-700">
              {campaign.donations.map((d) => (
                <li key={d.id} className="flex justify-between">
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
        </div>
      </aside>
    </div>
  );
}


