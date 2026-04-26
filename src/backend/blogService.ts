import crypto from 'node:crypto';
import { getDb } from './db';
import type { AuthenticatedUser, Comment, NewCommentData, NewPostData, Post, UpdatePostData } from '@/lib/types';

type UserRow = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  password: string;
};

type PostRow = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author_id: string;
  status: 'published' | 'draft';
  timestamp: string;
  categories: string;
  tags: string;
  image_url: string | null;
  comment_count: number;
  authorName: string | null;
  authorAvatarUrl: string | null;
  authorBio: string | null;
};

type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar_url: string | null;
  content: string;
  timestamp: string;
};

const SEEDED_KEY = 'seeded-v1';
const nowIso = () => new Date().toISOString();
const createId = () => crypto.randomUUID();

const parseJsonArray = (value: string): string[] => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const toPublicUser = (row: UserRow): AuthenticatedUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  avatarUrl: row.avatar_url ?? undefined,
  bio: row.bio ?? undefined,
});

const toPost = (row: PostRow): Post => ({
  id: row.id,
  title: row.title,
  excerpt: row.excerpt,
  content: row.content,
  authorId: row.author_id,
  author: {
    id: row.author_id,
    name: row.authorName ?? 'Unknown Author',
    avatarUrl: row.authorAvatarUrl ?? undefined,
    bio: row.authorBio ?? undefined,
  },
  timestamp: row.timestamp,
  categories: parseJsonArray(row.categories),
  tags: parseJsonArray(row.tags),
  imageUrl: row.image_url ?? undefined,
  commentCount: row.comment_count,
  status: row.status,
});

const toComment = (row: CommentRow): Comment => ({
  id: row.id,
  postId: row.post_id,
  user: {
    id: row.user_id,
    name: row.user_name,
    avatarUrl: row.user_avatar_url ?? undefined,
  },
  content: row.content,
  timestamp: row.timestamp,
});

