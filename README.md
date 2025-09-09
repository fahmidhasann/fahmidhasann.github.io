# Personal Portfolio Website

A clean, modern portfolio website inspired by professional GitHub profiles. Built with vanilla HTML, CSS, and JavaScript - no frameworks required!

## ✨ Features

- **Clean, Modern Design** - Professional layout similar to high-quality GitHub profiles
- **Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode Toggle** - Built-in dark/light mode with persistent user preference
- **Smooth Animations** - Subtle animations and hover effects for better UX
- **SEO Optimized** - Proper meta tags and semantic HTML structure
- **Fast Loading** - Optimized CSS and JavaScript for quick page loads
- **Accessibility** - Proper focus states and semantic markup
- **GitHub Pages Ready** - Easy deployment to GitHub Pages (100% free!)

## 🚀 Quick Setup

### 1. Customize Your Information

Edit `index.html` and replace the placeholder content:

- **Line 7**: Change the page title
- **Line 17**: Replace "Your Name" with your actual name
- **Line 18**: Update your professional title
- **Line 19**: Write your own description
- **Lines 22-33**: Update social media links
- **Projects Section (Lines 40-78)**: Add your actual projects
- **Updates Section (Lines 83-97)**: Add your recent updates
- **Blog Section (Lines 109-133)**: Add your blog posts or articles

### 2. Add Your Resume

Create a PDF of your resume and either:
- Upload it to your repository and link to it
- Link to an external resume hosting service
- Update the resume section with your experience details

### 3. Deploy to GitHub Pages (FREE!)

1. Create a new repository on GitHub named `your-username.github.io`
2. Upload all files to this repository
3. Go to repository Settings → Pages
4. Set source to "Deploy from a branch" and select "main"
5. Your site will be live at `https://your-username.github.io`

## 📁 File Structure

```
portfolio/
├── index.html          # Main HTML file
├── styles.css          # All styling and responsive design
├── script.js           # Interactive features and animations
└── README.md           # This file
```

## 🎨 Customization

### Colors
The color scheme uses CSS variables. You can easily change the primary color by updating the `#007acc` value throughout `styles.css`.

### Fonts
The site uses Inter font from Google Fonts. You can change it by updating the font imports in the HTML head.

### Adding Images
To add project images or a profile photo:
1. Create an `images/` folder
2. Add your images
3. Update the HTML `src` attributes
4. Use the lazy loading pattern already set up in `script.js`

### Adding a Contact Form
The JavaScript includes a contact form handler. To add a contact form:
1. Add the form HTML to `index.html`
2. Connect it to a service like Formspree, Netlify Forms, or EmailJS
3. Update the `handleContactForm` function in `script.js`

## 🔧 Advanced Features

### Analytics
Add Google Analytics or other tracking by inserting the tracking code in the HTML head.

### Blog Integration
Connect to your Medium, Dev.to, or personal blog by updating the blog section links.

### Dynamic Content
The JavaScript is set up to handle dynamic content loading if you want to connect to a CMS or API.

## 📱 Browser Support

- Chrome/Edge/Safari (latest 2 versions)
- Firefox (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Performance

- Optimized CSS with minimal unused styles
- Lazy loading for images
- Efficient JavaScript with intersection observers
- Fast Google Fonts loading with display=swap

## 📝 Content Ideas

### Projects Section
- GitHub repositories with descriptions
- Live demo links
- Technology stacks used
- Problem solved and impact

### Blog Section
- Technical tutorials
- Project case studies
- Industry insights
- Open source contributions

### Updates Section
- Recent achievements
- New projects launched
- Learning milestones
- Conference talks or articles

## 🤝 Contributing

Feel free to fork this project and customize it for your own use! If you make improvements, consider sharing them back.

## 📄 License

This project is open source and available under the MIT License.

---

**Pro Tip**: Update your content regularly to keep your portfolio fresh and engaging. Add new projects, blog posts, and achievements as you grow in your career!

## 🎯 Next Steps

1. ✅ Customize all personal information
2. ✅ Add your real projects and experiences
3. ✅ Deploy to GitHub Pages
4. ✅ Share your new portfolio on social media
5. ✅ Keep it updated with new content

Happy coding! 🚀
