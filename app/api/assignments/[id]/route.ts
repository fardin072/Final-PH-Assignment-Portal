import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Assignment from "@/models/Assignment";
import { Assignment as AssignmentType } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const assignment = await Assignment.findById(params.id).lean();

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const formattedAssignment: AssignmentType = {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline.toISOString(),
      instructorId: assignment.instructorId.toString(),
      instructorName: assignment.instructorName,
      createdAt: assignment.createdAt.toISOString(),
    };

    return NextResponse.json(formattedAssignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}