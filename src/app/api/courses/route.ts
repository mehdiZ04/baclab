import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Fetch all course modules with their chapters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const modules = await prisma.courseModule.findMany({
      include: {
        chapters: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST - Create a new course module
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== "admin" && session.user?.role !== "instructor")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { moduleNumber, title, description, order } = body;

    if (!moduleNumber && moduleNumber !== 0) {
      return NextResponse.json(
        { error: "Module number is required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const module = await prisma.courseModule.create({
      data: {
        moduleNumber,
        title,
        description,
        order: order ?? moduleNumber,
      },
      include: {
        chapters: true,
      },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error("Error creating course module:", error);
    return NextResponse.json(
      { error: "Failed to create course module" },
      { status: 500 }
    );
  }
}
