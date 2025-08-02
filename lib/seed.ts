import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import User from '@/models/User';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';

export async function seedDatabase() {
  try {
    await connectDB();

    // Check if already seeded
    const existingAssignments = await Assignment.countDocuments();
    if (existingAssignments > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database...');

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const instructor = await User.create({
      email: 'instructor@example.com',
      password: hashedPassword,
      name: 'Dr. Sarah Johnson',
      role: 'instructor',
    });

    const instructor2 = await User.create({
      email: 'prof.wilson@example.com',
      password: hashedPassword,
      name: 'Prof. Michael Wilson',
      role: 'instructor',
    });

    const student1 = await User.create({
      email: 'student@example.com',
      password: hashedPassword,
      name: 'John Smith',
      role: 'student',
    });

    const student2 = await User.create({
      email: 'emily.davis@example.com',
      password: hashedPassword,
      name: 'Emily Davis',
      role: 'student',
    });

    // Create demo assignments
    const assignment1 = await Assignment.create({
      title: 'React Components Assignment',
      description: 'Create a set of reusable React components using modern hooks and TypeScript. Focus on component composition and proper prop typing.\n\nRequirements:\n- Build at least 5 different components\n- Use TypeScript for all components\n- Include proper prop validation\n- Add unit tests using Jest\n- Document components with JSDoc\n\nDeliverables:\n- GitHub repository with source code\n- Live demo deployed on Netlify/Vercel\n- README with setup instructions',
      deadline: new Date('2024-03-15'),
      instructorId: instructor._id,
      instructorName: instructor.name,
    });

    const assignment2 = await Assignment.create({
      title: 'Database Design Project',
      description: 'Design and implement a normalized database schema for an e-commerce application. Include entity relationships and sample queries.',
      deadline: new Date('2024-03-20'),
      instructorId: instructor._id,
      instructorName: instructor.name,
    });

    const assignment3 = await Assignment.create({
      title: 'Algorithm Analysis',
      description: 'Analyze the time and space complexity of various sorting algorithms. Provide implementations and performance comparisons.',
      deadline: new Date('2024-03-25'),
      instructorId: instructor2._id,
      instructorName: instructor2.name,
    });

    // Create demo submissions
    await Submission.create({
      assignmentId: assignment1._id,
      studentId: student1._id,
      studentName: student1.name,
      submissionUrl: 'https://github.com/johnsmith/react-components',
      note: 'Implemented all required components with proper TypeScript typing and comprehensive unit tests.',
      status: 'accepted',
      feedback: 'Excellent work! Your components are well-structured and the TypeScript usage is exemplary.',
      submittedAt: new Date('2024-02-10'),
      reviewedAt: new Date('2024-02-12'),
    });

    await Submission.create({
      assignmentId: assignment2._id,
      studentId: student1._id,
      studentName: student1.name,
      submissionUrl: 'https://github.com/johnsmith/ecommerce-db',
      note: 'Complete database schema with normalization and sample data.',
      status: 'pending',
      submittedAt: new Date('2024-02-18'),
    });

    await Submission.create({
      assignmentId: assignment1._id,
      studentId: student2._id,
      studentName: student2.name,
      submissionUrl: 'https://github.com/emilydavis/react-components',
      note: 'Created components as requested. Some challenges with TypeScript but managed to complete requirements.',
      status: 'rejected',
      feedback: 'Good effort, but several components lack proper error handling. Please revise and resubmit.',
      submittedAt: new Date('2024-02-11'),
      reviewedAt: new Date('2024-02-13'),
    });

    console.log('Database seeded successfully!');
    console.log('Demo accounts:');
    console.log('Instructor: instructor@example.com / password123');
    console.log('Student: student@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
