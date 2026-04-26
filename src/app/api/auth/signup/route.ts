import { NextResponse } from 'next/server';
import { blogService } from '@/backend/blogService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = blogService.signup(body);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Signup failed' },
      { status: 400 }
    );
  }
}
