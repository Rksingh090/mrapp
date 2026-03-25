import mongoose from 'mongoose';

export interface IFormField {
  id: string;
  type: 'text' | 'file' | 'select' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select type
}

export interface IStep {
  id: string;
  title: string;
  description?: string;
  fields: IFormField[];
  templateHtml: string; // New: Custom HTML for this step
}

export interface IEvent extends mongoose.Document {
  title: string;
  slug: string;
  steps: IStep[];
  templateHtml: string;
  pageConfig: {
    theme: 'dark' | 'light';
    primaryColor: string;
    backgroundColor: string;
    fontFamily: string;
    showConfetti: boolean;
  };
  active: boolean;
  createdAt: Date;
}

const FormFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['text', 'file', 'select', 'date'], required: true },
  label: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
});

const StepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  fields: [FormFieldSchema],
  templateHtml: { type: String, default: '' },
});

const EventSchema = new mongoose.Schema<IEvent>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  steps: [StepSchema],
  templateHtml: { type: String, required: true }, // The HTML with placeholders like {{name}}, {{image}}
  pageConfig: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    primaryColor: { type: String, default: '#4f46e5' },
    backgroundColor: { type: String, default: '#020617' },
    fontFamily: { type: String, default: 'sans-serif' },
    showConfetti: { type: Boolean, default: true },
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
