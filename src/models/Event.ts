import mongoose from 'mongoose';

export interface IFormField {
  id: string;
  type: 'text' | 'file' | 'select' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select type
}

export interface IEvent extends mongoose.Document {
  title: string;
  slug: string;
  fields: IFormField[];
  templateHtml: string;
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

const EventSchema = new mongoose.Schema<IEvent>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  fields: [FormFieldSchema],
  templateHtml: { type: String, required: true }, // The HTML with placeholders like {{name}}, {{image}}
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
