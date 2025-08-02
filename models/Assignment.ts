import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  description: string;
  deadline: Date;
  instructorId: mongoose.Types.ObjectId;
  instructorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  instructorName: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);