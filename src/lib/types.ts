
export interface User {
  id: string;
  name: string;
  email: string | null;
  avatarUrl?: string;
  bio?: string;
}

export type AuthenticatedUser = User;

export type TimestampValue = Date | string | number;

export interface AuthorSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Comment {
  id: string;
  user: AuthorSummary;
  postId: string;
  content: string;
  timestamp: TimestampValue;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: AuthorSummary;
  authorId: string;
  timestamp: TimestampValue;
  categories: string[];
  tags: string[];
  imageUrl?: string;
  commentCount?: number;
  status: 'published' | 'draft';
}

export type NewPostData = Omit<Post, 'id' | 'author' | 'authorId' | 'timestamp' | 'commentCount'>;
export type UpdatePostData = Partial<Omit<Post, 'author' | 'timestamp'>> & { id: string };

export type NewCommentData = {
  postId: string;
  userId: string;
  content: string;
};
