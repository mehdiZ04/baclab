import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch a specific recorded session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const recordedSession = await prisma.recordedSession.findUnique({
      where: {
        id: id,
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

    if (!recordedSession) {
      return NextResponse.json(
        { error: "Recorded session not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.recordedSession.update({
      where: {
        id: id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(recordedSession);
  } catch (error) {
    console.error("Error fetching recorded session:", error);
    return NextResponse.json(
      { error: "Failed to fetch recorded session" },
      { status: 500 }
    );
  }
}

// PATCH - Update a recorded session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const recordedSession = await prisma.recordedSession.update({
      where: {
        id: id,
      },
      data: {
        ...body,
        recordedDate: body.recordedDate ? new Date(body.recordedDate) : undefined,
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

    return NextResponse.json(recordedSession);
  } catch (error) {
    console.error("Error updating recorded session:", error);
    return NextResponse.json(
      { error: "Failed to update recorded session" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a recorded session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.recordedSession.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: "Recorded session deleted successfully" });
  } catch (error) {
    console.error("Error deleting recorded session:", error);
    return NextResponse.json(
      { error: "Failed to delete recorded session" },
      { status: 500 }
    );
  }
}
