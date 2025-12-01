import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, featured] = await Promise.all([
    prisma.campaign.aggregate({
      _sum: { raisedAmount: true },
      _count: true,
    }),
    prisma.campaign.findMany({
      orderBy: { raisedAmount: "desc" },
      take: 3,
    }),
  ]);

  const totalRaised = (stats._sum.raisedAmount ?? 0) / 100;
  const totalCampaigns = stats._count;

  return (
    <div className="space-y-12">
      <section className="mt-8 grid gap-8 md:grid-cols-[3fr,2fr] md:items-center">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
            Raise money for what matters most.
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            Start a campaign in minutes to support medical bills, education,
            community projects, and more. Share your story and let people help.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="/dashboard"
              className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Start a campaign
            </a>
            <a
              href="/campaigns"
              className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-800 hover:border-zinc-900"
            >
              Explore campaigns
            </a>
          </div>
          <p className="mt-4 text-sm text-zinc-600">
            Over{" "}
            <span className="font-semibold">
              ${totalRaised.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>{" "}
            raised across{" "}
            <span className="font-semibold">{totalCampaigns.toLocaleString()}</span>{" "}
            campaigns on this platform.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-700">
            How it works
          </p>
          <div className="mt-3 grid gap-3 text-sm text-zinc-600">
            <div className="flex gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                1
              </div>
              <div>
                <p className="font-medium text-zinc-900">Create your campaign</p>
                <p className="text-xs text-zinc-600">
                  Tell your story, set a goal, and add a cover image in just a few
                  steps.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                2
              </div>
              <div>
                <p className="font-medium text-zinc-900">Share with your community</p>
                <p className="text-xs text-zinc-600">
                  Share your link with friends, family, and supporters on social
                  media.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                3
              </div>
              <div>
                <p className="font-medium text-zinc-900">Receive secure donations</p>
                <p className="text-xs text-zinc-600">
                  Track progress in real time as people support your campaign.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">
              Featured campaigns
            </h2>
            <Link
              href="/campaigns"
              className="text-xs font-medium text-zinc-700 hover:text-zinc-900"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((c) => {
              const progress =
                c.goalAmount > 0
                  ? Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100))
                  : 0;
              return (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-900"
                >
                  {c.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.coverImage}
                      alt={c.title}
                      className="h-32 w-full object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:underline">
                      {c.title}
                    </h3>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-700">
                      <span className="font-semibold">
                        ${(c.raisedAmount / 100).toLocaleString()}
                      </span>{" "}
                      raised of ${(c.goalAmount / 100).toLocaleString()} goal
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
