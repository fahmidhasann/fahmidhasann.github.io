// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initializeTheme();
  initializeParticles();
  initializeTextAnimations();
  initializeScrollEffects();
  initializeNavigation();
  initializeProjectFiltering();
  initializeShowMore();
  initializeCommandPalette();
  initializeDarkModeToggle();
  initializeHoverEffects();
  initializeNavScroll();
  initializeContactForm();
  initializeEasterEgg();
  
  // Add scroll event listener for progress bar
  window.addEventListener('scroll', updateProgressBar);
});

/* ==========================================================================
   Theme Functions
   ========================================================================== */

/**
 * Initialize the theme based on localStorage or default to light
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  const toggleButton = document.querySelector('.dark-mode-toggle');
  if (toggleButton) {
    toggleButton.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
}

/* ==========================================================================
   Animation & Visual Effects
   ========================================================================== */

/**
 * Initialize the particle background effect
 */
function initializeParticles() {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 60,
          density: {
            enable: true,
            value_area: 900
          }
        },
        color: {
          value: "#ffffff"
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000"
          }
        },
        opacity: {
          value: 0.45,
          random: true,
          anim: {
            enable: true,
            speed: 0.5,
            opacity_min: 0.15,
            sync: false
          }
        },
        size: {
          value: 2.5,
          random: true,
          anim: {
            enable: false
          }
        },
        line_linked: {
          enable: true,
          distance: 160,
          color: "#ffffff",
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 0.5,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false
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
            enable: false
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.5
            }
          }
        }
      },
      retina_detect: true
    });
  }
}

/**
 * Initialize the typed text animation
 */
function initializeTextAnimations() {
  if (typeof Typed !== 'undefined') {
    new Typed('.typed-text', {
      strings: [
        'Agriculture',
        'AI, ML and Automation',
        'Storytelling'
      ],
      typeSpeed: 45,
      backSpeed: 25,
      loop: true,
      backDelay: 3000,
      startDelay: 1500,
      showCursor: true,
      cursorChar: '|',
      autoInsertCss: true,
      smartBackspace: true
    });
  }
}

/**
 * Initialize scroll-triggered animations
 */
function initializeScrollEffects() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.utils.toArray('.project-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=50',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.08
      });
    });

    gsap.utils.toArray('.video-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=50',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.08
      });
    });

    gsap.utils.toArray('.contact-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top bottom-=50',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.08
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
    
    document.querySelectorAll('.project-card, .video-card, .contact-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }
}

/**
 * Update the progress bar based on scroll position
 */
function updateProgressBar() {
  const progressBar = document.querySelector('.progress-bar');
  if (!progressBar) return;
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  progressBar.style.width = scrolled + '%';
}

/* ==========================================================================
   Navigation Functions
   ========================================================================== */

/**
 * Initialize smooth scrolling navigation
 */
function initializeNavigation() {
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
        const navMenu = document.getElementById('navMenu');
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
        }
      }
    });
  });
  
  // Handle mobile navigation toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

/* ==========================================================================
   Project Functions
   ========================================================================== */

/**
 * Initialize project filtering functionality
 */
function initializeProjectFiltering() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const VISIBLE_COUNT = 3;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const showMoreBtn = document.getElementById('projectsShowMore');

      // Collect cards that match the filter
      const matchingCards = [];
      projectCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          matchingCards.push(card);
        }
      });

      // Apply visibility based on filter match and show-more state
      projectCards.forEach(card => {
        const matches = filter === 'all' || card.getAttribute('data-category') === filter;
        if (!matches) {
          card.classList.remove('hidden-card');
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        } else {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        }
      });

      // Reset show-more state for the new filtered set
      if (showMoreBtn) {
        if (matchingCards.length > VISIBLE_COUNT) {
          matchingCards.forEach((card, i) => {
            if (i >= VISIBLE_COUNT) {
              card.classList.add('hidden-card');
            } else {
              card.classList.remove('hidden-card');
            }
          });
          showMoreBtn.setAttribute('aria-expanded', 'false');
          const label = showMoreBtn.querySelector('.show-more-label');
          if (label) label.textContent = 'Show More Projects';
          showMoreBtn.style.display = '';
        } else {
          matchingCards.forEach(card => card.classList.remove('hidden-card'));
          showMoreBtn.style.display = 'none';
        }
      }
    });
  });
}

/**
 * Show/hide items beyond the initial visible count with a toggle button.
 * Works independently for projects and videos.
 */
function initializeShowMore() {
  const VISIBLE_COUNT = 3;

  function setup(gridId, btnId) {
    const grid = document.getElementById(gridId);
    const btn = document.getElementById(btnId);
    if (!grid || !btn) return;

    // Mark cards beyond the initial count as hidden
    const allItems = Array.from(grid.children);
    allItems.forEach((item, i) => {
      if (i >= VISIBLE_COUNT) {
        item.classList.add('hidden-card');
      }
    });

    // Only show the button when there are more items than VISIBLE_COUNT
    if (allItems.length <= VISIBLE_COUNT) {
      btn.style.display = 'none';
      return;
    }

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      const label = btn.querySelector('.show-more-label');
      const isProjects = gridId === 'projectsGrid';

      if (isExpanded) {
        // Collapse: hide cards beyond visible count
        allItems.forEach((item, i) => {
          if (i >= VISIBLE_COUNT) item.classList.add('hidden-card');
        });
        btn.setAttribute('aria-expanded', 'false');
        if (label) label.textContent = isProjects ? 'Show More Projects' : 'Show More Videos';
      } else {
        // Expand: show all cards
        allItems.forEach(item => item.classList.remove('hidden-card'));
        btn.setAttribute('aria-expanded', 'true');
        if (label) label.textContent = isProjects ? 'Show Less Projects' : 'Show Less Videos';
      }
    });
  }

  setup('projectsGrid', 'projectsShowMore');
  setup('videosGrid', 'videosShowMore');
}

