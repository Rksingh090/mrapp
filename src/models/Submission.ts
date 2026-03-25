import mongoose from 'mongoose';

export interface ISubmission extends mongoose.Document {
  eventId: string;
  data: Record<string, any>; // Dynamic key-value pairs (e.g., name, photoId, eventDate)
  imageUrl: string; // The URL to the final filled visual ad if we pre-render or just for the uploaded photo
  createdAt: Date;
}

const SubmissionSchema = new mongoose.Schema<ISubmission>({
  eventId: {
    type: String, // String ID of the Event
    required: true,
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true,
  },
  imageUrl: {
    type: String, // The main photo uploaded (e.g., for the doctor)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
