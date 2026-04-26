import { NextResponse } from 'next/server';
import { blogService } from '@/backend/blogService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = blogService.loginWithEmail(body.email, body.pass);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Login failed' },
      { status: 400 }
    );
  }
}
