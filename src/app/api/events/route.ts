import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

// Create a new event
export async function POST(request: Request) {
  try {
    const data = await request.json(); // Form data with fields, title, slug, templateHtml
    await dbConnect();

    const newEvent = await Event.create(data);
    return NextResponse.json(newEvent);
  } catch (err: any) {
    console.error('Event creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Get all events
export async function GET() {
  try {
    await dbConnect();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json(events);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
