// Portfolio Configuration - Static Project Showcase
const PORTFOLIO_CONFIG = {
    // Static portfolio - no external API integrations
    enableGitHubIntegration: false,
    showStaticProjects: true
};

// Dark Mode Toggle Function
function initializeDarkMode() {
    const body = document.body;
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Apply saved theme
    if (isDarkMode) {
        body.classList.add('dark-mode');
    }
    
    // Create dark mode toggle button
    const darkModeToggle = document.createElement('button');
    darkModeToggle.innerHTML = isDarkMode ? '☀️' : '🌙';
    darkModeToggle.classList.add('dark-mode-toggle');
    darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
    darkModeToggle.setAttribute('title', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
    
    // Add enhanced styling
    darkModeToggle.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isDarkMode ? '#2a2a2a' : '#ffffff'};
        color: ${isDarkMode ? '#ffffff' : '#333333'};
        border: 2px solid #007acc;
        border-radius: 50%;
        width: 56px;
        height: 56px;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 122, 204, 0.2);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
    `;
    
    // Add hover and click effects
    darkModeToggle.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 6px 20px rgba(0, 122, 204, 0.3)';
    });
    
    darkModeToggle.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 15px rgba(0, 122, 204, 0.2)';
    });
    
    darkModeToggle.addEventListener('click', function() {
        // Add click animation
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'scale(1.1)';
        }, 100);
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
        
        // Toggle dark mode
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        
        // Update localStorage
        localStorage.setItem('darkMode', isDark);
        
        // Update button appearance
        this.innerHTML = isDark ? '☀️' : '🌙';
        this.style.background = isDark ? '#2a2a2a' : '#ffffff';
        this.style.color = isDark ? '#ffffff' : '#333333';
        this.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        
        // Add a subtle animation to the page
        body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    });
    
    document.body.appendChild(darkModeToggle);
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.project, .blog-post, .update');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize hover effects
function initializeHoverEffects() {
    const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="mailto:"]');
    externalLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize typing effect for name
function initializeTypingEffect() {
    const nameElement = document.querySelector('.name');
    if (nameElement) {
        const originalText = nameElement.textContent;
        nameElement.textContent = '';
        
        let i = 0;
        const typeWriter = function() {
            if (i < originalText.length) {
                nameElement.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }
}

// Initialize click tracking
function initializeClickTracking() {
    const projectLinks = document.querySelectorAll('.project-link, .blog-link');
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const projectTitle = this.closest('.project, .blog-post').querySelector('h3').textContent;
            console.log(`Clicked on: ${projectTitle}`);
            // You can add analytics tracking here
        });
    });
}

// Initialize projects toggle functionality
function initializeProjectsToggle() {
    const showMoreBtn = document.getElementById('show-more-projects');
    const hiddenProjects = document.querySelectorAll('.hidden-project');
    let isExpanded = false;
    
    if (showMoreBtn && hiddenProjects.length > 0) {
        showMoreBtn.addEventListener('click', function() {
            if (!isExpanded) {
                // Show projects with staggered animation
                hiddenProjects.forEach((project, index) => {
                    setTimeout(() => {
                        project.style.display = 'block';
                        project.classList.remove('hide');
                        project.classList.add('show');
                    }, index * 150);
                });
                
                showMoreBtn.textContent = 'Show Less Projects';
                isExpanded = true;
            } else {
                // Hide projects with staggered animation (reverse order)
                const reversedProjects = Array.from(hiddenProjects).reverse();
                reversedProjects.forEach((project, index) => {
                    setTimeout(() => {
                        project.classList.remove('show');
                        project.classList.add('hide');
                        
                        // Hide element after animation completes
                        setTimeout(() => {
                            project.style.display = 'none';
                            project.classList.remove('hide');
                        }, 400);
                    }, index * 100);
                });
                
                showMoreBtn.textContent = 'Show More Projects';
                isExpanded = false;
            }
        });
    }
}

// Initialize lazy loading for images
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Simple contact form handler
function handleContactForm(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Simple validation
    if (!data.name || !data.email || !data.message) {
        alert('Please fill in all fields');
        return;
    }
    
    // Here you would typically send the data to a server
    console.log('Contact form submitted:', data);
    alert('Thank you for your message! I will get back to you soon.');
    
    // Reset form
    event.target.reset();
}

// Initialize performance optimizations
function initializePerformanceOptimizations() {
    // Preload important assets
    const preloadLinks = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    ];
    
    preloadLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        document.head.appendChild(link);
    });
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio loaded - showing static projects');
    
    // Initialize all features
    initializeDarkMode();
    initializeSmoothScrolling();
    initializeScrollAnimations();
    initializeHoverEffects();
    initializeTypingEffect();
    initializeClickTracking();
    initializeProjectsToggle();
    initializeLazyLoading();
});

// Initialize performance optimizations on load
window.addEventListener('load', function() {
    initializePerformanceOptimizations();
});
