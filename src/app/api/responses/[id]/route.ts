import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DoctorResponse from '@/models/DoctorResponse';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const response = await DoctorResponse.findById(id);

    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
