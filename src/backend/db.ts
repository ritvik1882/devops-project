import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

declare global {
  // eslint-disable-next-line no-var
  var __blogSphereDb: Database.Database | undefined;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'blog-sphere.sqlite');

const initializeSchema = (db: Database.Database) => {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('published', 'draft')),
      timestamp TEXT NOT NULL,
      categories TEXT NOT NULL,
      tags TEXT NOT NULL,
      image_url TEXT,
      comment_count INTEGER NOT NULL DEFAULT 0,
      last_modified_at TEXT,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_avatar_url TEXT,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp);
    CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON comments(timestamp);
  `);
};

export const getDb = (): Database.Database => {
  if (global.__blogSphereDb) {
    return global.__blogSphereDb;
  }

  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  initializeSchema(db);
  global.__blogSphereDb = db;
  return db;
};
