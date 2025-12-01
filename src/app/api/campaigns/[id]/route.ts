import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  story: z.string().min(20).optional(),
  goalAmount: z.number().int().positive().optional(),
  coverImage: z.string().url().optional().or(z.literal("")).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CLOSED"]).optional(),
});

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteProps) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      donations: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ campaign });
}

export async function PATCH(req: Request, { params }: RouteProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.campaign.findUnique({
    where: { id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.ownerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const json = await req.json();
    const parsed = updateSchema.parse({
      ...json,
      goalAmount: json.goalAmount !== undefined ? Number(json.goalAmount) : undefined,
    });

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...parsed,
        coverImage: parsed.coverImage === "" ? null : parsed.coverImage,
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.campaign.findUnique({
    where: { id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.ownerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.donation.deleteMany({ where: { campaignId: id } });
  await prisma.campaign.delete({ where: { id } });

  return NextResponse.json({ success: true });
}


