import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch all recorded sessions or filter by date/category
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const category = searchParams.get("category");

    let whereClause: any = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.recordedDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (category && category !== "all") {
      whereClause.category = category;
    }

    const recordedSessions = await prisma.recordedSession.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        recordedDate: "desc",
      },
    });

    return NextResponse.json(recordedSessions);
  } catch (error) {
    console.error("Error fetching recorded sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch recorded sessions" },
      { status: 500 }
    );
  }
}

// POST - Create a new recorded session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from database to ensure we have the correct ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      recordedDate,
      duration,
      size,
      category,
      videoUrl,
      thumbnailUrl,
    } = body;

    if (!title || !recordedDate || !duration || !videoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const recordedSession = await prisma.recordedSession.create({
      data: {
        title,
        description,
        recordedDate: new Date(recordedDate),
        duration,
        size: size || "N/A",
        category: category || "General",
        videoUrl,
        thumbnailUrl,
        downloadUrl: null,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(recordedSession, { status: 201 });
  } catch (error) {
    console.error("Error creating recorded session:", error);
    return NextResponse.json(
      { error: "Failed to create recorded session" },
      { status: 500 }
    );
  }
}
