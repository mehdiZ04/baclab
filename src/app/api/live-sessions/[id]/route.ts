import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch a specific live session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const liveSession = await prisma.liveSession.findUnique({
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

    if (!liveSession) {
      return NextResponse.json(
        { error: "Live session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(liveSession);
  } catch (error) {
    console.error("Error fetching live session:", error);
    return NextResponse.json(
      { error: "Failed to fetch live session" },
      { status: 500 }
    );
  }
}

// PATCH - Update a live session
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

    const liveSession = await prisma.liveSession.update({
      where: {
        id: id,
      },
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
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

    return NextResponse.json(liveSession);
  } catch (error) {
    console.error("Error updating live session:", error);
    return NextResponse.json(
      { error: "Failed to update live session" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a live session
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

    await prisma.liveSession.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: "Live session deleted successfully" });
  } catch (error) {
    console.error("Error deleting live session:", error);
    return NextResponse.json(
      { error: "Failed to delete live session" },
      { status: 500 }
    );
  }
}
