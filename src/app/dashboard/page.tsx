import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import NewCampaignForm from "@/components/NewCampaignForm";
import CampaignStatusControls from "@/components/CampaignStatusControls";
import CopyLinkButton from "@/components/CopyLinkButton";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    sort?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { status, sort } = await searchParams;

  const where: any = { ownerId: user.id };
  if (status && status !== "ALL") {
    where.status = status;
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "amount") {
    orderBy = { raisedAmount: "desc" };
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your campaigns
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Create and manage your fundraising campaigns.
          </p>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-900">
            Start a new campaign
          </h2>
          <NewCampaignForm />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-zinc-900">
              Existing campaigns
            </h2>
            <form className="flex gap-2 text-xs" action="/dashboard" method="GET">
              <select
                name="status"
                defaultValue={status ?? "ALL"}
                className="rounded-full border border-zinc-300 bg-white px-2 py-1 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select
                name="sort"
                defaultValue={sort ?? "newest"}
                className="rounded-full border border-zinc-300 bg-white px-2 py-1 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="newest">Newest</option>
                <option value="amount">Most raised</option>
              </select>
              <button
                type="submit"
                className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800"
              >
                Apply
              </button>
            </form>
          </div>
          {campaigns.length === 0 ? (
            <p className="text-sm text-zinc-600">
              You haven&apos;t created any campaigns yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {campaigns.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-900">{c.title}</p>
                    <p className="text-xs text-zinc-500">
                      Goal: ${(c.goalAmount / 100).toLocaleString()} • Raised: $
                      {(c.raisedAmount / 100).toLocaleString()}
                    </p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width:
                            c.goalAmount > 0
                              ? `${Math.min(
                                  100,
                                  Math.round((c.raisedAmount / c.goalAmount) * 100),
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs sm:flex-row sm:items-center">
                    <CampaignStatusControls id={c.id} status={c.status} />
                    <CopyLinkButton slug={c.slug} />
                    <Link
                      href={`/campaigns/${c.slug}`}
                      className="rounded-full border border-zinc-300 px-3 py-1 hover:border-zinc-900"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}


