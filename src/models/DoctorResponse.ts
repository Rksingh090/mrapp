import mongoose from 'mongoose';

export interface IDoctorResponse extends mongoose.Document {
  doctorName: string;
  imageUrl: string;
  templateType: string;
  createdAt: Date;
}

const DoctorResponseSchema = new mongoose.Schema<IDoctorResponse>({
  doctorName: {
    type: String,
    required: [true, 'Please provide the doctor name.'],
    maxlength: [60, 'Doctor Name cannot be more than 60 characters'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image URL.'],
  },
  templateType: {
    type: String,
    required: [true, 'Please select a template.'],
    enum: ['womensday', 'rakshabandhan', 'general'],
    default: 'general',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.DoctorResponse || mongoose.model<IDoctorResponse>('DoctorResponse', DoctorResponseSchema);
