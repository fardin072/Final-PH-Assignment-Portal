import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import { UpdateSubmissionRequest, Submission as SubmissionType } from "@/lib/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'instructor') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, feedback }: UpdateSubmissionRequest = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const submission = await Submission.findById(params.id);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    submission.status = status;
    submission.feedback = feedback;
    submission.reviewedAt = new Date();

    await submission.save();

    const formattedSubmission: SubmissionType = {
      id: submission._id.toString(),
      assignmentId: submission.assignmentId.toString(),
      studentId: submission.studentId.toString(),
      studentName: submission.studentName,
      submissionUrl: submission.submissionUrl,
      note: submission.note,
      status: submission.status,
      feedback: submission.feedback,
      submittedAt: submission.submittedAt.toISOString(),
      reviewedAt: submission.reviewedAt ? submission.reviewedAt.toISOString() : undefined,
    };

    return NextResponse.json(formattedSubmission);
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}