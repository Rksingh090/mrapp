import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DoctorResponse from '@/models/DoctorResponse';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const doctorName = searchParams.get('doctorName');
  const templateType = searchParams.get('templateType') || 'general';

  if (!doctorName) {
    return NextResponse.json({ error: 'Doctor name is required' }, { status: 400 });
  }

  try {
    const { blob } = await request.formData().then((data) => ({
      blob: data.get('file') as unknown as File,
    }));

    if (!blob) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Connect to DB
    await dbConnect();

    // Upload to Vercel Blob
    const response = await put(blob.name, blob, {
      access: 'public',
    });

    // Save metadata to MongoDB
    const doctorEntry = await DoctorResponse.create({
      doctorName,
      imageUrl: response.url,
      templateType,
    });

    return NextResponse.json(doctorEntry);
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
