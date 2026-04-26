import { NextResponse } from 'next/server';
import { blogService } from '@/backend/blogService';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') as 'published' | 'draft' | null;
  const authorId = url.searchParams.get('authorId');

  const posts = blogService.getAllPosts({
    status: status ?? undefined,
    authorId: authorId ?? undefined,
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const post = blogService.addPost(body.postData, body.author);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create post' },
      { status: 400 }
    );
  }
}
