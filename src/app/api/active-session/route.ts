import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Check if user can join a session
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Check if user has an active session
    const activeSession = await prisma.activeUserSession.findUnique({
      where: { userId: user.id },
    });

    if (activeSession) {
      // Check if the active session is recent (within last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
      if (activeSession.lastHeartbeat > fiveMinutesAgo) {
        return NextResponse.json({
          canJoin: false,
          message: "You are already in another session",
          activeSessionId: activeSession.sessionId,
        });
      }
    }

    return NextResponse.json({ canJoin: true });
  } catch (error) {
    console.error("Error checking session access:", error);
    return NextResponse.json(
      { error: "Failed to check session access" },
      { status: 500 }
    );
  }
}

// Join a session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Check if user has an active session
    const activeSession = await prisma.activeUserSession.findUnique({
      where: { userId: user.id },
    });

    if (activeSession) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
      if (activeSession.lastHeartbeat > fiveMinutesAgo) {
        return NextResponse.json(
          { error: "You are already in another session" },
          { status: 403 }
        );
      }
    }

    // Create or update active session
    const newActiveSession = await prisma.activeUserSession.upsert({
      where: { userId: user.id },
      update: {
        sessionId,
        lastHeartbeat: new Date(),
      },
      create: {
        userId: user.id,
        sessionId,
      },
    });

    return NextResponse.json({
      success: true,
      activeSession: newActiveSession,
    });
  } catch (error) {
    console.error("Error joining session:", error);
    return NextResponse.json(
      { error: "Failed to join session" },
      { status: 500 }
    );
  }
}

// Update heartbeat
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update heartbeat
    await prisma.activeUserSession.update({
      where: { userId: user.id },
      data: { lastHeartbeat: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating heartbeat:", error);
    return NextResponse.json(
      { error: "Failed to update heartbeat" },
      { status: 500 }
    );
  }
}

// Leave session
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove active session
    await prisma.activeUserSession.delete({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error leaving session:", error);
    return NextResponse.json(
      { error: "Failed to leave session" },
      { status: 500 }
    );
  }
}
