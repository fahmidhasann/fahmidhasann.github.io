// Portfolio JavaScript Module
// Organized with modern ES6+ syntax and improved structure

// Configuration object for easy modification
const CONFIG = {
  THEMING: {
    STORAGE_KEY: 'theme',
    DARK_THEME: 'dark',
    LIGHT_THEME: 'light'
  },
  ANIMATION: {
    PARTICLES: {
      COUNT: 80,
      COLOR: "#ffffff",
      OPACITY: 0.5,
      SIZE: 3,
      LINE_DISTANCE: 150,
      MOVE_SPEED: 1
    },
    TYPED: {
      STRINGS: [
        'AI and Tech Enthusiast',
        'Agriculture Undergraduate',
        'Problem Solver',
        'Storyteller'
      ],
      TYPE_SPEED: 60,
      BACK_SPEED: 40,
      BACK_DELAY: 1500,
      START_DELAY: 1000
    }
  },
  SELECTORS: {
    THEME_ATTR: 'data-theme',
    NAV_TOGGLE: '#navToggle',
    NAV_MENU: '#navMenu',
    PROGRESS_BAR: '.progress-bar',
    PROJECT_CARDS: '.project-card',
    VIDEO_CARDS: '.video-card',
    CONTACT_CARDS: '.contact-card',
    FILTER_BTNS: '.filter-btn',
    COMMAND_PALETTE: '#commandPalette',
    COMMAND_INPUT: '#commandInput',
    COMMAND_LIST: '#commandList'
  }
};

// Utility functions
const Utils = {
  // Throttle function to limit event firing rate
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  },
  
  // Debounce function to delay function execution
  debounce(func, delay) {
    let timeoutId;
    return function() {
      const args = arguments;
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(context, args), delay);
    }
  },
  
  // Check if element exists before accessing
  elementExists(selector) {
    return document.querySelector(selector) !== null;
  }
};

// Theme Management Module
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem(CONFIG.THEMING.STORAGE_KEY) || CONFIG.THEMING.LIGHT_THEME;
    document.documentElement.setAttribute(CONFIG.SELECTORS.THEME_ATTR, savedTheme);
    this.createToggleButton();
  },
  
  toggle() {
    const currentTheme = document.documentElement.getAttribute(CONFIG.SELECTORS.THEME_ATTR);
    const newTheme = currentTheme === CONFIG.THEMING.DARK_THEME ? CONFIG.THEMING.LIGHT_THEME : CONFIG.THEMING.DARK_THEME;
    document.documentElement.setAttribute(CONFIG.SELECTORS.THEME_ATTR, newTheme);
    localStorage.setItem(CONFIG.THEMING.STORAGE_KEY, newTheme);
    
    const toggleButton = document.querySelector('.dark-mode-toggle');
    if (toggleButton) {
      toggleButton.innerHTML = newTheme === CONFIG.THEMING.DARK_THEME ? '☀️' : '🌙';
    }
  },
  
  createToggleButton() {
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = document.documentElement.getAttribute(CONFIG.SELECTORS.THEME_ATTR) === CONFIG.THEMING.DARK_THEME ? '☀️' : '🌙';
    toggleButton.classList.add('dark-mode-toggle');
    toggleButton.setAttribute('aria-label', 'Toggle dark mode');
    toggleButton.addEventListener('click', () => this.toggle());
    document.body.appendChild(toggleButton);
  }
};

