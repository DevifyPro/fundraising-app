import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
  }>;
};

export default async function CampaignsPage({ searchParams }: PageProps) {
  const { q, status, sort } = await searchParams;

  const where: any = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (q && q.trim().length > 0) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { story: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "amount") {
    orderBy = { raisedAmount: "desc" };
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy,
    include: {
      _count: { select: { donations: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Explore fundraisers
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Discover campaigns started by people and communities around the world.
          </p>
        </div>
        <form
          className="flex flex-col gap-2 text-sm md:flex-row md:items-center"
          action="/campaigns"
          method="GET"
        >
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by title or story"
            className="w-full rounded-full border border-zinc-300 px-3 py-1.5 text-xs shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 md:w-64"
          />
          <select
            name="status"
            defaultValue={status ?? "ALL"}
            className="w-full rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 md:w-40"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            name="sort"
            defaultValue={sort ?? "newest"}
            className="w-full rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 md:w-40"
          >
            <option value="newest">Newest</option>
            <option value="amount">Most raised</option>
          </select>
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
          >
            Apply
          </button>
        </form>
      </div>
      {campaigns.length === 0 ? (
        <p className="text-sm text-zinc-600">
          No campaigns yet. Be the first to{" "}
          <a href="/dashboard" className="underline">
            start a fundraiser
          </a>
          .
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((c) => {
            const progress =
              c.goalAmount > 0
                ? Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100))
                : 0;
            const daysLeft =
              c.endDate != null
                ? Math.ceil(
                    (new Date(c.endDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24),
                  )
                : null;
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
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:underline">
                      {c.title}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        c.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : c.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-xs text-zinc-600">
                    {c.story}
                  </p>
                  <div className="mt-2 space-y-1">
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
                    <p className="text-[11px] text-zinc-500">
                      {c._count.donations}{" "}
                      {c._count.donations === 1 ? "donor" : "donors"}
                      {daysLeft != null && (
                        <>
                          {" "}
                          •{" "}
                          {daysLeft > 0
                            ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                            : "Ended"}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}


