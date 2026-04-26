import { NextResponse } from 'next/server';
import { blogService } from '@/backend/blogService';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = blogService.getUserById(id);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updates = await request.json();
    const user = blogService.updateUserProfile(id, updates);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Profile update failed' },
      { status: 400 }
    );
  }
}
