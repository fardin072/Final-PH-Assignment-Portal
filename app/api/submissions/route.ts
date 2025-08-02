import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import Assignment from "@/models/Assignment";
import User from "@/models/User";
import { CreateSubmissionRequest, Submission as SubmissionType } from "@/lib/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'instructor') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const submissions = await Submission.find()
      .populate('assignmentId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    const formattedSubmissions: SubmissionType[] = submissions.map((submission) => ({
      id: submission._id.toString(),
      assignmentId: submission.assignmentId._id.toString(),
      studentId: submission.studentId.toString(),
      studentName: submission.studentName,
      submissionUrl: submission.submissionUrl,
      note: submission.note,
      status: submission.status,
      feedback: submission.feedback,
      submittedAt: submission.submittedAt.toISOString(),
      reviewedAt: submission.reviewedAt ? submission.reviewedAt.toISOString() : undefined,
    }));

    return NextResponse.json(formattedSubmissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assignmentId, submissionUrl, note }: CreateSubmissionRequest = await request.json();

    if (!assignmentId || !submissionUrl || !note) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check if student already submitted for this assignment
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: session.user.id,
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted for this assignment" },
        { status: 400 }
      );
    }

    const student = await User.findById(session.user.id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const newSubmission = new Submission({
      assignmentId,
      studentId: session.user.id,
      studentName: student.name,
      submissionUrl,
      note,
      status: 'pending',
      submittedAt: new Date(),
    });

    await newSubmission.save();

    const formattedSubmission: SubmissionType = {
      id: newSubmission._id.toString(),
      assignmentId: newSubmission.assignmentId.toString(),
      studentId: newSubmission.studentId.toString(),
      studentName: newSubmission.studentName,
      submissionUrl: newSubmission.submissionUrl,
      note: newSubmission.note,
      status: newSubmission.status,
      submittedAt: newSubmission.submittedAt.toISOString(),
    };

    return NextResponse.json(formattedSubmission, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}