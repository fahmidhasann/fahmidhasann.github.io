// GitHub API Integration
const GITHUB_USERNAME = 'fahmidhasann'; // Your GitHub username
const GITHUB_API_BASE = 'https://api.github.com';

// Repository filtering configuration
const REPO_CONFIG = {
    // Repositories to exclude (they won't show up in your portfolio)
    excludeRepos: [
        'fahmidhasann.github.io',  // Hide the portfolio repo itself
        // Add more repo names here that you want to hide
        // 'repo-name-to-hide',
        // 'another-repo-to-hide'
    ],
    
    // Optional: Only show specific repositories (leave empty to show all except excluded)
    includeOnlyRepos: [
        // Uncomment and add specific repo names if you only want to show certain repos
        // 'my-awesome-project',
        // 'another-cool-project'
    ],
    
    // Maximum number of repositories to display
    maxRepos: 6,
    
    // Sort order: 'updated', 'created', 'pushed', 'full_name'
    sortBy: 'updated'
};

// GitHub API functions
async function fetchGitHubProfile() {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`);
        if (!response.ok) throw new Error('GitHub profile not found');
        return await response.json();
    } catch (error) {
        console.error('Error fetching GitHub profile:', error);
        return null;
    }
}

async function fetchGitHubRepos() {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=${REPO_CONFIG.sortBy}&per_page=100`);
        if (!response.ok) throw new Error('GitHub repos not found');
        let repos = await response.json();
        
        // Filter out forked repositories
        repos = repos.filter(repo => !repo.fork);
        
        // Apply repository filtering
        repos = filterRepositories(repos);
        
        // Limit to max number of repos
        return repos.slice(0, REPO_CONFIG.maxRepos);
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        return [];
    }
}

function filterRepositories(repos) {
    let filteredRepos = repos;
    
    // If includeOnlyRepos is specified, only show those repositories
    if (REPO_CONFIG.includeOnlyRepos.length > 0) {
        filteredRepos = repos.filter(repo => 
            REPO_CONFIG.includeOnlyRepos.includes(repo.name)
        );
    } else {
        // Otherwise, exclude specified repositories
        filteredRepos = repos.filter(repo => 
            !REPO_CONFIG.excludeRepos.includes(repo.name)
        );
    }
    
    return filteredRepos;
}

