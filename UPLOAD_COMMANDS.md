# Upload to GitHub - Step by Step Commands

## Prerequisites
✅ You have a GitHub account
✅ Git is installed on your computer

---

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `ai-interview-platform` (or your choice)
3. Description: `AI-powered interview practice platform with real-time analysis`
4. Choose: **Public** or **Private**
5. **DO NOT** check "Add a README file"
6. Click **"Create repository"**
7. **Keep the page open** - you'll need the URL

---

## Step 2: Run These Commands

Open your terminal in the project folder and run these commands **one by one**:

### Initialize Git
```bash
git init
```

### Add all files
```bash
git add .
```

### Create first commit
```bash
git commit -m "Initial commit: AI Interview Platform with real-time analysis"
```

### Connect to GitHub
**Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Example:
```bash
git remote add origin https://github.com/johnsmith/ai-interview-platform.git
```

### Set main branch
```bash
git branch -M main
```

### Push to GitHub
```bash
git push -u origin main
```

---

## Step 3: Verify Upload

1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your files!

---

## ⚠️ If You Get Authentication Error

GitHub no longer accepts passwords. You need a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "AI Interview Platform"
4. Select scope: **repo** (check the box)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. When pushing, use the token as your password

---

## Quick Copy-Paste (After Creating GitHub Repo)

Replace the URL with yours and run all at once:

```bash
git init && git add . && git commit -m "Initial commit: AI Interview Platform" && git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git && git branch -M main && git push -u origin main
```

---

## What Gets Uploaded? ✅

- ✅ All source code (frontend & backend)
- ✅ README.md and documentation
- ✅ package.json files
- ✅ .env.example files (safe templates)
- ✅ Configuration files

## What Stays Private? 🔒

- 🔒 node_modules/ folders
- 🔒 .env files (your API keys are safe!)
- 🔒 dist/ and build/ folders
- 🔒 Log files
- 🔒 IDE settings

---

## After Upload - Make It Look Professional

### Add Topics
On your GitHub repo page, click "Add topics" and add:
- `react`
- `typescript`
- `nodejs`
- `ai`
- `interview-practice`
- `face-recognition`
- `mongodb`
- `express`
- `groq`

### Update Repository Description
Click the ⚙️ icon next to "About" and add:
```
AI-powered interview practice platform with real-time facial, voice, and posture analysis. Built with React, Node.js, and Groq AI.
```

### Add Website URL (Optional)
If you deploy it, add the URL in the "Website" field.

---

## Future Updates

When you make changes to your code:

```bash
# Stage changes
git add .

# Commit with message
git commit -m "Add new feature: user profile page"

# Push to GitHub
git push
```

---

## Need Help?

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com
- Can't push? Check: https://docs.github.com/en/authentication

---

**You're all set! 🚀**
