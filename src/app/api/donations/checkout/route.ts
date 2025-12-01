import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const donationSchema = z.object({
  campaignId: z.string().cuid(),
  amount: z.number().int().positive(),
  name: z.string().max(100).optional(),
  message: z.string().max(300).optional(),
  isAnonymous: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 },
    );
  }

  try {
    const json = await req.json();
    const parsed = donationSchema.parse({
      ...json,
      amount: Math.round(Number(json.amount)),
    });

    const campaign = await prisma.campaign.findUnique({
      where: { id: parsed.campaignId },
      include: {
        owner: true,
      },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    if (campaign.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Campaign is not accepting donations" },
        { status: 400 },
      );
    }

    const owner = campaign.owner;
    if (!owner.stripeAccountId || !owner.stripeOnboardingComplete) {
      return NextResponse.json(
        { error: "Organizer has not connected Stripe yet" },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: parsed.amount,
              product_data: {
                name: campaign.title,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/campaigns/${campaign.slug}?checkout=success`,
        cancel_url: `${baseUrl}/campaigns/${campaign.slug}?checkout=cancelled`,
        metadata: {
          campaignId: campaign.id,
          userId: user?.id ?? "",
          isAnonymous: String(parsed.isAnonymous ?? false),
          donorName: parsed.name ?? "",
          donorMessage: parsed.message ?? "",
        },
      },
      {
        stripeAccount: owner.stripeAccountId,
      },
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


