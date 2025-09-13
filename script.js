document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();
  initializeParticles();
  initializeTextAnimations();
  initializeScrollEffects();
  initializeNavigation();
  initializeProjectFiltering();
  initializeCommandPalette();
  initializeDarkModeToggle();
  initializeHoverEffects();
  initializeEasterEgg();
  
  window.addEventListener('scroll', updateProgressBar);
  window.addEventListener('scroll', updateActiveNavDot);
});

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  const toggleButton = document.querySelector('.dark-mode-toggle');
  if (toggleButton) {
    toggleButton.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
  }
}

function initializeParticles() {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800
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
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
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
          distance: 150,
          color: "#ffffff",
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
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
}

function initializeTextAnimations() {
  if (typeof Typed !== 'undefined') {
    new Typed('.typed-text', {
      strings: [
        'AI and Tech Enthusiast',
        'Agriculture Undergraduate',
        'Problem Solver',
        'Storyteller'
      ],
      typeSpeed: 60,
      backSpeed: 40,
      loop: true,
      backDelay: 1500,
      startDelay: 1000,
      showCursor: true,
      cursorChar: '|',
      autoInsertCss: true,
      smartBackspace: true
    });
  }
}

function initializeScrollEffects() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.utils.toArray('.project-card').forEach((card, i) => {
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
    
    gsap.utils.toArray('.video-card').forEach((card, i) => {
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
    
    gsap.utils.toArray('.contact-card').forEach((card, i) => {
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
    
    document.querySelectorAll('.project-card, .video-card, .contact-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }
}

function updateProgressBar() {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  document.querySelector('.progress-bar').style.width = scrolled + '%';
}

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

function updateActiveNavDot() {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let currentSection = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
      currentSection = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

function initializeProjectFiltering() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
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
    case 'download-resume':
      alert('Resume download functionality would be implemented here.');
      break;
  }
}

function scrollToSection(sectionId) {
  const targetElement = document.getElementById(sectionId);
  if (targetElement) {
    window.scrollTo({
      top: targetElement.offsetTop,
      behavior: 'smooth'
    });
  }
}

function initializeDarkModeToggle() {
  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  toggleButton.classList.add('dark-mode-toggle');
  toggleButton.setAttribute('aria-label', 'Toggle dark mode');
  toggleButton.addEventListener('click', toggleTheme);
  
  document.body.appendChild(toggleButton);
}

function initializeHoverEffects() {
  document.querySelectorAll('.project-card').forEach(card => {
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

function activateEasterEgg() {
  const body = document.body;
  body.classList.add('konami-activated');
  createConfetti();
  
  setTimeout(() => {
    body.classList.remove('konami-activated');
  }, 5000);
}

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

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}