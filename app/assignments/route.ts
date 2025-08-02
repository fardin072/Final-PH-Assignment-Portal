import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { connectDB } from "../../lib/db";
import Assignment from "@/models/Assignment";
import User from "../../models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .lean();

    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline.toISOString(),
      instructorId: assignment.instructorId.toString(),
      instructorName: assignment.instructorName,
      createdAt: assignment.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'instructor') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, deadline } = await request.json();

    await connectDB();

    const instructor = await User.findById(session.user.id);
    if (!instructor) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    const newAssignment = new Assignment({
      title,
      description,
      deadline: new Date(deadline),
      instructorId: session.user.id,
      instructorName: instructor.name,
    });

    await newAssignment.save();

    const formattedAssignment = {
      id: newAssignment._id.toString(),
      title: newAssignment.title,
      description: newAssignment.description,
      deadline: newAssignment.deadline.toISOString(),
      instructorId: newAssignment.instructorId.toString(),
      instructorName: newAssignment.instructorName,
      createdAt: newAssignment.createdAt.toISOString(),
    };

    return NextResponse.json(formattedAssignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}