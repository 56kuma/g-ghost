// Ghost CMS Post Detail Page

interface GhostConfig {
    url: string;
    key: string;
    version: string;
}

interface GhostPost {
    id: string;
    title: string;
    slug: string;
    html: string;
    feature_image?: string;
    excerpt?: string;
    custom_excerpt?: string;
    published_at: string;
    updated_at: string;
    tags?: Array<{ name: string; slug: string }>;
    authors?: Array<{ name: string; slug: string }>;
    reading_time?: number;
}

interface GhostAPIResponse {
    posts: GhostPost[];
}

const config: GhostConfig = {
    url: 'http://localhost:2368',
    key: '691bd2d288c7e2579ff1c4865a',
    version: 'v5.0'
};

class PostPage {
    private config: GhostConfig;

    constructor(config: GhostConfig) {
        this.config = config;
    }

    async fetchPost(slug: string): Promise<GhostPost | null> {
        try {
            const url = `${this.config.url}/ghost/api/content/posts/slug/${slug}/?key=${this.config.key}&include=tags,authors`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: GhostAPIResponse = await response.json();
            return data.posts[0] || null;
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderPost(post: GhostPost): void {
        // Update title
        document.title = `${post.title} | Ghost CMS Blog`;

        // Image
        const imageEl = document.getElementById('post-image') as HTMLImageElement;
        if (imageEl) {
            imageEl.src = post.feature_image || 'https://via.placeholder.com/900x400/8B7355/ffffff?text=No+Image';
            imageEl.alt = post.title;
        }

        // Tags
        const tagsEl = document.getElementById('post-tags');
        if (tagsEl && post.tags && post.tags.length > 0) {
            tagsEl.innerHTML = post.tags.map(tag =>
                `<span class="post-tag">${this.escapeHtml(tag.name)}</span>`
            ).join('');
        }

        // Title
        const titleEl = document.getElementById('post-title');
        if (titleEl) {
            titleEl.textContent = post.title;
        }

        // Meta
        const metaEl = document.getElementById('post-meta');
        if (metaEl) {
            const authorName = post.authors && post.authors.length > 0
                ? post.authors[0].name
                : 'Unknown Author';
            const readingTime = post.reading_time || 1;

            metaEl.innerHTML = `
                <span class="post-author">${this.escapeHtml(authorName)}</span>
                <span class="post-date">${this.formatDate(post.published_at)}</span>
                <span class="post-reading-time">📖 ${readingTime}分で読めます</span>
            `;
        }

        // Content
        const contentEl = document.getElementById('post-html');
        if (contentEl) {
            contentEl.innerHTML = post.html;
        }

        // Show article
        const articleEl = document.getElementById('post-content');
        if (articleEl) {
            articleEl.style.display = 'block';
        }

        // Hide loading
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    showError(message: string): void {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }

        const errorEl = document.getElementById('error');
        if (errorEl) {
            errorEl.style.display = 'block';
            const errorMessage = errorEl.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
    }

    async init(): Promise<void> {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');

        if (!slug) {
            this.showError('記事が見つかりませんでした。');
            return;
        }

        try {
            const post = await this.fetchPost(slug);
            if (post) {
                this.renderPost(post);
            } else {
                this.showError('記事が見つかりませんでした。');
            }
        } catch (error) {
            console.error('Failed to load post:', error);
            this.showError('記事の読み込みに失敗しました。');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const page = new PostPage(config);
    page.init();
});
