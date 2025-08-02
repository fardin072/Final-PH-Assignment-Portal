import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import { SubmissionStats } from "@/lib/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const [pendingCount, acceptedCount, rejectedCount] = await Promise.all([
      Submission.countDocuments({ status: 'pending' }),
      Submission.countDocuments({ status: 'accepted' }),
      Submission.countDocuments({ status: 'rejected' }),
    ]);

    const stats: SubmissionStats = {
      pending: pendingCount,
      accepted: acceptedCount,
      rejected: rejectedCount,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}