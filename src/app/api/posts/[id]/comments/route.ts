import { NextResponse } from 'next/server';
import { blogService } from '@/backend/blogService';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const comments = blogService.getCommentsByPostId(id);
  return NextResponse.json({ comments });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const comment = blogService.addComment(
      {
        postId: id,
        userId: body.data?.userId,
        content: body.data?.content,
      },
      body.user
    );

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to add comment' },
      { status: 400 }
    );
  }
}
