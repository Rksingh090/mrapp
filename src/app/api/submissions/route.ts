import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Submission from '@/models/Submission';

export async function POST(request: Request) {
  try {
    const { eventId, data } = await request.json();
    await dbConnect();

    const submission = await Submission.create({ eventId, data });
    return NextResponse.json(submission);
  } catch (err: any) {
    console.error('Submission error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    await dbConnect();
    if (id) {
      const submission = await Submission.findById(id);
      return NextResponse.json(submission);
    }
    const submissions = await Submission.find().sort({ createdAt: -1 });
    return NextResponse.json(submissions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