// Animation Module
const AnimationManager = {
  init() {
    this.initParticles();
    this.initTextAnimations();
    this.initScrollEffects();
    this.initHoverEffects();
  },
  
  initParticles() {
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: {
            value: CONFIG.ANIMATION.PARTICLES.COUNT,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: CONFIG.ANIMATION.PARTICLES.COLOR
          },
          shape: {
            type: "circle",
            stroke: {
              width: 0,
              color: "#000000"
            }
          },
          opacity: {
            value: CONFIG.ANIMATION.PARTICLES.OPACITY,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: CONFIG.ANIMATION.PARTICLES.SIZE,
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.1,
              sync: false
            }
          },
          line_linked: {
            enable: true,
            distance: CONFIG.ANIMATION.PARTICLES.LINE_DISTANCE,
            color: CONFIG.ANIMATION.PARTICLES.COLOR,
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: CONFIG.ANIMATION.PARTICLES.MOVE_SPEED,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "grab"
            },
            onclick: {
              enable: true,
              mode: "push"
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 1
              }
            },
            push: {
              particles_nb: 4
            }
          }
        },
        retina_detect: true
      });
    }
  },
  
  initTextAnimations() {
    if (typeof Typed !== 'undefined') {
      new Typed('.typed-text', {
        strings: CONFIG.ANIMATION.TYPED.STRINGS,
        typeSpeed: CONFIG.ANIMATION.TYPED.TYPE_SPEED,
        backSpeed: CONFIG.ANIMATION.TYPED.BACK_SPEED,
        loop: true,
        backDelay: CONFIG.ANIMATION.TYPED.BACK_DELAY,
        startDelay: CONFIG.ANIMATION.TYPED.START_DELAY,
        showCursor: true,
        cursorChar: '|',
        autoInsertCss: true,
        smartBackspace: true
      });
    }
  },
  
  initScrollEffects() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      
      gsap.utils.toArray(CONFIG.SELECTORS.PROJECT_CARDS).forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
          },
          y: 100,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.1
        });
      });
      
      gsap.utils.toArray(CONFIG.SELECTORS.VIDEO_CARDS).forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
          },
          y: 100,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.1
        });
      });
      
      gsap.utils.toArray(CONFIG.SELECTORS.CONTACT_CARDS).forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
          },
          y: 100,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.1
        });
      });
    } else {
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
      
      document.querySelectorAll(`${CONFIG.SELECTORS.PROJECT_CARDS}, ${CONFIG.SELECTORS.VIDEO_CARDS}, ${CONFIG.SELECTORS.CONTACT_CARDS}`).forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });
    }
  },
  
  initHoverEffects() {
    document.querySelectorAll(CONFIG.SELECTORS.PROJECT_CARDS).forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const cardRect = card.getBoundingClientRect();
        const x = e.clientX - cardRect.left;
        const y = e.clientY - cardRect.top;
        
        const centerX = cardRect.width / 2;
        const centerY = cardRect.height / 2;
        
        const rotateY = (x - centerX) / 25;
        const rotateX = (centerY - y) / 25;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }
};

// Navigation Module
const NavigationManager = {
  init() {
    this.initSmoothScrolling();
    this.initMobileNavigation();
  },
  
  initSmoothScrolling() {
    // Handle all anchor links with hash
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          const navMenu = document.querySelector(CONFIG.SELECTORS.NAV_MENU);
          if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            // Update aria-expanded attribute for accessibility
            const navToggle = document.querySelector(CONFIG.SELECTORS.NAV_TOGGLE);
            if (navToggle) {
              navToggle.setAttribute('aria-expanded', 'false');
            }
          }
        }
      });
    });
  },
  
  initMobileNavigation() {
    const navToggle = document.querySelector(CONFIG.SELECTORS.NAV_TOGGLE);
    const navMenu = document.querySelector(CONFIG.SELECTORS.NAV_MENU);
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Update aria-expanded attribute for accessibility
        const isExpanded = navMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
      });
    }
  }
};

// Project Filtering Module
const ProjectFilterManager = {
  init() {
    const filterBtns = document.querySelectorAll(CONFIG.SELECTORS.FILTER_BTNS);
    const projectCards = document.querySelectorAll(CONFIG.SELECTORS.PROJECT_CARDS);
    
    if (!filterBtns.length || !projectCards.length) return;
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        projectCards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }
};

