# 🚀 GitHub Pages Deployment Guide

## Step 1: Prepare Your Repository

1. **Create a new repository** on GitHub with the name: `your-username.github.io`
   - Replace `your-username` with your actual GitHub username
   - Make sure it's public
   - Don't initialize with README (we already have one)

## Step 2: Upload Your Files

### Option A: Using GitHub Web Interface
1. Go to your new repository
2. Click "uploading an existing file"
3. Drag and drop all these files:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`

### Option B: Using Git Commands
```bash
# Navigate to your portfolio folder
cd "/Users/fahmidhasan/Downloads/My Portfolio"

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial portfolio setup"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under "Source", select **"Deploy from a branch"**
5. Select **"main"** branch
6. Click **Save**

## Step 4: Access Your Live Site

Your portfolio will be available at: `https://your-username.github.io`

⏰ **Note**: It may take a few minutes to become available after first deployment.

## Step 5: Customize Your Content

Before going live, make sure to update:

### Essential Updates in `index.html`:
- [ ] Page title (line 7)
- [ ] Your name (line 17)
- [ ] Professional title (line 18)
- [ ] Description (line 19)
- [ ] Social media links (lines 22-33)
- [ ] All project information
- [ ] Blog posts/articles
- [ ] Contact information

### Quick Customization Checklist:
- [ ] Replace placeholder projects with your real work
- [ ] Add links to your GitHub repositories
- [ ] Update social media profiles
- [ ] Add your email address
- [ ] Upload and link your resume
- [ ] Test all links work correctly

## 🎨 Pro Tips

1. **Custom Domain** (Optional): You can use a custom domain by adding a `CNAME` file
2. **SEO**: Update meta descriptions and add Open Graph tags
3. **Analytics**: Add Google Analytics tracking code
4. **Performance**: Optimize images before uploading
5. **Mobile Testing**: Always test on mobile devices

## 🔄 Making Updates

After initial setup, you can update your portfolio by:
1. Editing files locally
2. Committing changes: `git add . && git commit -m "Update portfolio"`
3. Pushing to GitHub: `git push`
4. Changes will automatically deploy within minutes

## 🆘 Troubleshooting

### Site not loading?
- Check that the repository name is exactly `your-username.github.io`
- Ensure the repository is public
- Wait up to 10 minutes for first deployment

### CSS not loading?
- Check file names are exactly: `styles.css`, `script.js`
- Ensure all files are in the root directory
- Clear browser cache

### Links not working?
- Update all social media URLs
- Test each link before going live
- Use `https://` for external links

---

🎉 **Congratulations!** You now have a professional portfolio website hosted for free on GitHub Pages!
