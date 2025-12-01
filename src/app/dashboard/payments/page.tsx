import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StripeConnectButton from "@/components/StripeConnectButton";
import { stripe } from "@/lib/stripe";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      stripeAccountId: true,
      stripeOnboardingComplete: true,
      paypalMerchantId: true,
      paypalOnboardingComplete: true,
      preferredPayoutProvider: true,
    },
  });

  // If we have a Stripe account ID but onboarding isn't marked complete yet,
  // check with Stripe and update once.
  if (
    fullUser?.stripeAccountId &&
    !fullUser.stripeOnboardingComplete &&
    stripe
  ) {
    try {
      const account = await stripe.accounts.retrieve(fullUser.stripeAccountId);
      if (account.details_submitted) {
        fullUser = await prisma.user.update({
          where: { id: user.id },
          data: { stripeOnboardingComplete: true },
          select: {
            stripeAccountId: true,
            stripeOnboardingComplete: true,
            paypalMerchantId: true,
            paypalOnboardingComplete: true,
            preferredPayoutProvider: true,
          },
        });
      }
    } catch (error) {
      console.error("Failed to refresh Stripe onboarding status:", error);
    }
  }

  const stripeConnected = !!fullUser?.stripeOnboardingComplete;
  const paypalConnected = !!fullUser?.paypalOnboardingComplete;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Payout settings
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Connect Stripe and PayPal so donations can go directly to you.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-900">Stripe</h2>
          <p className="mt-1 text-xs text-zinc-600">
            Connect a Stripe account to receive card payments directly.
          </p>
          <div className="mt-3 text-xs text-zinc-700">
            <p>
              Status:{" "}
              <span className="font-medium">
                {stripeConnected ? "Connected" : "Not connected"}
              </span>
            </p>
            {fullUser?.stripeAccountId && (
              <p className="mt-1 text-[11px] text-zinc-500">
                Account ID: {fullUser.stripeAccountId}
              </p>
            )}
          </div>
          <div className="mt-4">
            <StripeConnectButton isConnected={stripeConnected} />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-900">PayPal</h2>
          <p className="mt-1 text-xs text-zinc-600">
            Coming soon: connect PayPal to receive donations via PayPal.
          </p>
          <p className="mt-3 text-xs text-zinc-700">
            Status:{" "}
            <span className="font-medium">
              {paypalConnected ? "Connected" : "Not connected"}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}


