import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  userId: string;
  role: string;
  questions: any[];
  responses: any[];
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
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
  questions: {
    type: [Schema.Types.Mixed], // Array of mixed types
    default: [],
  },
  responses: {
    type: [Schema.Types.Mixed], // Array of mixed types
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  strict: false, // Allow flexible schema
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);
