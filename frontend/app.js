let editor = null;

// Initialize EasyMDE 
function initEditor() {
    const editorElement = document.getElementById('content');
    if (editorElement) {
        editor = new EasyMDE({ 
            element: editorElement,
            spellChecker: false,
            placeholder: "Write your blog post here... ",
            hideIcons: ["guide", "heading"],
            showIcons: ["code", "table"],
            status: ["lines", "words", "cursor"]
        });
    }
}

// Format relative date
function timeAgo(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

// Fetch posts and render
async function fetchPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    try {
        const response = await fetch('/api/posts');
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const posts = await response.json();
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                    <h3 class="mt-2 text-sm font-semibold text-gray-900">No posts</h3>
                    <p class="mt-1 text-sm text-gray-500">Get started by creating a new blog post.</p>
                    <div class="mt-6">
                        <a href="/create.html" class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            Create Post
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        posts.forEach(post => {
            // Render markdown to HTML using marked and DOMPurify
            const rawMarkup = marked.parse(post.content);
            const cleanHTML = DOMPurify.sanitize(rawMarkup, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'] }); // Allow basic embeds

            const article = document.createElement('article');
            article.className = 'bg-white rounded-2xl shadow-lg ring-1 ring-gray-900/5 sm:p-8 p-6 overflow-hidden transform transition duration-300 hover:scale-[1.01] hover:shadow-2xl cursor-pointer';
            article.onclick = () => window.location.href = `/post.html?id=${post.id}`;
            
            const coverImageHtml = post.coverImage ? `
                <div class="w-full h-64 mb-6 rounded-xl overflow-hidden bg-gray-100">
                    <img src="${post.coverImage}" alt="${post.title}" class="w-full h-full object-cover">
                </div>
            ` : '';

            article.innerHTML = `
                ${coverImageHtml}
                <div class="flex items-center gap-x-4 text-xs font-medium text-indigo-600 mb-4">
                    <time datetime="${post.createdAt}">${new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    <span class="text-gray-500 relative flex items-center before:content-[''] before:w-1 before:h-1 before:bg-gray-300 before:rounded-full before:mr-4">${timeAgo(post.createdAt)}</span>
                </div>
                <div class="group relative">
                    <h3 class="mt-3 text-2xl font-bold leading-6 text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                        ${post.title}
                    </h3>
                    <div class="mt-5 prose prose-indigo max-w-none text-gray-600 line-clamp-3">
                        ${cleanHTML}
                    </div>
                </div>
                <div class="relative mt-8 flex items-center gap-x-4 border-t border-gray-100 pt-6">
                    <div class="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        ${post.author.charAt(0).toUpperCase()}
                    </div>
                    <div class="text-sm leading-6">
                        <p class="font-semibold text-gray-900">
                            <span class="absolute inset-0"></span>
                            ${post.author}
                        </p>
                        <p class="text-gray-600">Author</p>
                    </div>
                </div>
            `;
            container.appendChild(article);
        });

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `<div class="text-red-500 text-center py-10">Failed to load posts. Please try again later. Error: ${error.message}</div>`;
    }
}

// Handle form submission
async function handleCreatePost(e) {
    e.preventDefault();
    
    if (!editor) return;

    const submitBtn = document.getElementById('submit-btn');
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    // Reset state
    errorDiv.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Publishing...';
    submitBtn.classList.add('opacity-75');

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const coverImage = document.getElementById('coverImage').value;
    const content = editor.value();

    if (!content.trim()) {
        showError('Content cannot be empty');
        return;
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                author,
                coverImage,
                content
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create post');
        }

        // Success, redirect to home
        window.location.href = '/';
        
    } catch (error) {
        showError(error.message);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const submitBtn = document.getElementById('submit-btn');
    
    errorText.textContent = message;
    errorDiv.classList.remove('hidden');
    
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Publish Post';
    submitBtn.classList.remove('opacity-75');
}
