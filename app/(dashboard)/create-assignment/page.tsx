"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CalendarIcon, BookOpen, FileText, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CreateAssignmentRequest } from '@/lib/types';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const assignmentData: CreateAssignmentRequest = {
        title,
        description,
        deadline: new Date(deadline).toISOString(),
      };

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      });

      if (response.ok) {
        toast({
          title: 'Assignment created',
          description: 'Your assignment has been created successfully.',
        });
        router.push('/assignments');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create assignment. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today) for deadline
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span>Create New Assignment</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Create a new assignment for your students to complete.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Assignment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                Assignment Title *
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter assignment title"
                required
                className="text-base"
              />
              <p className="text-sm text-gray-500">
                Choose a clear, descriptive title for your assignment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed instructions for the assignment..."
                required
                rows={6}
                className="text-base resize-none"
              />
              <p className="text-sm text-gray-500">
                Include objectives, requirements, deliverables, and any specific instructions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-base font-medium flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Deadline *</span>
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={today}
                required
                className="text-base"
              />
              <p className="text-sm text-gray-500">
                Set the submission deadline for this assignment
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Assignment'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/assignments')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Guidelines Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Assignment Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p>Be specific about deliverables and submission format</p>
            </div>
            <div className="flex space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p>Include clear evaluation criteria and grading rubric</p>
            </div>
            <div className="flex space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p>Provide adequate time for completion considering complexity</p>
            </div>
            <div className="flex space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p>Include any necessary resources or reference materials</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}