const ensureSeeded = () => {
  const db = getDb();
  const seeded = db.prepare('SELECT value FROM meta WHERE key = ?').get(SEEDED_KEY) as
    | { value: string }
    | undefined;

  if (seeded?.value === 'true') return;

  const baseNow = Date.now();
  const users = [
    {
      id: 'demo-alex',
      name: 'Alex Rivera',
      email: 'alex@blogsphere.local',
      password: 'password123',
      avatar_url: null,
      bio: 'Writes about product design and creative workflows.',
      created_at: new Date(baseNow - 1000 * 60 * 60 * 24 * 30).toISOString(),
    },
    {
      id: 'demo-sam',
      name: 'Sam Carter',
      email: 'sam@blogsphere.local',
      password: 'password123',
      avatar_url: null,
      bio: 'Frontend engineer sharing practical web experiments.',
      created_at: new Date(baseNow - 1000 * 60 * 60 * 24 * 25).toISOString(),
    },
  ];

  const posts = [
    {
      id: 'post-offline-1',
      title: 'Building A Calm Offline Writing Routine',
      excerpt: 'How I moved my writing flow to an always-available offline stack.',
      content:
        'Offline-first writing changed how quickly I can move from idea to draft.\\n\\n- I keep a weekly note queue.\\n- I expand one note into a post every morning.\\n- I publish when the piece feels useful, not perfect.',
      author_id: 'demo-alex',
      status: 'published',
      timestamp: new Date(baseNow - 1000 * 60 * 60 * 36).toISOString(),
      categories: JSON.stringify(['Productivity', 'Writing']),
      tags: JSON.stringify(['offline', 'workflow', 'writing']),
      image_url: null,
    },
    {
      id: 'post-offline-2',
      title: 'A Tiny UI Checklist For Better Readability',
      excerpt: 'Three fast checks I run before shipping any content-heavy page.',
      content:
        'When readability is good, users stay longer and understand more.\\n\\n1. Raise line-height on long paragraphs.\\n2. Keep headline rhythm consistent.\\n3. Use muted color only for secondary text.',
      author_id: 'demo-sam',
      status: 'published',
      timestamp: new Date(baseNow - 1000 * 60 * 60 * 12).toISOString(),
      categories: JSON.stringify(['Frontend']),
      tags: JSON.stringify(['ui', 'accessibility', 'typography']),
      image_url: null,
    },
    {
      id: 'post-offline-draft-1',
      title: 'Draft: Better Comment Moderation Patterns',
      excerpt: 'Notes for a future article about low-friction moderation.',
      content: 'Outline:\\n\\n- moderation cues\\n- local-first tooling\\n- transparent actions',
      author_id: 'demo-alex',
      status: 'draft',
      timestamp: new Date(baseNow - 1000 * 60 * 60 * 4).toISOString(),
      categories: JSON.stringify(['Community']),
      tags: JSON.stringify(['moderation', 'comments']),
      image_url: null,
    },
  ] as const;

  const comments = [
    {
      id: 'comment-1',
      post_id: 'post-offline-1',
      user_id: 'demo-sam',
      user_name: 'Sam Carter',
      user_avatar_url: null,
      content: 'Love this. The note queue idea is easy to start today.',
      timestamp: new Date(baseNow - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: 'comment-2',
      post_id: 'post-offline-1',
      user_id: 'demo-alex',
      user_name: 'Alex Rivera',
      user_avatar_url: null,
      content: 'Thanks, Sam. I am also testing a monthly review format.',
      timestamp: new Date(baseNow - 1000 * 60 * 60 * 10).toISOString(),
    },
    {
      id: 'comment-3',
      post_id: 'post-offline-2',
      user_id: 'demo-alex',
      user_name: 'Alex Rivera',
      user_avatar_url: null,
      content: 'Good checklist. The muted-text rule avoids so many contrast issues.',
      timestamp: new Date(baseNow - 1000 * 60 * 60 * 3).toISOString(),
    },
  ] as const;

  const tx = db.transaction(() => {
    const insertUser = db.prepare(
      `INSERT OR REPLACE INTO users (id, name, email, password, avatar_url, bio, created_at)
       VALUES (@id, @name, @email, @password, @avatar_url, @bio, @created_at)`
    );
    const insertPost = db.prepare(
      `INSERT OR REPLACE INTO posts (id, title, excerpt, content, author_id, status, timestamp, categories, tags, image_url, comment_count)
       VALUES (@id, @title, @excerpt, @content, @author_id, @status, @timestamp, @categories, @tags, @image_url, 0)`
    );
    const insertComment = db.prepare(
      `INSERT OR REPLACE INTO comments (id, post_id, user_id, user_name, user_avatar_url, content, timestamp)
       VALUES (@id, @post_id, @user_id, @user_name, @user_avatar_url, @content, @timestamp)`
    );

    users.forEach((user) => insertUser.run(user));
    posts.forEach((post) => insertPost.run(post));
    comments.forEach((comment) => insertComment.run(comment));

    db.prepare(
      `UPDATE posts
       SET comment_count = (
         SELECT COUNT(*) FROM comments c WHERE c.post_id = posts.id
       )`
    ).run();

    db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run(SEEDED_KEY, 'true');
  });

  tx();
};

const getPostSelect = () => `
  SELECT
    p.id,
    p.title,
    p.excerpt,
    p.content,
    p.author_id,
    p.status,
    p.timestamp,
    p.categories,
    p.tags,
    p.image_url,
    p.comment_count,
    u.name AS authorName,
    u.avatar_url AS authorAvatarUrl,
    u.bio AS authorBio
  FROM posts p
  LEFT JOIN users u ON u.id = p.author_id
`;

ensureSeeded();

export const blogService = {
  getUserById(userId: string): AuthenticatedUser | null {
    ensureSeeded();
    const db = getDb();
    const row = db
      .prepare('SELECT id, name, email, avatar_url, bio, password FROM users WHERE id = ?')
      .get(userId) as UserRow | undefined;
    return row ? toPublicUser(row) : null;
  },

  loginWithEmail(email: string, pass: string): AuthenticatedUser {
    ensureSeeded();
    const db = getDb();
    const row = db
      .prepare('SELECT id, name, email, avatar_url, bio, password FROM users WHERE email = ?')
      .get(email.toLowerCase().trim()) as UserRow | undefined;

    if (!row || row.password !== pass) {
      throw new Error('Invalid email or password.');
    }

    return toPublicUser(row);
  },

  signup(details: { name: string; email: string; pass: string }): AuthenticatedUser {
    ensureSeeded();
    const db = getDb();
    const normalizedEmail = details.email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail) as
      | { id: string }
      | undefined;

    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const userId = createId();
    db.prepare(
      `INSERT INTO users (id, name, email, password, avatar_url, bio, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(userId, details.name.trim(), normalizedEmail, details.pass, null, 'Newly registered user.', nowIso());

    return this.getUserById(userId)!;
  },

  updateUserProfile(
    userId: string,
    updates: { name?: string; bio?: string; avatarUrl?: string; email?: string }
  ): AuthenticatedUser {
    ensureSeeded();
    const db = getDb();
    const existing = db
      .prepare('SELECT id, name, email, avatar_url, bio, password FROM users WHERE id = ?')
      .get(userId) as UserRow | undefined;

    if (!existing) {
      throw new Error('User not found.');
    }

    const nextName = updates.name?.trim() || existing.name;
    const nextBio = updates.bio !== undefined ? updates.bio : existing.bio;
    const nextAvatar = updates.avatarUrl !== undefined ? updates.avatarUrl || null : existing.avatar_url;
    const nextEmail = updates.email?.trim().toLowerCase() || existing.email;

    if (nextEmail !== existing.email) {
      const emailOwner = db.prepare('SELECT id FROM users WHERE email = ?').get(nextEmail) as
        | { id: string }
        | undefined;
      if (emailOwner && emailOwner.id !== userId) {
        throw new Error('An account with this email already exists.');
      }
    }

    db.prepare(
      `UPDATE users
       SET name = ?, email = ?, bio = ?, avatar_url = ?, updated_at = ?
       WHERE id = ?`
    ).run(nextName, nextEmail, nextBio, nextAvatar, nowIso(), userId);

    return this.getUserById(userId)!;
  },

  getAllPosts(filters?: { authorId?: string; status?: 'published' | 'draft' }): Post[] {
    ensureSeeded();
    const db = getDb();

    const where: string[] = [];
    const values: Array<string> = [];

    if (filters?.authorId) {
      where.push('p.author_id = ?');
      values.push(filters.authorId);
    }

    if (filters?.status) {
      where.push('p.status = ?');
      values.push(filters.status);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const rows = db
      .prepare(`${getPostSelect()} ${whereClause} ORDER BY p.timestamp DESC`)
      .all(...values) as PostRow[];

    return rows.map(toPost);
  },

  getPostById(postId: string): Post | undefined {
    ensureSeeded();
    const db = getDb();
    const row = db
      .prepare(`${getPostSelect()} WHERE p.id = ? LIMIT 1`)
      .get(postId) as PostRow | undefined;

    return row ? toPost(row) : undefined;
  },

  addPost(postData: NewPostData, author: AuthenticatedUser): Post {
    ensureSeeded();
    const db = getDb();
    const postId = createId();

    db.prepare(
      `INSERT INTO posts (id, title, excerpt, content, author_id, status, timestamp, categories, tags, image_url, comment_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    ).run(
      postId,
      postData.title,
      postData.excerpt,
      postData.content,
      author.id,
      postData.status,
      nowIso(),
      JSON.stringify(postData.categories),
      JSON.stringify(postData.tags),
      postData.imageUrl ?? null
    );

    return this.getPostById(postId)!;
  },

  updatePost(postData: UpdatePostData): Post | undefined {
    ensureSeeded();
    const db = getDb();
    const existing = this.getPostById(postData.id);
    if (!existing) return undefined;

    const nextTitle = postData.title ?? existing.title;
    const nextExcerpt = postData.excerpt ?? existing.excerpt;
    const nextContent = postData.content ?? existing.content;
    const nextStatus = postData.status ?? existing.status;
    const nextCategories = postData.categories ?? existing.categories;
    const nextTags = postData.tags ?? existing.tags;
    const nextImageUrl = postData.imageUrl !== undefined ? postData.imageUrl : existing.imageUrl;

    db.prepare(
      `UPDATE posts
       SET title = ?, excerpt = ?, content = ?, status = ?, categories = ?, tags = ?, image_url = ?, last_modified_at = ?
       WHERE id = ?`
    ).run(
      nextTitle,
      nextExcerpt,
      nextContent,
      nextStatus,
      JSON.stringify(nextCategories),
      JSON.stringify(nextTags),
      nextImageUrl ?? null,
      nowIso(),
      postData.id
    );

    return this.getPostById(postData.id);
  },

  deletePost(postId: string): void {
    ensureSeeded();
    const db = getDb();

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM comments WHERE post_id = ?').run(postId);
      db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
    });

    tx();
  },

  getCommentsByPostId(postId: string): Comment[] {
    ensureSeeded();
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, post_id, user_id, user_name, user_avatar_url, content, timestamp
         FROM comments
         WHERE post_id = ?
         ORDER BY timestamp DESC`
      )
      .all(postId) as CommentRow[];

    return rows.map(toComment);
  },

  addComment(data: NewCommentData, user: AuthenticatedUser): Comment {
    ensureSeeded();
    const db = getDb();
    const commentId = createId();

    const tx = db.transaction(() => {
      db.prepare(
        `INSERT INTO comments (id, post_id, user_id, user_name, user_avatar_url, content, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(commentId, data.postId, user.id, user.name, user.avatarUrl ?? null, data.content, nowIso());

      db.prepare('UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?').run(data.postId);
    });

    tx();

    const row = db
      .prepare(
        `SELECT id, post_id, user_id, user_name, user_avatar_url, content, timestamp
         FROM comments
         WHERE id = ?`
      )
      .get(commentId) as CommentRow;

    return toComment(row);
  },

  deleteComment(postId: string, commentId: string): void {
    ensureSeeded();
    const db = getDb();

    const tx = db.transaction(() => {
      const existing = db
        .prepare('SELECT id, post_id FROM comments WHERE id = ?')
        .get(commentId) as { id: string; post_id: string } | undefined;

      if (!existing || existing.post_id !== postId) {
        return;
      }

      db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
      db.prepare('UPDATE posts SET comment_count = MAX(comment_count - 1, 0) WHERE id = ?').run(postId);
    });

    tx();
  },
};