/* ==========================================================================
   Command Palette Functions
   ========================================================================== */

/**
 * Initialize the command palette functionality
 */
function initializeCommandPalette() {
  const commandPalette = document.getElementById('commandPalette');
  const commandInput = document.getElementById('commandInput');
  const commandList = document.getElementById('commandList');
  
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
      executeCommand(e.target.getAttribute('data-action'));
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
          executeCommand(activeElement.getAttribute('data-action'));
        }
        break;
    }
  });
  
  commandInput.addEventListener('input', () => {
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
  });
}

/**
 * Execute a command from the command palette
 */
function executeCommand(action) {
  const commandPalette = document.getElementById('commandPalette');
  commandPalette.classList.remove('active');
  
  switch (action) {
    case 'home':
      scrollToSection('hero');
      break;
    case 'projects':
      scrollToSection('projects');
      break;
    case 'videos':
      scrollToSection('videos');
      break;
    case 'contact':
      scrollToSection('contact');
      break;
    case 'dark-mode':
      toggleTheme();
      break;
  }
}

/**
 * Scroll to a specific section
 */
function scrollToSection(sectionId) {
  const targetElement = document.getElementById(sectionId);
  if (targetElement) {
    window.scrollTo({
      top: targetElement.offsetTop,
      behavior: 'smooth'
    });
  }
}

/* ==========================================================================
   UI Components
   ========================================================================== */

/**
 * Initialize the dark mode toggle button
 */
function initializeDarkModeToggle() {
  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  toggleButton.classList.add('dark-mode-toggle');
  toggleButton.setAttribute('aria-label', 'Toggle dark mode');
  toggleButton.addEventListener('click', toggleTheme);

  document.body.appendChild(toggleButton);
}

/**
 * Initialize hover effects (3D effects removed for cleaner aesthetic)
 */
function initializeHoverEffects() {
  const backdrop = document.getElementById('videoPopupBackdrop');
  const popup = document.getElementById('videoPopup');
  const popupPlayer = document.getElementById('videoPopupPlayer');
  const popupTitle = document.getElementById('videoPopupTitle');
  const closeBtn = document.getElementById('videoPopupClose');
  if (!backdrop || !popup || !popupPlayer) return;

  function showPopup(card) {
    const src = card.dataset.video;
    const title = card.dataset.title || '';
    if (!src) return;
    if (popupPlayer.src !== new URL(src, location.href).href) {
      popupPlayer.src = src;
    }
    popupTitle.textContent = title;
    backdrop.classList.add('visible');
    popup.classList.add('visible');
    popupPlayer.currentTime = 0;
    popupPlayer.play();
  }

  function hidePopup() {
    backdrop.classList.remove('visible');
    popup.classList.remove('visible');
    popupPlayer.pause();
  }

  // Open on "Watch Demo" button click
  document.querySelectorAll('.btn-demo').forEach(btn => {
    const card = btn.closest('.project-card[data-video]');
    if (card) btn.addEventListener('click', () => showPopup(card));
  });

  // Close on backdrop click, close button, or Escape
  backdrop.addEventListener('click', hidePopup);
  if (closeBtn) closeBtn.addEventListener('click', hidePopup);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hidePopup(); });
}

/**
 * Add scroll-aware styling to navigation
 */
function initializeNavScroll() {
  const nav = document.querySelector('.compact-nav');
  if (!nav) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   Easter Egg Functions
   ========================================================================== */

/**
 * Initialize the contact form with Web3Forms submission
 */
function initializeContactForm() {
  const form = document.getElementById('contactForm');
  const result = document.getElementById('formResult');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.contact-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.fa-paper-plane');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Loading state
    btnText.style.display = 'none';
    btnIcon.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        result.textContent = 'Message sent! I\'ll get back to you soon.';
        result.className = 'form-result success';
        form.reset();
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch {
      result.textContent = 'Failed to send message. Please try emailing me directly.';
      result.className = 'form-result error';
    } finally {
      btnText.style.display = 'inline';
      btnIcon.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;

      setTimeout(() => {
        result.textContent = '';
        result.className = 'form-result';
      }, 5000);
    }
  });
}

/**
 * Initialize the Konami code easter egg
 */
function initializeEasterEgg() {
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
        activateEasterEgg();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

/**
 * Activate the easter egg effect
 */
function activateEasterEgg() {
  const body = document.body;
  body.classList.add('konami-activated');
  createConfetti();
  
  setTimeout(() => {
    body.classList.remove('konami-activated');
  }, 5000);
}

/**
 * Create confetti effect for the easter egg
 */
function createConfetti() {
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
        transform: translateY(100vh) rotate(720deg);
      }
    }
  `;
  
  document.head.appendChild(style);
  
  setTimeout(() => {
    confettiContainer.remove();
    style.remove();
  }, 5000);
}