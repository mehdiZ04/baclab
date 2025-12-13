import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch all live sessions or filter by date
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    let liveSessions;

    if (date) {
      // Filter by specific date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      liveSessions = await prisma.liveSession.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
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
        orderBy: {
          date: "asc",
        },
      });
    } else {
      // Get all sessions
      liveSessions = await prisma.liveSession.findMany({
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
          date: "asc",
        },
      });
    }

    return NextResponse.json(liveSessions);
  } catch (error) {
    console.error("Error fetching live sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch live sessions" },
      { status: 500 }
    );
  }
}

// POST - Create a new live session
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
      date,
      time,
      duration,
      maxAttendees,
      meetingLink,
      status,
      attendees,
    } = body;

    if (!title || !date || !time || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const liveSession = await prisma.liveSession.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        duration,
        maxAttendees,
        meetingLink,
        status: status || 'upcoming',
        attendees: attendees || 0,
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

    return NextResponse.json(liveSession, { status: 201 });
  } catch (error) {
    console.error("Error creating live session:", error);
    return NextResponse.json(
      { error: "Failed to create live session" },
      { status: 500 }
    );
  }
}
