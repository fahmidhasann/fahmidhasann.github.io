# Fahmid Hasan's Portfolio Website - Context for Qwen Code

## Project Overview

This is a personal portfolio website for Fahmid Hasan, showcasing his work as an AI and technology enthusiast with a background in agriculture. The website is a modern, responsive single-page application built with HTML, CSS, and JavaScript, featuring interactive elements, animations, and a dark/light mode toggle.

### Key Features
- Responsive design that works on mobile, tablet, and desktop
- Dark/light theme toggle with localStorage persistence
- Animated hero section with particle background
- Interactive project filtering by category (AI/ML, Web, Data)
- Smooth scrolling navigation
- Command palette (Ctrl/Cmd + K) for quick navigation
- Progress bar that tracks scroll position
- Animated text typing effect in the hero section
- Hover effects and scroll animations for content elements
- Easter egg Konami code activation

## Project Structure

```
.
├── index.html              # Main HTML file
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript file
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
└── QWEN.md                 # This file
```

## Technologies Used

- **HTML5** - Markup language for content structure
- **CSS3** - Styling with modern features like CSS variables, flexbox, grid
- **JavaScript (ES6+)** - Client-side interactivity and DOM manipulation
- **GSAP (GreenSock Animation Platform)** - Advanced animations and scroll effects
- **particles.js** - Interactive particle background in hero section
- **Typed.js** - Text typing animation effect
- **Font Awesome** - Icon library for social media and UI icons
- **Google Fonts** - Inter font family for typography

## Key Sections

1. **Hero Section** - Introduction with animated name, profile image, and call-to-action buttons
2. **Projects Section** - Portfolio projects with filtering capability
3. **Videos Section** - Video projects with thumbnails and descriptions
4. **Contact Section** - Contact information and social media links
5. **Footer** - Copyright and availability status

## Development Conventions

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

## Customization Guide

### Changing Content
- **Personal Information**: Modify the content in `index.html` (name, description, projects, etc.)
- **Images**: Replace images in the `assets/` directory
- **Projects**: Update project cards in the projects section of `index.html`
- **Videos**: Update video cards in the videos section of `index.html`

### Theme Customization
- **Colors**: Modify CSS variables in `:root` selector in `styles.css`
- **Fonts**: Update font imports in `index.html` and `--font-primary` variable in `styles.css`

### Adding New Sections
1. Add new section HTML in `index.html`
2. Add corresponding CSS styles in `styles.css`
3. Add JavaScript initialization if needed in `script.js`

## Key JavaScript Functions

- `initializeTheme()` - Sets up light/dark theme based on localStorage
- `toggleTheme()` - Switches between light and dark themes
- `initializeParticles()` - Initializes particle background effect
- `initializeTextAnimations()` - Sets up typed text animation
- `initializeScrollEffects()` - Adds scroll-triggered animations
- `initializeNavigation()` - Sets up smooth scrolling navigation
- `initializeProjectFiltering()` - Enables project category filtering
- `initializeCommandPalette()` - Sets up keyboard command palette
- `initializeEasterEgg()` - Enables Konami code easter egg

## Performance Considerations

- Lazy loading is not currently implemented but could be added for images
- All scripts are loaded from CDNs with good performance characteristics
- CSS and JavaScript are optimized for modern browsers
- Minimal dependencies for a lightweight experience

## Accessibility Features

- Semantic HTML structure
- Keyboard navigation support
- Focus states for interactive elements
- Proper contrast ratios for text
- ARIA labels for icon-only buttons
- Responsive design for different screen sizes

## Future Improvements

1. Add resume download functionality
2. Implement lazy loading for images
3. Add more detailed project pages
4. Include a blog section
5. Add contact form functionality
6. Implement service worker for offline support