import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const campaignSchema = z.object({
  title: z.string().min(3).max(120),
  story: z.string().min(20),
  goalAmount: z.number().int().positive(),
  coverImage: z.string().url().optional().or(z.literal("")),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { donations: true } },
    },
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = campaignSchema.parse({
      ...json,
      goalAmount: Number(json.goalAmount),
    });

    const slugBase = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;

    const campaign = await prisma.campaign.create({
      data: {
        title: parsed.title,
        slug,
        story: parsed.story,
        goalAmount: parsed.goalAmount,
        coverImage: parsed.coverImage || null,
        startDate: parsed.startDate ? new Date(parsed.startDate) : null,
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
        ownerId: user.id,
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


