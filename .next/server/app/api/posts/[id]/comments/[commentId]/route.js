(()=>{var e={};e.id=855,e.ids=[855],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},26346:(e,t,r)=>{"use strict";r.d(t,{w:()=>L});let a=require("node:crypto");var s=r.n(a);let i=require("node:fs");var o=r.n(i),n=r(76760),u=r.n(n);let m=require("better-sqlite3");var d=r.n(m);let p=u().join(process.cwd(),"data"),l=u().join(p,"blog-sphere.sqlite"),E=e=>{e.pragma("journal_mode = WAL"),e.pragma("foreign_keys = ON"),e.exec(`
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
  `)},c=()=>{if(global.__blogSphereDb)return global.__blogSphereDb;o().mkdirSync(p,{recursive:!0});let e=new(d())(l);return E(e),global.__blogSphereDb=e,e},T="seeded-v1",_=()=>new Date().toISOString(),g=()=>s().randomUUID(),N=e=>{try{let t=JSON.parse(e);return Array.isArray(t)?t.map(String):[]}catch{return[]}},S=e=>({id:e.id,name:e.name,email:e.email,avatarUrl:e.avatar_url??void 0,bio:e.bio??void 0}),O=e=>({id:e.id,title:e.title,excerpt:e.excerpt,content:e.content,authorId:e.author_id,author:{id:e.author_id,name:e.authorName??"Unknown Author",avatarUrl:e.authorAvatarUrl??void 0,bio:e.authorBio??void 0},timestamp:e.timestamp,categories:N(e.categories),tags:N(e.tags),imageUrl:e.image_url??void 0,commentCount:e.comment_count,status:e.status}),h=e=>({id:e.id,postId:e.post_id,user:{id:e.user_id,name:e.user_name,avatarUrl:e.user_avatar_url??void 0},content:e.content,timestamp:e.timestamp}),R=()=>{let e=c(),t=e.prepare("SELECT value FROM meta WHERE key = ?").get(T);if(t?.value==="true")return;let r=Date.now(),a=[{id:"demo-alex",name:"Alex Rivera",email:"alex@blogsphere.local",password:"password123",avatar_url:null,bio:"Writes about product design and creative workflows.",created_at:new Date(r-2592e6).toISOString()},{id:"demo-sam",name:"Sam Carter",email:"sam@blogsphere.local",password:"password123",avatar_url:null,bio:"Frontend engineer sharing practical web experiments.",created_at:new Date(r-216e7).toISOString()}],s=[{id:"post-offline-1",title:"Building A Calm Offline Writing Routine",excerpt:"How I moved my writing flow to an always-available offline stack.",content:"Offline-first writing changed how quickly I can move from idea to draft.\\n\\n- I keep a weekly note queue.\\n- I expand one note into a post every morning.\\n- I publish when the piece feels useful, not perfect.",author_id:"demo-alex",status:"published",timestamp:new Date(r-1296e5).toISOString(),categories:JSON.stringify(["Productivity","Writing"]),tags:JSON.stringify(["offline","workflow","writing"]),image_url:null},{id:"post-offline-2",title:"A Tiny UI Checklist For Better Readability",excerpt:"Three fast checks I run before shipping any content-heavy page.",content:"When readability is good, users stay longer and understand more.\\n\\n1. Raise line-height on long paragraphs.\\n2. Keep headline rhythm consistent.\\n3. Use muted color only for secondary text.",author_id:"demo-sam",status:"published",timestamp:new Date(r-432e5).toISOString(),categories:JSON.stringify(["Frontend"]),tags:JSON.stringify(["ui","accessibility","typography"]),image_url:null},{id:"post-offline-draft-1",title:"Draft: Better Comment Moderation Patterns",excerpt:"Notes for a future article about low-friction moderation.",content:"Outline:\\n\\n- moderation cues\\n- local-first tooling\\n- transparent actions",author_id:"demo-alex",status:"draft",timestamp:new Date(r-144e5).toISOString(),categories:JSON.stringify(["Community"]),tags:JSON.stringify(["moderation","comments"]),image_url:null}],i=[{id:"comment-1",post_id:"post-offline-1",user_id:"demo-sam",user_name:"Sam Carter",user_avatar_url:null,content:"Love this. The note queue idea is easy to start today.",timestamp:new Date(r-72e6).toISOString()},{id:"comment-2",post_id:"post-offline-1",user_id:"demo-alex",user_name:"Alex Rivera",user_avatar_url:null,content:"Thanks, Sam. I am also testing a monthly review format.",timestamp:new Date(r-36e6).toISOString()},{id:"comment-3",post_id:"post-offline-2",user_id:"demo-alex",user_name:"Alex Rivera",user_avatar_url:null,content:"Good checklist. The muted-text rule avoids so many contrast issues.",timestamp:new Date(r-108e5).toISOString()}];e.transaction(()=>{let t=e.prepare(`INSERT OR REPLACE INTO users (id, name, email, password, avatar_url, bio, created_at)
       VALUES (@id, @name, @email, @password, @avatar_url, @bio, @created_at)`),r=e.prepare(`INSERT OR REPLACE INTO posts (id, title, excerpt, content, author_id, status, timestamp, categories, tags, image_url, comment_count)
       VALUES (@id, @title, @excerpt, @content, @author_id, @status, @timestamp, @categories, @tags, @image_url, 0)`),o=e.prepare(`INSERT OR REPLACE INTO comments (id, post_id, user_id, user_name, user_avatar_url, content, timestamp)
       VALUES (@id, @post_id, @user_id, @user_name, @user_avatar_url, @content, @timestamp)`);a.forEach(e=>t.run(e)),s.forEach(e=>r.run(e)),i.forEach(e=>o.run(e)),e.prepare(`UPDATE posts
       SET comment_count = (
         SELECT COUNT(*) FROM comments c WHERE c.post_id = posts.id
       )`).run(),e.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)").run(T,"true")})()},I=()=>`
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
`;R();let L={getUserById(e){R();let t=c().prepare("SELECT id, name, email, avatar_url, bio, password FROM users WHERE id = ?").get(e);return t?S(t):null},loginWithEmail(e,t){R();let r=c().prepare("SELECT id, name, email, avatar_url, bio, password FROM users WHERE email = ?").get(e.toLowerCase().trim());if(!r||r.password!==t)throw Error("Invalid email or password.");return S(r)},signup(e){R();let t=c(),r=e.email.toLowerCase().trim();if(t.prepare("SELECT id FROM users WHERE email = ?").get(r))throw Error("An account with this email already exists.");let a=g();return t.prepare(`INSERT INTO users (id, name, email, password, avatar_url, bio, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`).run(a,e.name.trim(),r,e.pass,null,"Newly registered user.",_()),this.getUserById(a)},updateUserProfile(e,t){R();let r=c(),a=r.prepare("SELECT id, name, email, avatar_url, bio, password FROM users WHERE id = ?").get(e);if(!a)throw Error("User not found.");let s=t.name?.trim()||a.name,i=void 0!==t.bio?t.bio:a.bio,o=void 0!==t.avatarUrl?t.avatarUrl||null:a.avatar_url,n=t.email?.trim().toLowerCase()||a.email;if(n!==a.email){let t=r.prepare("SELECT id FROM users WHERE email = ?").get(n);if(t&&t.id!==e)throw Error("An account with this email already exists.")}return r.prepare(`UPDATE users
       SET name = ?, email = ?, bio = ?, avatar_url = ?, updated_at = ?
       WHERE id = ?`).run(s,n,i,o,_(),e),this.getUserById(e)},getAllPosts(e){R();let t=c(),r=[],a=[];e?.authorId&&(r.push("p.author_id = ?"),a.push(e.authorId)),e?.status&&(r.push("p.status = ?"),a.push(e.status));let s=r.length?`WHERE ${r.join(" AND ")}`:"";return t.prepare(`${I()} ${s} ORDER BY p.timestamp DESC`).all(...a).map(O)},getPostById(e){R();let t=c().prepare(`${I()} WHERE p.id = ? LIMIT 1`).get(e);return t?O(t):void 0},addPost(e,t){R();let r=c(),a=g();return r.prepare(`INSERT INTO posts (id, title, excerpt, content, author_id, status, timestamp, categories, tags, image_url, comment_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`).run(a,e.title,e.excerpt,e.content,t.id,e.status,_(),JSON.stringify(e.categories),JSON.stringify(e.tags),e.imageUrl??null),this.getPostById(a)},updatePost(e){R();let t=c(),r=this.getPostById(e.id);if(!r)return;let a=e.title??r.title,s=e.excerpt??r.excerpt,i=e.content??r.content,o=e.status??r.status,n=e.categories??r.categories,u=e.tags??r.tags,m=void 0!==e.imageUrl?e.imageUrl:r.imageUrl;return t.prepare(`UPDATE posts
       SET title = ?, excerpt = ?, content = ?, status = ?, categories = ?, tags = ?, image_url = ?, last_modified_at = ?
       WHERE id = ?`).run(a,s,i,o,JSON.stringify(n),JSON.stringify(u),m??null,_(),e.id),this.getPostById(e.id)},deletePost(e){R();let t=c();t.transaction(()=>{t.prepare("DELETE FROM comments WHERE post_id = ?").run(e),t.prepare("DELETE FROM posts WHERE id = ?").run(e)})()},getCommentsByPostId:e=>(R(),c().prepare(`SELECT id, post_id, user_id, user_name, user_avatar_url, content, timestamp
         FROM comments
         WHERE post_id = ?
         ORDER BY timestamp DESC`).all(e).map(h)),addComment(e,t){R();let r=c(),a=g();return r.transaction(()=>{r.prepare(`INSERT INTO comments (id, post_id, user_id, user_name, user_avatar_url, content, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`).run(a,e.postId,t.id,t.name,t.avatarUrl??null,e.content,_()),r.prepare("UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?").run(e.postId)})(),h(r.prepare(`SELECT id, post_id, user_id, user_name, user_avatar_url, content, timestamp
         FROM comments
         WHERE id = ?`).get(a))},deleteComment(e,t){R();let r=c();r.transaction(()=>{let a=r.prepare("SELECT id, post_id FROM comments WHERE id = ?").get(t);a&&a.post_id===e&&(r.prepare("DELETE FROM comments WHERE id = ?").run(t),r.prepare("UPDATE posts SET comment_count = MAX(comment_count - 1, 0) WHERE id = ?").run(e))})()}}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},73514:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>c,routeModule:()=>d,serverHooks:()=>E,workAsyncStorage:()=>p,workUnitAsyncStorage:()=>l});var a={};r.r(a),r.d(a,{DELETE:()=>m});var s=r(96559),i=r(48088),o=r(37719),n=r(32190),u=r(26346);async function m(e,t){let{id:r,commentId:a}=await t.params;return u.w.deleteComment(r,a),n.NextResponse.json({ok:!0})}let d=new s.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/posts/[id]/comments/[commentId]/route",pathname:"/api/posts/[id]/comments/[commentId]",filename:"route",bundlePath:"app/api/posts/[id]/comments/[commentId]/route"},resolvedPagePath:"/home/ritvik/code/Blog-Sphere/src/app/api/posts/[id]/comments/[commentId]/route.ts",nextConfigOutput:"",userland:a}),{workAsyncStorage:p,workUnitAsyncStorage:l,serverHooks:E}=d;function c(){return(0,o.patchFetch)({workAsyncStorage:p,workUnitAsyncStorage:l})}},76760:e=>{"use strict";e.exports=require("node:path")},78335:()=>{},96487:()=>{}};var t=require("../../../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[447,580],()=>r(73514));module.exports=a})();