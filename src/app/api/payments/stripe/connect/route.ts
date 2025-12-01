import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server" },
      { status: 500 },
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });
  if (!dbUser) {
    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    );
  }

  let accountId = dbUser.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: dbUser.email,
    });

    accountId = account.id;

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { stripeAccountId: accountId },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/dashboard/payments`,
    return_url: `${baseUrl}/dashboard/payments`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url);
}


