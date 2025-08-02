import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import { Submission as SubmissionType } from "@/lib/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const submissions = await Submission.find({ studentId: session.user.id })
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
    console.error('Error fetching user submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}