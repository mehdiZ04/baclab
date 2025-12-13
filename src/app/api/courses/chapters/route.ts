import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST - Create a new chapter/video in a module
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== "admin" && session.user?.role !== "instructor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { moduleId, title, description, videoUrl, duration, order } = body;

    if (!moduleId || !title || !videoUrl) {
      return NextResponse.json(
        { error: "Module ID, title, and video URL are required" },
        { status: 400 }
      );
    }

    const chapter = await prisma.courseChapter.create({
      data: {
        moduleId,
        title,
        description,
        videoUrl,
        duration,
        order: order ?? 0,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error("Error creating chapter:", error);
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chapter
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== "admin" && session.user?.role !== "instructor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("id");

    if (!chapterId) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 }
      );
    }

    await prisma.courseChapter.delete({
      where: {
        id: chapterId,
      },
    });

    return NextResponse.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}

// PATCH - Increment view count
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { chapterId } = body;

    if (!chapterId) {
      return NextResponse.json(
        { error: "Chapter ID is required" },
        { status: 400 }
      );
    }

    const chapter = await prisma.courseChapter.update({
      where: {
        id: chapterId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Error updating chapter views:", error);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}
