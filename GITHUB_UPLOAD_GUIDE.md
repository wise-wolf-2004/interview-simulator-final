# GitHub Upload Guide

Follow these steps to upload your project to GitHub.

## Step 1: Initialize Git Repository (if not already done)

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
```

## Step 2: Create a GitHub Repository

1. Go to https://github.com
2. Click the "+" icon in the top right
3. Select "New repository"
4. Fill in:
   - **Repository name**: `ai-interview-platform` (or your preferred name)
   - **Description**: "AI-powered interview practice platform with real-time analysis"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README (we already have one)
5. Click "Create repository"

## Step 3: Prepare Your Local Repository

```bash
# Make sure you're in the project root directory
cd C:\Users\asus\Desktop\aa

# Add all files to git
git add .

# Create your first commit
git commit -m "Initial commit: AI Interview Platform with real-time analysis"
```

## Step 4: Connect to GitHub

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify the remote was added
git remote -v
```

## Step 5: Push to GitHub

```bash
# Push your code to GitHub
git push -u origin main

# If you get an error about 'master' vs 'main', try:
git branch -M main
git push -u origin main
```

## Step 6: Verify Upload

1. Go to your GitHub repository URL
2. Refresh the page
3. You should see all your files uploaded

## Important: Before Pushing

### ✅ Files that WILL be uploaded:
- All source code (frontend & backend)
- README.md
- package.json files
- Configuration files (.example files)
- Documentation files

### ❌ Files that WON'T be uploaded (protected by .gitignore):
- node_modules/
- .env files (your secrets are safe!)
- dist/ and build/ folders
- Log files
- IDE settings

## Quick Command Reference

```bash
# Check status of your files
git status

# See what changes were made
git diff

# Add specific files
git add <filename>

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log --oneline
```

## Common Issues and Solutions

### Issue: "fatal: not a git repository"
**Solution:**
```bash
git init
```

### Issue: "remote origin already exists"
**Solution:**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Issue: "failed to push some refs"
**Solution:**
```bash
git pull origin main --rebase
git push origin main
```

### Issue: Authentication failed
**Solution:**
- Use a Personal Access Token instead of password
- Go to GitHub Settings → Developer settings → Personal access tokens
- Generate new token with 'repo' scope
- Use token as password when pushing

## After Upload

### Update README with your repo URL
Edit README.md and replace `<your-repo-url>` with your actual GitHub URL:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Then commit and push:
```bash
git add README.md
git commit -m "Update README with repository URL"
git push
```

### Add Topics to Your Repository
On GitHub, click "Add topics" and add:
- `react`
- `typescript`
- `nodejs`
- `ai`
- `interview`
- `face-recognition`
- `mongodb`
- `express`

### Enable GitHub Pages (Optional)
If you want to host the frontend:
1. Go to Settings → Pages
2. Select source: GitHub Actions or main branch
3. Configure build settings

## Next Steps

1. ✅ Add a LICENSE file
2. ✅ Add screenshots to README
3. ✅ Create a CONTRIBUTING.md
4. ✅ Set up GitHub Actions for CI/CD
5. ✅ Add issue templates
6. ✅ Create a project board

## Keeping Your Repository Updated

```bash
# Make changes to your code
# ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add feature: user profile page"

# Push to GitHub
git push
```

## Git Best Practices

1. **Commit often** - Small, focused commits are better
2. **Write clear commit messages** - Describe what and why
3. **Never commit secrets** - Always use .env files
4. **Pull before push** - Avoid conflicts
5. **Use branches** - For new features or experiments

```bash
# Create a new branch
git checkout -b feature/new-feature

# Switch back to main
git checkout main

# Merge branch
git merge feature/new-feature
```

---

Need help? Check the [GitHub Docs](https://docs.github.com) or open an issue!
