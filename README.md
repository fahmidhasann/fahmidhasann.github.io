# Fahmid Hasan's Portfolio - Refactored Version

This is a refactored version of the personal portfolio website for Fahmid Hasan, showcasing his work as an AI and technology enthusiast with a background in agriculture. The website is a modern, responsive single-page application built with HTML, CSS, and JavaScript, featuring interactive elements, animations, and a dark/light mode toggle.

## Key Improvements in Refactoring

### HTML Structure
- Enhanced semantic HTML markup
- Improved accessibility with proper ARIA attributes
- Added SEO optimization with meta tags
- Better document outline structure
- Preloading of critical assets

### CSS Organization
- Restructured with a more modular approach
- Added CSS custom properties for better theme management
- Improved organization with clear section comments
- Optimized selectors and reduced redundancy
- Enhanced responsive design with better breakpoints

### JavaScript Architecture
- Modularized code using ES6+ features
- Implemented proper module pattern for better organization
- Added utility functions for common operations
- Improved error handling and edge case management
- Optimized performance with throttling and debouncing
- Enhanced keyboard navigation and focus management

## Technologies Used

- **HTML5** - Markup language for content structure
- **CSS3** - Styling with modern features like CSS variables, flexbox, grid
- **JavaScript (ES6+)** - Client-side interactivity and DOM manipulation
- **GSAP (GreenSock Animation Platform)** - Advanced animations and scroll effects
- **particles.js** - Interactive particle background in hero section
- **Typed.js** - Text typing animation effect
- **Font Awesome** - Icon library for social media and UI icons
- **Google Fonts** - Inter font family for typography

## Key Features

1. **Responsive Design** - Works on mobile, tablet, and desktop
2. **Dark/Light Theme Toggle** - With localStorage persistence
3. **Animated Hero Section** - With particle background
4. **Interactive Project Filtering** - By category (AI/ML, Web, Data)
5. **Smooth Scrolling Navigation**
6. **Command Palette** - (Ctrl/Cmd + K) for quick navigation
7. **Progress Bar** - That tracks scroll position
8. **Animated Text Typing Effect** - In the hero section
9. **Hover Effects and Scroll Animations** - For content elements
10. **Easter Egg Konami Code Activation**

## Development Guidelines

### CSS Architecture
- CSS variables for theme management (light/dark mode)
- Mobile-first responsive design approach
- BEM-like naming convention for classes
- Extensive use of CSS animations and transitions
- Custom properties for consistent theming

### JavaScript Organization
- Modular initialization functions for different components
- Event delegation for efficient event handling
- LocalStorage for theme persistence
- Intersection Observer API for scroll animations
- Keyboard navigation support (command palette)
- Utility functions for common operations (throttling, debouncing)

### Animations and Effects
- GSAP for complex scroll-triggered animations
- CSS keyframe animations for text and element effects
- Particle.js for interactive background
- Typed.js for text typing effect
- 3D hover effects on project cards
- Smooth scrolling navigation

## Building and Running

This is a static website that can be run directly in any modern browser. No build process is required.

### Local Development
1. Simply open `index.html` in a browser
2. Or serve the directory with a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if http-server is installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

### Deployment
The website can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Traditional web hosting with FTP

## Project Structure

```
.
├── index.html              # Main HTML file
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript file
├── REFACTOR.md             # Refactoring checklist and documentation
├── assets/                 # Media assets directory
│   ├── profile-photo.jpg   # Profile image
│   ├── project_1.jpg       # Video project thumbnail
│   ├── project_2.jpg       # Video project thumbnail
│   ├── project_3.jpg       # Video project thumbnail
│   └── Project/            # Project thumbnails directory
│       ├── drug-discovery.jpeg
│       ├── plantdoc-chatbot.jpeg
│       ├── potato-disease-detector.jpeg
│       ├── bd-choropleth-map.jpeg
│       └── crop-yield-analysis.jpeg
└── README.md               # This file
```

## Browser Support

The website works on all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Performance Considerations

- Lazy loading implemented for images
- All scripts are loaded from CDNs with good performance characteristics
- CSS and JavaScript are optimized for modern browsers
- Minimal dependencies for a lightweight experience
- Throttled scroll events for better performance

## Accessibility Features

- Semantic HTML structure
- Keyboard navigation support
- Focus states for interactive elements
- Proper contrast ratios for text
- ARIA labels for icon-only buttons
- Responsive design for different screen sizes
- Skip to content link for keyboard users

## Future Improvements

1. Add resume download functionality
2. Implement more detailed project pages
3. Include a blog section
4. Add contact form functionality
5. Implement service worker for offline support
6. Add more comprehensive accessibility features
7. Implement more advanced performance optimizations