// Ghost CMS Post Detail Page
const config = {
    url: 'http://localhost:2368',
    key: '691bd2d288c7e2579ff1c4865a',
    version: 'v5.0'
};
class PostPage {
    constructor(config) {
        this.tocItems = [];
        this.activeId = null;
        this.config = config;
    }
    async fetchPost(slug) {
        try {
            const url = `${this.config.url}/ghost/api/content/posts/slug/${slug}/?key=${this.config.key}&include=tags,authors`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.posts[0] || null;
        }
        catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    renderPost(post) {
        // Update title
        document.title = `${post.title} | Ghost CMS Blog`;
        // Image
        const imageEl = document.getElementById('post-image');
        if (imageEl) {
            imageEl.src = post.feature_image || 'https://via.placeholder.com/900x400/8B7355/ffffff?text=No+Image';
            imageEl.alt = post.title;
        }
        // Tags
        const tagsEl = document.getElementById('post-tags');
        if (tagsEl && post.tags && post.tags.length > 0) {
            tagsEl.innerHTML = post.tags.map(tag => `<span class="post-tag">${this.escapeHtml(tag.name)}</span>`).join('');
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
        // Generate table of contents
        this.generateTableOfContents();
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
        // Setup scroll spy
        this.setupScrollSpy();
    }
    generateTableOfContents() {
        const contentEl = document.getElementById('post-html');
        const tocNav = document.getElementById('toc-nav');
        if (!contentEl || !tocNav)
            return;
        // Find all headings (h2, h3, h4)
        const headings = contentEl.querySelectorAll('h2, h3, h4');
        if (headings.length === 0) {
            // Hide TOC if no headings
            const tocSidebar = document.getElementById('toc-sidebar');
            if (tocSidebar) {
                tocSidebar.style.display = 'none';
            }
            return;
        }
        this.tocItems = [];
        const tocList = document.createElement('ul');
        tocList.className = 'toc-list';
        headings.forEach((heading, index) => {
            const headingEl = heading;
            const level = parseInt(headingEl.tagName.substring(1)); // h2 -> 2, h3 -> 3
            const text = headingEl.textContent || '';
            // Generate unique ID for heading
            const id = `heading-${index}`;
            headingEl.id = id;
            // Create TOC item
            const tocItem = {
                id,
                text,
                level,
                element: headingEl
            };
            this.tocItems.push(tocItem);
            // Create TOC link
            const listItem = document.createElement('li');
            listItem.className = `toc-item toc-level-${level}`;
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.textContent = text;
            link.className = 'toc-link';
            link.dataset.id = id;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                headingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update active state
                this.setActiveLink(id);
            });
            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });
        tocNav.appendChild(tocList);
    }
    setupScrollSpy() {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        // Initial update
        this.updateActiveLink();
    }
    updateActiveLink() {
        const scrollPosition = window.scrollY + 100; // Offset for header
        let currentId = null;
        // Find the current heading based on scroll position
        for (let i = this.tocItems.length - 1; i >= 0; i--) {
            const item = this.tocItems[i];
            const offsetTop = item.element.offsetTop;
            if (scrollPosition >= offsetTop) {
                currentId = item.id;
                break;
            }
        }
        // Update active state if changed
        if (currentId !== this.activeId) {
            this.setActiveLink(currentId);
        }
    }
    setActiveLink(id) {
        this.activeId = id;
        // Remove all active states
        const allLinks = document.querySelectorAll('.toc-link');
        allLinks.forEach(link => {
            link.classList.remove('active');
        });
        // Add active state to current link
        if (id) {
            const activeLink = document.querySelector(`.toc-link[data-id="${id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }
    showError(message) {
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
    async init() {
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
            }
            else {
                this.showError('記事が見つかりませんでした。');
            }
        }
        catch (error) {
            console.error('Failed to load post:', error);
            this.showError('記事の読み込みに失敗しました。');
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const page = new PostPage(config);
    page.init();
});
export {};