// Command Palette Module
const CommandPaletteManager = {
  init() {
    const commandPalette = document.querySelector(CONFIG.SELECTORS.COMMAND_PALETTE);
    const commandInput = document.querySelector(CONFIG.SELECTORS.COMMAND_INPUT);
    const commandList = document.querySelector(CONFIG.SELECTORS.COMMAND_LIST);
    
    if (!commandPalette || !commandInput || !commandList) return;
    
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        commandPalette.classList.toggle('active');
        if (commandPalette.classList.contains('active')) {
          commandInput.focus();
        }
      }
      
      if (e.key === 'Escape') {
        commandPalette.classList.remove('active');
      }
    });
    
    commandList.addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
        this.executeCommand(e.target.getAttribute('data-action'));
      }
    });
    
    commandInput.addEventListener('keydown', (e) => {
      const activeElement = commandList.querySelector('.active');
      let newActiveElement;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (activeElement) {
            newActiveElement = activeElement.nextElementSibling || commandList.firstElementChild;
            activeElement.classList.remove('active');
          } else {
            newActiveElement = commandList.firstElementChild;
          }
          if (newActiveElement) {
            newActiveElement.classList.add('active');
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (activeElement) {
            newActiveElement = activeElement.previousElementSibling || commandList.lastElementChild;
            activeElement.classList.remove('active');
          } else {
            newActiveElement = commandList.lastElementChild;
          }
          if (newActiveElement) {
            newActiveElement.classList.add('active');
          }
          break;
          
        case 'Enter':
          e.preventDefault();
          if (activeElement) {
            this.executeCommand(activeElement.getAttribute('data-action'));
          }
          break;
      }
    });
    
    commandInput.addEventListener('input', Utils.debounce(() => {
      const filter = commandInput.value.toLowerCase();
      const commands = commandList.querySelectorAll('li');
      
      commands.forEach(command => {
        const text = command.textContent.toLowerCase();
        if (text.includes(filter)) {
          command.style.display = 'block';
        } else {
          command.style.display = 'none';
        }
      });
    }, 300));
  },
  
  executeCommand(action) {
    const commandPalette = document.querySelector(CONFIG.SELECTORS.COMMAND_PALETTE);
    commandPalette.classList.remove('active');
    
    switch (action) {
      case 'home':
        this.scrollToSection('hero');
        break;
      case 'projects':
        this.scrollToSection('projects');
        break;
      case 'videos':
        this.scrollToSection('videos');
        break;
      case 'contact':
        this.scrollToSection('contact');
        break;
      case 'dark-mode':
        ThemeManager.toggle();
        break;
      case 'download-resume':
        this.showNotification('Resume download functionality would be implemented here.');
        break;
    }
  },
  
  scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth'
      });
    }
  },
  
  showNotification(message) {
    // Create a more user-friendly notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary, #0066FF);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-weight: 500;
    `;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
};

// Progress Bar Module
const ProgressBarManager = {
  init() {
    window.addEventListener('scroll', Utils.throttle(() => this.update(), 10));
  },
  
  update() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressBar = document.querySelector(CONFIG.SELECTORS.PROGRESS_BAR);
    if (progressBar) {
      progressBar.style.width = scrolled + '%';
    }
  }
};

// Easter Egg Module
const EasterEggManager = {
  init() {
    const konamiCode = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'KeyB',
      'KeyA'
    ];
    
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
      if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        
        if (konamiIndex === konamiCode.length) {
          this.activate();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });
  },
  
  activate() {
    const body = document.body;
    body.classList.add('konami-activated');
    this.createConfetti();
    
    setTimeout(() => {
      body.classList.remove('konami-activated');
    }, 5000);
  },
  
  createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(confettiContainer);
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: hsl(${Math.random() * 360}, 100%, 50%);
        top: -10px;
        left: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.5 + 0.5};
        transform: rotate(${Math.random() * 360}deg);
        animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
      `;
      
      confettiContainer.appendChild(confetti);
    }
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(0) rotate(0deg);
        }
        100% {
          transform: translateY(100vh) rotate(${Math.random() * 360}deg);
        }
      }
    `;
    
    document.head.appendChild(style);
    
    setTimeout(() => {
      confettiContainer.remove();
      style.remove();
    }, 5000);
  }
};

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all modules
  ThemeManager.init();
  AnimationManager.init();
  NavigationManager.init();
  ProjectFilterManager.init();
  CommandPaletteManager.init();
  ProgressBarManager.init();
  EasterEggManager.init();
  
  // Set current year in footer
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
});

