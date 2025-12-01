import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
    }

    if (!stripe) {
      console.error("Stripe is not configured - STRIPE_SECRET_KEY missing");
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
      try {
        const account = await stripe.accounts.create({
          type: "express",
          email: dbUser.email,
        });

        accountId = account.id;

        await prisma.user.update({
          where: { id: dbUser.id },
          data: { stripeAccountId: accountId },
        });
      } catch (stripeError: any) {
        console.error("Stripe account creation failed:", stripeError);
        return NextResponse.json(
          { error: `Failed to create Stripe account: ${stripeError.message || "Unknown error"}` },
          { status: 500 },
        );
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${baseUrl}/dashboard/payments`,
        return_url: `${baseUrl}/dashboard/payments`,
        type: "account_onboarding",
      });

      return NextResponse.json({ url: accountLink.url });
    } catch (stripeError: any) {
      console.error("Stripe account link creation failed:", stripeError);
      return NextResponse.json(
        { error: `Failed to create Stripe onboarding link: ${stripeError.message || "Unknown error"}` },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Unexpected error in Stripe connect:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}


