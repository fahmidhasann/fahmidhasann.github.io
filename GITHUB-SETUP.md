# 🔗 GitHub API Integration Setup Guide

Your portfolio now has **dynamic GitHub integration** that automatically fetches and displays your latest repositories, profile information, and GitHub statistics!

## 🚀 Quick Setup (2 minutes)

### Step 1: Update Your GitHub Username
Open `script.js` and find this line:
```javascript
const GITHUB_USERNAME = 'YOUR_GITHUB_USERNAME';
```

Replace `'YOUR_GITHUB_USERNAME'` with your actual GitHub username. For example:
```javascript
const GITHUB_USERNAME = 'fahmidhasan'; // Replace with your username
```

### Step 2: Deploy and Test
That's it! Once you update the username and deploy to GitHub Pages, your portfolio will automatically:

## ✨ What It Does Automatically

### 📊 Profile Information
- Updates your name from GitHub profile
- Shows your bio as the description
- Updates GitHub profile links
- Adds your location to the title

### 🚀 Dynamic Projects Section
- Fetches your 6 most recently updated repositories
- Shows repository descriptions, languages, and stats
- Displays star count and fork count
- Filters out forked repositories
- Shows last updated dates
- Adds links to both code and live demos

### 📈 GitHub Statistics
- Total public repositories
- Follower and following counts
- Top 5 most used programming languages
- Beautiful stats cards with gradient design

### 🎨 Visual Features
- Language color coding (JavaScript = yellow, Python = blue, etc.)
- Loading animations while fetching data
- Responsive design for all devices
- Dark mode compatibility
- Smooth hover effects

## 🔧 Customization Options

### Fetch More Repositories
In `script.js`, change this line to show more repos:
```javascript
const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
```
Change `per_page=6` to any number (max 100).

### Change Repository Sorting
Options for `sort` parameter:
- `updated` - Most recently updated (default)
- `created` - Most recently created
- `pushed` - Most recently pushed
- `full_name` - Alphabetical

### Include Forked Repositories
Remove this line to show forked repos too:
```javascript
return repos.filter(repo => !repo.fork);
```

### Add More Language Colors
In the `languageColor` object, add more programming languages:
```javascript
const languageColor = {
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'YourLanguage': '#yourcolor',
    // Add more languages
};
```

## 🔄 How It Updates

- **Automatic**: Every time someone visits your portfolio
- **Real-time**: Shows your latest repositories and stats
- **No maintenance**: You never need to manually update project lists
- **Fast**: Uses GitHub's CDN for quick loading

## 🚨 Rate Limits

GitHub API allows:
- **60 requests per hour** for unauthenticated requests
- **5000 requests per hour** with authentication

For a personal portfolio, 60/hour is plenty! Each page visit uses 3-4 requests.

## 🔐 Optional: Add GitHub Token (For Higher Limits)

If you need higher rate limits, you can add a GitHub Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `public_repo` permission
3. Add it to your script:

```javascript
const GITHUB_TOKEN = 'your_token_here'; // Optional

// Update fetch calls to include auth
const response = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`, {
    headers: {
        'Authorization': `token ${GITHUB_TOKEN}`
    }
});
```

## 🐛 Troubleshooting

### "GitHub profile not found"
- Check that your username is spelled correctly
- Ensure your GitHub profile is public

### No repositories showing
- Make sure you have public repositories
- Check that repositories aren't all forks
- Verify your username in the script

### Styling issues
- Clear browser cache
- Check browser console for errors
- Ensure all CSS files are loaded

### Rate limit exceeded
- Wait an hour for limits to reset
- Consider adding a GitHub token
- Cache responses in localStorage (advanced)

## 📱 Mobile Optimization

The GitHub integration is fully responsive:
- Stats cards stack on mobile
- Repository cards adapt to screen size
- Language tags wrap appropriately
- Touch-friendly button sizes

## 🎯 Next Steps

1. ✅ Update your GitHub username in `script.js`
2. ✅ Deploy to GitHub Pages
3. ✅ Test that repositories load correctly
4. ✅ Customize the number of repos shown
5. ✅ Add more language colors if needed

Your portfolio will now automatically showcase your latest work and stay up-to-date without any manual effort! 🚀

## 💡 Pro Tips

- Pin your best repositories on GitHub - they'll show up first
- Write good repository descriptions - they become project descriptions
- Add homepage URLs to repositories for "Live Demo" links
- Use topics/tags on GitHub repositories for better categorization
- Keep your GitHub profile README updated - it might be used in the bio

---

**Result**: A dynamic, always-up-to-date portfolio that showcases your real work! 🎉
