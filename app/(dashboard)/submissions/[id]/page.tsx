"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ArrowLeft,
  FileText,
  Link as LinkIcon,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Submission, Assignment, UpdateSubmissionRequest, SubmissionStatus } from '@/lib/types';

export default function SubmissionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [status, setStatus] = useState<SubmissionStatus>('pending');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchSubmissionDetails();
    }
  }, [params.id]);

  const fetchSubmissionDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch all submissions to find the one we need
      const submissionsResponse = await fetch('/api/submissions');
      if (submissionsResponse.ok) {
        const submissions = await submissionsResponse.json();
        const targetSubmission = submissions.find((s: Submission) => s.id === params.id);
        
        if (targetSubmission) {
          setSubmission(targetSubmission);
          setStatus(targetSubmission.status);
          setFeedback(targetSubmission.feedback || '');

          // Fetch assignment details
          const assignmentResponse = await fetch(`/api/assignments/${targetSubmission.assignmentId}`);
          if (assignmentResponse.ok) {
            const assignmentData = await assignmentResponse.json();
            setAssignment(assignmentData);
          }
        } else {
          toast({
            title: 'Error',
            description: 'Submission not found',
            variant: 'destructive',
          });
          router.push('/submissions');
        }
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to load submission details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission) return;

    setIsUpdating(true);
    try {
      const updateData: UpdateSubmissionRequest = {
        status,
        feedback: feedback.trim() || undefined,
      };

      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast({
          title: 'Submission updated',
          description: 'The submission has been reviewed successfully.',
        });
        router.push('/submissions');
      } else {
        toast({
          title: 'Update failed',
          description: 'Failed to update submission. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'accepted':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!submission || !assignment) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Submission not found</h3>
        <Link href="/submissions">
          <Button className="mt-4">Back to Submissions</Button>
        </Link>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(submission.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/submissions" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-500">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Submissions</span>
      </Link>

      {/* Submission Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Review Submission
              </CardTitle>
              <div className="space-y-2">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{submission.studentName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800">{assignment.title}</h3>
              </div>
            </div>
            <Badge variant={getStatusColor(submission.status)} className="flex items-center space-x-1">
              <StatusIcon className="h-4 w-4" />
              <span>{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assignment Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Assignment Description</h4>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                  {assignment.description}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Deadline</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(assignment.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Submission Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Submission URL</h4>
                <a 
                  href={submission.submissionUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 text-sm"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span className="break-all">{submission.submissionUrl}</span>
                </a>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Student Note</h4>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                  {submission.note}
                </div>
              </div>
              {submission.feedback && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Previous Feedback</h4>
                  <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg whitespace-pre-wrap">
                    {submission.feedback}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Review & Grade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateSubmission} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Grade Status *</Label>
              <RadioGroup
                value={status}
                onValueChange={(value) => setStatus(value as SubmissionStatus)}
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label 
                    htmlFor="pending" 
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>Pending</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="accepted" id="accepted" />
                  <Label 
                    htmlFor="accepted" 
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Accepted</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="rejected" />
                  <Label 
                    htmlFor="rejected" 
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Rejected</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-base font-medium">
                Feedback {status !== 'pending' && '*'}
              </Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  status === 'accepted' 
                    ? "Provide positive feedback and areas of excellence..."
                    : status === 'rejected'
                    ? "Explain what needs improvement and how to fix issues..."
                    : "Optional feedback for the student..."
                }
                required={status !== 'pending'}
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">
                {status === 'accepted' && "Congratulate the student and highlight what they did well."}
                {status === 'rejected' && "Be constructive and specific about what needs improvement."}
                {status === 'pending' && "You can save this as pending and provide feedback later."}
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? 'Updating...' : 'Update Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/submissions')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}