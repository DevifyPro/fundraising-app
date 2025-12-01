import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not set" },
      { status: 500 },
    );
  }

  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook error", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const metadata = session.metadata || {};

    const campaignId = metadata.campaignId as string | undefined;
    const userId = (metadata.userId as string | undefined) || null;
    const isAnonymous = metadata.isAnonymous === "true";
    const donorName = (metadata.donorName as string | undefined) || null;
    const donorMessage = (metadata.donorMessage as string | undefined) || null;

    const amountTotal = session.amount_total as number | null;

    if (campaignId && amountTotal) {
      await prisma.$transaction(async (tx) => {
        await tx.donation.create({
          data: {
            amount: amountTotal,
            donorName: isAnonymous ? null : donorName,
            donorMessage,
            isAnonymous,
            status: "SUCCEEDED",
            campaignId,
            donorId: userId,
          },
        });

        await tx.campaign.update({
          where: { id: campaignId },
          data: {
            raisedAmount: {
              increment: amountTotal,
            },
          },
        });
      });
    }
  }

  return NextResponse.json({ received: true });
}