async function fetchGitHubStats() {
    try {
        const [profileResponse, reposResponse] = await Promise.all([
            fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`),
            fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?per_page=100`)
        ]);
        
        const profile = await profileResponse.json();
        const repos = await reposResponse.json();
        
        const languages = {};
        const repoLanguages = await Promise.all(
            repos.slice(0, 20).map(repo => 
                fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repo.name}/languages`)
                    .then(res => res.json())
                    .catch(() => ({}))
            )
        );
        
        repoLanguages.forEach(repoLangs => {
            Object.keys(repoLangs).forEach(lang => {
                languages[lang] = (languages[lang] || 0) + repoLangs[lang];
            });
        });
        
        return {
            totalRepos: profile.public_repos,
            followers: profile.followers,
            following: profile.following,
            topLanguages: Object.entries(languages)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([lang]) => lang)
        };
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        return null;
    }
}

function updateProfileWithGitHubData(profile) {
    if (!profile) return;
    
    // Don't update name - keep custom name "Fahmid Hasan"
    // Don't update bio - keep custom bio "AI & Tech Enthusiast | Agriculture Graduate"
    
    // Update social links
    const githubLinks = document.querySelectorAll('a[href*="github.com"]');
    githubLinks.forEach(link => {
        link.href = profile.html_url;
    });
    
    // Update location in title if available
    if (profile.location) {
        const titleElement = document.querySelector('.title');
        if (titleElement && !titleElement.textContent.includes('|')) {
            titleElement.textContent += ` | ${profile.location}`;
        }
    }
}

function createRepoCard(repo) {
    const languageColor = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#1572B6',
        'React': '#61dafb',
        'Vue': '#4FC08D',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'C++': '#f34b7d',
        'C': '#555555',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33'
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };
    
    return `
        <div class="project github-repo" data-repo="${repo.name}">
            <div class="repo-header">
                <h3 class="project-title">
                    <i class="fab fa-github"></i>
                    ${repo.name}
                </h3>
                <div class="repo-stats">
                    <span class="repo-stat">
                        <i class="fas fa-star"></i>
                        ${repo.stargazers_count}
                    </span>
                    <span class="repo-stat">
                        <i class="fas fa-code-branch"></i>
                        ${repo.forks_count}
                    </span>
                </div>
            </div>
            <p class="project-description">
                ${repo.description || 'No description provided.'}
            </p>
            <div class="project-links">
                <div class="repo-details">
                    ${repo.language ? `
                        <span class="repo-language">
                            <span class="language-dot" style="background-color: ${languageColor[repo.language] || '#333'}"></span>
                            ${repo.language}
                        </span>
                    ` : ''}
                    <span class="repo-updated">Updated ${formatDate(repo.updated_at)}</span>
                </div>
                <div class="repo-links">
                    <a href="${repo.html_url}" target="_blank" class="project-link">View Code →</a>
                    ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="project-link">Live Demo →</a>` : ''}
                </div>
            </div>
        </div>
    `;
}

function updateProjectsWithGitHubRepos(repos) {
    if (!repos || repos.length === 0) return;
    
    const projectsSection = document.querySelector('.section h2.section-title');
    if (projectsSection && projectsSection.textContent.includes('Projects')) {
        const section = projectsSection.parentElement;
        
        // Update section title
        projectsSection.innerHTML = 'Recent Projects <span class="github-badge"><i class="fab fa-github"></i> From GitHub</span>';
        
        // Remove existing projects and add GitHub repos
        const existingProjects = section.querySelectorAll('.project');
        existingProjects.forEach(project => project.remove());
        
        repos.forEach(repo => {
            section.insertAdjacentHTML('beforeend', createRepoCard(repo));
        });
        
        // Add "View All" link
        section.insertAdjacentHTML('beforeend', `
            <div class="view-all-repos">
                <a href="https://github.com/${GITHUB_USERNAME}?tab=repositories" target="_blank" class="view-all-link">
                    View All Repositories →
                </a>
            </div>
        `);
    }
}

function createStatsSection(stats) {
    if (!stats) return '';
    
    return `
        <section class="section github-stats">
            <h2 class="section-title">GitHub Stats</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalRepos}</div>
                    <div class="stat-label">Public Repos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.followers}</div>
                    <div class="stat-label">Followers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.following}</div>
                    <div class="stat-label">Following</div>
                </div>
            </div>
            ${stats.topLanguages.length > 0 ? `
                <div class="top-languages">
                    <h3>Most Used Languages</h3>
                    <div class="languages-list">
                        ${stats.topLanguages.map(lang => `<span class="language-tag">${lang}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </section>
    `;
}

// Initialize GitHub integration
async function initGitHubIntegration() {
    if (GITHUB_USERNAME === 'YOUR_GITHUB_USERNAME') {
        console.log('Please update GITHUB_USERNAME in script.js with your actual GitHub username');
        return;
    }
    
    // Show loading state
    const projectsSection = document.querySelector('.section h2.section-title');
    if (projectsSection && projectsSection.textContent.includes('Projects')) {
        projectsSection.innerHTML = 'Loading Projects... <i class="fas fa-spinner fa-spin"></i>';
    }
    
    try {
        // Fetch all GitHub data
        const [profile, repos, stats] = await Promise.all([
            fetchGitHubProfile(),
            fetchGitHubRepos(),
            fetchGitHubStats()
        ]);
        
        // Update profile information
        updateProfileWithGitHubData(profile);
        
        // Update projects with GitHub repos
        updateProjectsWithGitHubRepos(repos);
        
        // Add GitHub stats section
        if (stats) {
            const resumeSection = document.querySelector('.section h2.section-title[textContent*="Resume"]')?.parentElement;
            if (resumeSection) {
                resumeSection.insertAdjacentHTML('beforebegin', createStatsSection(stats));
            }
        }
        
        console.log('GitHub integration completed successfully!');
    } catch (error) {
        console.error('GitHub integration failed:', error);
        // Restore original projects section title
        if (projectsSection) {
            projectsSection.innerHTML = 'Projects & Research';
        }
    }
}

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Initialize GitHub integration
    initGitHubIntegration();
    
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
