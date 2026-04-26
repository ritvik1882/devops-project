import { NextResponse } from 'next/server';
import { blogService } from '@/backend/blogService';

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await context.params;
  blogService.deleteComment(id, commentId);
  return NextResponse.json({ ok: true });
}
