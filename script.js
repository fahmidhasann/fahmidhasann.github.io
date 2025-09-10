// Portfolio Configuration - Static Project Showcase
const PORTFOLIO_CONFIG = {
    // Static portfolio - no external API integrations
    enableGitHubIntegration: false,
    showStaticProjects: true
};

// Initialize portfolio
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio loaded - showing static projects');
    
    // Add smooth scrolling to all links
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
    
    // Add loading animation for cards
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
    
    // Add hover effects for external links
    const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="mailto:"]');
    externalLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add typing effect to the main title (optional)
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
    
    // Add click tracking for project links (optional analytics)
    const projectLinks = document.querySelectorAll('.project-link, .blog-link');
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const projectTitle = this.closest('.project, .blog-post').querySelector('h3').textContent;
            console.log(`Clicked on: ${projectTitle}`);
            // You can add analytics tracking here
        });
    });
    
    // Add dark mode toggle
    const body = document.body;
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        body.classList.add('dark-mode');
    }
    
    // Create dark mode toggle button
    const darkModeToggle = document.createElement('button');
    darkModeToggle.innerHTML = '🌙';
    darkModeToggle.classList.add('dark-mode-toggle');
    darkModeToggle.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #007acc;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    darkModeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        this.innerHTML = isDark ? '☀️' : '🌙';
    });
    
    document.body.appendChild(darkModeToggle);
    
    // Update toggle button icon based on current mode
    darkModeToggle.innerHTML = isDarkMode ? '☀️' : '🌙';
});

// Lazy loading for images (if you add any)
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

// Simple contact form handler (if you add a contact form)
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

// Add some performance optimizations
window.addEventListener('load', function() {
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
});
    
    // Add smooth scrolling to all links
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
    
    // Add loading animation for cards
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
    
    // Add hover effects for external links
    const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="mailto:"]');
    externalLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add typing effect to the main title (optional)
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
    
    // Add click tracking for project links (optional analytics)
    const projectLinks = document.querySelectorAll('.project-link, .blog-link');
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const projectTitle = this.closest('.project, .blog-post').querySelector('h3').textContent;
            console.log(`Clicked on: ${projectTitle}`);
            // You can add analytics tracking here
        });
    });
    
    // Add dark mode toggle (bonus feature)
    const body = document.body;
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        body.classList.add('dark-mode');
    }
    
    // Create dark mode toggle button
    const darkModeToggle = document.createElement('button');
    darkModeToggle.innerHTML = '🌙';
    darkModeToggle.classList.add('dark-mode-toggle');
    darkModeToggle.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #007acc;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    darkModeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        this.innerHTML = isDark ? '☀️' : '🌙';
    });
    
    document.body.appendChild(darkModeToggle);
    
    // Update toggle button icon based on current mode
    darkModeToggle.innerHTML = isDarkMode ? '☀️' : '🌙';
});

// Lazy loading for images (if you add any)
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

// Simple contact form handler (if you add a contact form)
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

// Add some performance optimizations
window.addEventListener('load', function() {
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
});
