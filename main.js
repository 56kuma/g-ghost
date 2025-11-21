"use strict";
// Configuration - Replace with your Ghost instance details
const config = {
    url: 'http://localhost:2368', // あなたのGhost URLに変更
    key: '691bd2d288c7e2579ff1c4865a', // Content API Keyに変更
    version: 'v5.0'
};
class GhostBlog {
    constructor(config) {
        this.config = config;
        this.postsContainer = document.getElementById('posts-container');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
    }
    /**
     * Fetch posts from Ghost Content API
     */
    async fetchPosts(limit = 12) {
        try {
            const url = `${this.config.url}/ghost/api/content/posts/?key=${this.config.key}&limit=${limit}&include=tags,authors&fields=id,title,slug,excerpt,custom_excerpt,feature_image,published_at,reading_time`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.posts;
        }
        catch (error) {
            console.error('Error fetching posts:', error);
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
     * Create a post card element
     */
    createPostCard(post) {
        const card = document.createElement('article');
        card.className = 'post-card';
        card.onclick = () => {
            window.location.href = `post.html?slug=${post.slug}`;
        };
        // Feature image or placeholder
        const imageUrl = post.feature_image || 'https://via.placeholder.com/400x220/667eea/ffffff?text=No+Image';
        // Excerpt
        const excerpt = post.custom_excerpt || post.excerpt || 'この投稿には抜粋がありません。';
        // Tags
        const tagsHTML = post.tags && post.tags.length > 0
            ? post.tags.slice(0, 3).map(tag => `<span class="post-card-tag">${this.escapeHtml(tag.name)}</span>`).join('')
            : '';
        // Author
        const authorName = post.authors && post.authors.length > 0
            ? post.authors[0].name
            : 'Unknown Author';
        // Reading time
        const readingTime = post.reading_time || 1;
        card.innerHTML = `
            <img src="${this.escapeHtml(imageUrl)}" alt="${this.escapeHtml(post.title)}" class="post-card-image" loading="lazy">
            <div class="post-card-content">
                ${tagsHTML ? `<div class="post-card-tags">${tagsHTML}</div>` : ''}
                <h2 class="post-card-title">${this.escapeHtml(post.title)}</h2>
                <p class="post-card-excerpt">${this.escapeHtml(excerpt)}</p>
                <div class="post-card-meta">
                    <div>
                        <div class="post-card-author">${this.escapeHtml(authorName)}</div>
                        <div class="post-card-date">${this.formatDate(post.published_at)}</div>
                    </div>
                    <div class="post-card-reading-time">📖 ${readingTime}分</div>
                </div>
            </div>
        `;
        return card;
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
        if (this.postsContainer) {
            this.postsContainer.innerHTML = '';
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
    }
    /**
     * Render posts to the page
     */
    renderPosts(posts) {
        if (!this.postsContainer) {
            console.error('Posts container not found');
            return;
        }
        this.hideLoading();
        if (posts.length === 0) {
            this.postsContainer.innerHTML = `
                <div class="no-posts">
                    <h2>投稿が見つかりませんでした</h2>
                    <p>まだ投稿がありません。</p>
                </div>
            `;
            return;
        }
        this.postsContainer.innerHTML = '';
        posts.forEach(post => {
            const card = this.createPostCard(post);
            this.postsContainer.appendChild(card);
        });
    }
    /**
     * Initialize the blog
     */
    async init() {
        try {
            this.showLoading();
            const posts = await this.fetchPosts();
            this.renderPosts(posts);
        }
        catch (error) {
            console.error('Failed to initialize blog:', error);
            this.showError('ブログの投稿を読み込めませんでした。設定を確認してください。\n' +
                'Ghost URLとContent API Keyが正しいか確認してください。');
        }
    }
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const blog = new GhostBlog(config);
    blog.init();
});
