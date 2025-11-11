import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reportId: string;
  sessionId: string;
  userId: string;
  role: string;
  timestamp: Date;
  overallScore: number;
  categories: {
    content: number;
    clarity: number;
    tone: number;
    bodyLanguage: number;
    fluency: number;
  };
  facial?: any;
  voice?: any;
  posture?: any;
  questionFeedback: any[];
  suggestions: string[];
}

const ReportSchema = new Schema<IReport>({
  reportId: {
    type: String,
    required: true,
    unique: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: false, // Optional for demo mode
    default: 'guest',
    index: true,
  },
  role: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  overallScore: {
    type: Number,
    required: true,
  },
  categories: {
    content: Number,
    clarity: Number,
    tone: Number,
    bodyLanguage: Number,
    fluency: Number,
  },
  facial: Schema.Types.Mixed,
  voice: Schema.Types.Mixed,
  posture: Schema.Types.Mixed,
  questionFeedback: [Schema.Types.Mixed],
  suggestions: [String],
});

export const Report = mongoose.model<IReport>('Report', ReportSchema);
