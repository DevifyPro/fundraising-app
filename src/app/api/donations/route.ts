import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const donationSchema = z.object({
  campaignId: z.string().cuid(),
  amount: z.number().int().positive(),
  name: z.string().max(100).optional(),
  message: z.string().max(300).optional(),
  isAnonymous: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = donationSchema.parse({
      ...json,
      amount: Math.round(Number(json.amount)),
    });

    const campaign = await prisma.campaign.findUnique({
      where: { id: parsed.campaignId },
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

    // Legacy/test endpoint: still supports instant test donations without Stripe.
    const user = await getCurrentUser();
    const donation = await prisma.donation.create({
      data: {
        amount: parsed.amount,
        donorName: parsed.isAnonymous ? null : parsed.name,
        donorMessage: parsed.message,
        isAnonymous: parsed.isAnonymous ?? false,
        status: "SUCCEEDED",
        campaignId: parsed.campaignId,
        donorId: user?.id,
      },
    });

    await prisma.campaign.update({
      where: { id: parsed.campaignId },
      data: {
        raisedAmount: {
          increment: parsed.amount,
        },
      },
    });

    return NextResponse.json({ donation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


