'use strict';

// Configuration object for better maintainability
const CONFIG = Object.freeze({
    urls: Object.freeze({
        blog: 'https://blog.qulluq.com/'
    }),
    security: Object.freeze({
        allowedDomains: Object.freeze(['qulluq.com', 'blog.qulluq.com']),
        maxRedirectDelay: 1000
    }),
    selectors: {
        loading: '#loading',
        scrollIndicator: '#scrollIndicator',
        navLinks: '.nav-links a',
        navCards: '.nav-card',
        header: 'header'
    },
    classes: {
        hidden: 'hidden'
    },
    animation: {
        loadingDelay: 1000,
        navigationDelay: 500
    }
});

// Utility functions
const Utils = {
    /**
     * Input sanitization function
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeInput(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.textContent;
    },

    /**
     * URL validation function
     * @param {string} string - URL string to validate
     * @param {Array} allowedDomains - List of allowed domains for validation
     * @returns {boolean} Whether URL is valid
     */
    isValidUrl(string, allowedDomains = []) {
        if (typeof string !== 'string') return false;
        try {
            const url = new URL(string);
            const isValidProtocol = url.protocol === 'http:' || url.protocol === 'https:';

            if (allowedDomains.length > 0) {
                const isValidDomain = allowedDomains.some(domain =>
                    url.hostname === domain || url.hostname.endsWith('.' + domain)
                );
                return isValidProtocol && isValidDomain;
            }

            return isValidProtocol;
        } catch (_) {
            return false;
        }
    },

    /**
     * Debounce function for performance optimization
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Safe element selector with error handling
     * @param {string} selector - CSS selector
     * @returns {Element|null} Selected element or null
     */
    safeQuerySelector(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error(`Invalid selector: ${selector}`, error);
            } else {
                console.error('Selector error occurred');
            }
            return null;
        }
    },

    /**
     * Safe element selector all with error handling
     * @param {string} selector - CSS selector
     * @returns {NodeList|Array} Selected elements or empty array
     */
    safeQuerySelectorAll(selector) {
        try {
            return document.querySelectorAll(selector);
        } catch (error) {
            console.error(`Invalid selector: ${selector}`, error);
            return [];
        }
    }
};

// Application modules
const App = {
    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.initializeComponents();
    },

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Window events
        window.addEventListener('load', this.handleWindowLoad.bind(this));
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

        // Document events
        // document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    },

    /**
     * Initialize components
     */
    initializeComponents() {
        this.initializeNavigation();
        this.initializeCards();
        this.initializeIntersectionObserver();
    },

    /**
     * Handle window load event
     */
    handleWindowLoad() {
        setTimeout(() => {
            const loadingElement = Utils.safeQuerySelector(CONFIG.selectors.loading);
            if (loadingElement) {
                loadingElement.classList.add(CONFIG.classes.hidden);
            }
        }, CONFIG.animation.loadingDelay);
    },

    /**
     * Handle scroll event with debouncing
     */
    handleScroll: Utils.debounce(function () {
        this.updateScrollIndicator();
        this.updateHeaderVisibility();
    }, 16), // ~60fps

    /**
     * Handle error event
     * @param {ErrorEvent} e - Error event object
     */
    handleError(e) {
        console.error('JavaScript Error:', e.error);
        // In production, you might want to send this to a logging service
        // LoggingService.log(e.error);
    },

    /**
     * Handle before unload event
     */
    handleBeforeUnload() {
        // Clear any sensitive data stored in memory
        // This is a good security practice
    },

    /**
     * Handle context menu (disable right-click)
     * @param {Event} e - Context menu event
     */
    handleContextMenu(e) {
        e.preventDefault();
    },

    /**
     * Update scroll indicator
     */
    updateScrollIndicator() {
        const scrollIndicator = Utils.safeQuerySelector(CONFIG.selectors.scrollIndicator);
        if (!scrollIndicator) return;

        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        scrollIndicator.style.width = `${scrollPercent}%`;
    },

    /**
     * Update header visibility based on scroll direction
     */
    updateHeaderVisibility() {
        if (!this.lastScrollTop) this.lastScrollTop = 0;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = Utils.safeQuerySelector(CONFIG.selectors.header);

        if (!header) return;

        if (scrollTop > this.lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    },

    /**
     * Initialize smooth scrolling navigation
     */
    initializeNavigation() {
        const navLinks = Utils.safeQuerySelectorAll(CONFIG.selectors.navLinks);

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');

                if (targetId && targetId.startsWith('#')) {
                    const sectionName = targetId.substring(1);
                    if (CONFIG.urls[sectionName]) {
                        window.open(CONFIG.urls[sectionName], '_blank');
                        return;
                    }

                    const targetElement = Utils.safeQuerySelector(targetId);

                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    },

    /**
     * Initialize navigation cards
     */
    initializeCards() {
        const navCards = Utils.safeQuerySelectorAll(CONFIG.selectors.navCards);

        navCards.forEach(card => {
            const link = card.querySelector('.nav-card-link');
            const section = card.dataset.section;

            if (!link || !section) return;

            // Add click handler to entire card
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-card-link')) {
                    this.handleCardClick(link, section);
                }
            });

            // Enhanced hover effects
            this.addHoverEffects(card);

            // Link click handler
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleCardClick(link, section);
            });
        });
    },

    /**
     * Handle card click navigation
     * @param {Element} link - Link element
     * @param {string} section - Section identifier
     */
    handleCardClick(link, section) {
        const targetUrl = CONFIG.urls[section];

        if (!targetUrl) {
            console.warn(`No URL configured for section: ${section}`);
            return;
        }

        // Security check before navigation
        if (!Utils.isValidUrl(targetUrl, CONFIG.security.allowedDomains)) {
            console.error(`Invalid or unauthorized URL: ${targetUrl}`);
            return;
        }

        // Add loading effect
        const originalText = link.textContent;
        link.style.opacity = '0.7';
        link.textContent = '載入中...';

        // Navigate after delay
        setTimeout(() => {
            try {
                window.location.href = targetUrl;
            } catch (error) {
                console.error('Navigation error:', error);
                link.style.opacity = '1';
                link.textContent = originalText;
            }
        }, Math.min(CONFIG.animation.navigationDelay, CONFIG.security.maxRedirectDelay));
    },

    /**
     * Add hover effects to cards
     * @param {Element} card - Card element
     */
    addHoverEffects(card) {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    },

    /**
     * Initialize Intersection Observer for animations
     */
    initializeIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                }
            });
        }, observerOptions);

        // Observe navigation cards for animations
        const navCards = Utils.safeQuerySelectorAll(CONFIG.selectors.navCards);
        navCards.forEach(card => {
            observer.observe(card);
        });
    },

    cleanup() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
    }
};

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}