# 🎯 Repository Filtering Guide

Your portfolio now has **smart repository filtering** so you can control exactly which repositories appear on your portfolio!

## 🚀 Quick Configuration

Open `script.js` and find the `REPO_CONFIG` section to customize:

### ❌ **Exclude Specific Repositories**
```javascript
excludeRepos: [
    'fahmidhasann.github.io',  // Already excluded (your portfolio repo)
    'test-repo',               // Add any repo name you want to hide
    'private-project',         // Another example
    // Add more repo names here
],
```

### ✅ **Show Only Specific Repositories** (Optional)
```javascript
includeOnlyRepos: [
    'my-awesome-project',      // Only show this repo
    'cool-web-app',           // And this one
    'machine-learning-tool',   // And this one
    // Uncomment and add only the repos you want to showcase
],
```

### ⚙️ **Other Settings**
```javascript
maxRepos: 6,              // Maximum number of repos to display
sortBy: 'updated'         // Sort order: 'updated', 'created', 'pushed', 'full_name'
```

## 📋 **Configuration Options**

### **Method 1: Exclude Mode (Recommended)**
- Shows all your repos EXCEPT the ones you exclude
- Good for hiding specific repos you don't want to showcase
- Currently excludes: `fahmidhasann.github.io`

```javascript
excludeRepos: [
    'fahmidhasann.github.io',  // Portfolio repo (hidden)
    'test-repository',         // Hide test repos
    'old-project',            // Hide outdated projects
],
includeOnlyRepos: []  // Leave empty for exclude mode
```

### **Method 2: Include Mode**
- Shows ONLY the repositories you specify
- Good when you have many repos but want to showcase just a few
- Overrides exclude settings when used

```javascript
excludeRepos: [],  // Ignored when includeOnlyRepos is used
includeOnlyRepos: [
    'best-project',
    'awesome-tool',
    'portfolio-worthy-app'
]
```

## 🎨 **Sorting Options**

Change the `sortBy` setting:
- **`'updated'`** - Most recently updated (default, shows active projects)
- **`'created'`** - Most recently created (shows newest projects)
- **`'pushed'`** - Most recently pushed (shows recent activity)
- **`'full_name'`** - Alphabetical order

## 🔄 **How It Works**

1. **Fetches all your public repos** from GitHub API
2. **Filters out forked repos** automatically
3. **Applies your exclude/include rules**
4. **Sorts by your preferred method**
5. **Limits to max number** you want to display
6. **Updates automatically** when you add new repos

## 💡 **Pro Tips**

### **For Students/Beginners:**
```javascript
excludeRepos: [
    'fahmidhasann.github.io',
    'practice-repo',
    'tutorial-following',
    'test-project'
],
maxRepos: 4  // Show fewer, better projects
```

### **For Experienced Developers:**
```javascript
includeOnlyRepos: [
    'production-app',
    'open-source-tool',
    'technical-demo',
    'portfolio-piece'
],
maxRepos: 6
```

### **For Open Source Contributors:**
```javascript
// Show all except personal/test repos
excludeRepos: [
    'fahmidhasann.github.io',
    'personal-notes',
    'config-files'
],
sortBy: 'updated',  // Show most active projects
maxRepos: 8
```

## 🚀 **Example Configurations**

### **Showcase Best Work Only:**
```javascript
const REPO_CONFIG = {
    excludeRepos: ['fahmidhasann.github.io'],
    includeOnlyRepos: [
        'amazing-web-app',
        'useful-python-tool',
        'react-component-library'
    ],
    maxRepos: 3,
    sortBy: 'updated'
};
```

### **Hide Learning/Test Projects:**
```javascript
const REPO_CONFIG = {
    excludeRepos: [
        'fahmidhasann.github.io',
        'learning-javascript',
        'css-practice',
        'test-repo',
        'tutorial-code'
    ],
    includeOnlyRepos: [],
    maxRepos: 5,
    sortBy: 'created'
};
```

### **Show Everything Except Portfolio:**
```javascript
const REPO_CONFIG = {
    excludeRepos: ['fahmidhasann.github.io'],
    includeOnlyRepos: [],
    maxRepos: 8,
    sortBy: 'updated'
};
```

## 🔄 **Making Changes**

1. **Edit** `script.js` with your preferred configuration
2. **Commit** the changes: `git add script.js && git commit -m "Update repo filtering"`
3. **Push** to GitHub: `git push`
4. **Wait 2-3 minutes** for GitHub Pages to update
5. **Refresh** your portfolio to see changes

## 🎯 **Current Setup**

Your portfolio is currently configured to:
- ✅ **Hide** the `fahmidhasann.github.io` repository
- ✅ **Show** your other 4 repositories  
- ✅ **Sort** by most recently updated
- ✅ **Limit** to 6 repositories max

Perfect for showcasing your real development work without the portfolio repo cluttering the list! 🎉
