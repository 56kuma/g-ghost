"use strict";
// Configuration - Replace with your Ghost instance details
const config = {
    url: 'http://localhost:2368',
    key: '691bd2d288c7e2579ff1c4865a',
    version: 'v5.0'
};

class GhostPost {
    constructor(config) {
        this.config = config;
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        this.postContent = document.getElementById('post-content');
    }

    /**
     * Get slug from URL query parameters
     */
    getSlugFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('slug');
    }

    /**
     * Fetch a single post by slug from Ghost Content API
     */
    async fetchPost(slug) {
        try {
            const url = `${this.config.url}/ghost/api/content/posts/slug/${slug}/?key=${this.config.key}&include=tags,authors`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.posts[0];
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }

    /**
     * Format date to Japanese locale
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }
        if (this.postContent) {
            this.postContent.style.display = 'none';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        this.hideLoading();
        if (this.errorElement) {
            this.errorElement.style.display = 'block';
            const errorMessage = this.errorElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
        if (this.postContent) {
            this.postContent.style.display = 'none';
        }
    }

    /**
     * Render post to the page
     */
    renderPost(post) {
        if (!this.postContent) {
            console.error('Post content container not found');
            return;
        }

        this.hideLoading();

        // Set page title
        document.title = `${post.title} | Ghost CMS Blog`;

        // Feature image
        const postImage = document.getElementById('post-image');
        if (postImage) {
            if (post.feature_image) {
                postImage.src = post.feature_image;
                postImage.alt = post.title;
                postImage.parentElement.style.display = 'block';
            } else {
                postImage.parentElement.style.display = 'none';
            }
        }

        // Tags
        const postTags = document.getElementById('post-tags');
        if (postTags && post.tags && post.tags.length > 0) {
            postTags.innerHTML = post.tags
                .map(tag => `<span class="post-tag">${this.escapeHtml(tag.name)}</span>`)
                .join('');
        }

        // Title
        const postTitle = document.getElementById('post-title');
        if (postTitle) {
            postTitle.textContent = post.title;
        }

        // Meta information
        const postMeta = document.getElementById('post-meta');
        if (postMeta) {
            const authorName = post.authors && post.authors.length > 0
                ? post.authors[0].name
                : 'Unknown Author';
            const readingTime = post.reading_time || 1;

            postMeta.innerHTML = `
                <div class="post-author">
                    <span class="author-name">${this.escapeHtml(authorName)}</span>
                </div>
                <div class="post-date">${this.formatDate(post.published_at)}</div>
                <div class="post-reading-time">📖 ${readingTime}分で読めます</div>
            `;
        }

        // Post HTML content
        const postHtml = document.getElementById('post-html');
        if (postHtml && post.html) {
            postHtml.innerHTML = post.html;
        }

        // Show the post
        this.postContent.style.display = 'block';
    }

    /**
     * Initialize the post page
     */
    async init() {
        try {
            this.showLoading();

            // Get slug from URL
            const slug = this.getSlugFromUrl();

            if (!slug) {
                throw new Error('記事のslugが見つかりません');
            }

            // Fetch and render post
            const post = await this.fetchPost(slug);

            if (!post) {
                throw new Error('記事が見つかりませんでした');
            }

            this.renderPost(post);
        } catch (error) {
            console.error('Failed to load post:', error);
            this.showError(
                '記事を読み込めませんでした。\n' +
                'URLが正しいか、または記事が存在するか確認してください。'
            );
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const post = new GhostPost(config);
    post.init();
});
