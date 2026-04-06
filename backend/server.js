const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'posts.json');

// Helper to read posts
function getPosts() {
    if (!fs.existsSync(dbPath)) return [];
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// Helper to save posts
function savePosts(posts) {
    fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2));
}

// API Routes
app.get('/api/posts', (req, res) => {
    const posts = getPosts();
    // Sort descending by createdAt
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(posts);
});

app.post('/api/posts', (req, res) => {
    const { title, author, coverImage, content } = req.body;
    if (!title || !author || !content) {
        return res.status(400).json({ error: 'Title, author, and content are required' });
    }

    const posts = getPosts();
    
    const newPost = {
        id: Date.now(),
        title,
        author,
        coverImage,
        content,
        createdAt: new Date().toISOString()
    };
    
    posts.push(newPost);
    savePosts(posts);

    res.status(201).json(newPost);
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
