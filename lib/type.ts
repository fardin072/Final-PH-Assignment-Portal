export type UserRole = 'instructor' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
}

export type SubmissionStatus = 'pending' | 'accepted' | 'rejected';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  instructorId: string;
  instructorName: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionUrl: string;
  note: string;
  status: SubmissionStatus;
  feedback?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  deadline: string;
}

export interface CreateSubmissionRequest {
  assignmentId: string;
  submissionUrl: string;
  note: string;
}

export interface UpdateSubmissionRequest {
  status: SubmissionStatus;
  feedback?: string;
}

export interface SubmissionStats {
  pending: number;
  accepted: number;
  rejected: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}