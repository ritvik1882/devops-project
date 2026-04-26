
'use client';

import type {
  AuthenticatedUser,
  Comment,
  NewCommentData,
  NewPostData,
  Post,
  UpdatePostData,
} from './types';

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }
  return payload as T;
};

export const postStore = {
  getAllPosts: async (): Promise<Post[]> => {
    const response = await fetch('/api/posts', { cache: 'no-store' });
    const payload = await parseResponse<{ posts: Post[] }>(response);
    return payload.posts;
  },

  getPostsByAuthorAndStatus: async (
    authorId: string,
    status: 'published' | 'draft'
  ): Promise<Post[]> => {
    const params = new URLSearchParams({ authorId, status });
    const response = await fetch(`/api/posts?${params.toString()}`, { cache: 'no-store' });
    const payload = await parseResponse<{ posts: Post[] }>(response);
    return payload.posts;
  },

  getPublishedPosts: async (): Promise<Post[]> => {
    const response = await fetch('/api/posts?status=published', { cache: 'no-store' });
    const payload = await parseResponse<{ posts: Post[] }>(response);
    return payload.posts;
  },

  getPostById: async (id: string): Promise<Post | undefined> => {
    const response = await fetch(`/api/posts/${id}`, { cache: 'no-store' });
    if (response.status === 404) return undefined;
    const payload = await parseResponse<{ post: Post }>(response);
    return payload.post;
  },

  addPost: async (postData: NewPostData, author: AuthenticatedUser): Promise<Post> =>
    parseResponse<{ post: Post }>(
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postData, author }),
      })
    ).then((payload) => payload.post),

  updatePost: async (updatedPostData: UpdatePostData): Promise<Post | undefined> =>
    parseResponse<{ post: Post }>(
      await fetch(`/api/posts/${updatedPostData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPostData),
      })
    ).then((payload) => payload.post),

  deletePost: async (id: string): Promise<void> => {
    await parseResponse<{ ok: boolean }>(
      await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })
    );
  },

  getCommentsByPostId: async (postId: string): Promise<Comment[]> => {
    const response = await fetch(`/api/posts/${postId}/comments`, { cache: 'no-store' });
    const payload = await parseResponse<{ comments: Comment[] }>(response);
    return payload.comments;
  },

  addComment: async (data: NewCommentData, user: AuthenticatedUser) =>
    parseResponse<{ comment: Comment }>(
      await fetch(`/api/posts/${data.postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, user }),
      })
    ).then((payload) => payload.comment),

  deleteComment: async (postId: string, commentId: string) =>
    parseResponse<{ ok: boolean }>(
      await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      })
    ).then(() => undefined),
};

