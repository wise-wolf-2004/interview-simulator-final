# MongoDB Integration Guide

## ✅ What's Been Added

### 1. Navigation Menu
- **Sticky navbar** at top of all pages
- **Desktop menu** with links and user info
- **Mobile hamburger menu** with smooth animations
- **Active page highlighting**
- **Theme toggle** integrated in navbar
- **Logout button** in menu

### 2. MongoDB Models
- `User.model.ts` - User accounts
- `Session.model.ts` - Interview sessions
- `Report.model.ts` - Performance reports

### 3. Hybrid Storage System
- **Works without MongoDB** (in-memory fallback)
- **Automatically uses MongoDB** if configured
- **No code changes needed** to switch

## 🚀 Quick Start (No MongoDB)

The app works perfectly **without MongoDB**:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm run dev
```

✅ App runs with in-memory storage (data lost on restart)

## 📊 Add MongoDB (Optional)

### Option 1: MongoDB Atlas (Cloud - FREE)

**Best for production and testing**

1. **Create Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up (free, no credit card)

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select region closest to you
   - Click "Create"

3. **Setup Access:**
   - Create database user (username + password)
   - Add IP: Click "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)

4. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

5. **Add to `.env`:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interview-simulator
   ```

6. **Restart Backend:**
   ```bash
   npm run dev
   ```

You should see:
```
✅ MongoDB connected successfully
📊 Storage: MongoDB (Persistent)
```

### Option 2: Local MongoDB

**For development**

1. **Install MongoDB:**
   ```bash
   # Windows (with Chocolatey)
   choco install mongodb
   
   # Mac
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Linux
   sudo apt-get install mongodb
   ```

2. **Start MongoDB:**
   ```bash
   mongod
   ```

3. **Add to `.env`:**
   ```
   MONGODB_URI=mongodb://localhost:27017/interview-simulator
   ```

4. **Restart Backend**

## 📱 Navigation Menu Features

### Desktop View:
- Logo (clickable → home/dashboard)
- Dashboard link
- New Interview link
- User name display
- Theme toggle
- Logout button

### Mobile View:
- Hamburger menu icon
- Slide-down menu
- All navigation links
- Smooth animations
- Auto-close on navigation

### Active Page Highlighting:
- Current page shown in indigo
- Hover effects on all links
- Smooth transitions

## 🔄 How Hybrid Storage Works

```typescript
// Backend automatically checks for MongoDB
if (MongoDB connected) {
  // Save to MongoDB
  await User.create(userData);
} else {
  // Save to in-memory Map
  users.set(userId, userData);
}
```

**Benefits:**
- ✅ Works immediately (no setup)
- ✅ Easy to add MongoDB later
- ✅ No code changes needed
- ✅ Automatic fallback

## 📊 Data Stored in MongoDB

### Users Collection:
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password": "hashed_password",
  "name": "John Doe",
  "createdAt": "2025-01-11T..."
}
```

### Sessions Collection:
```json
{
  "_id": "ObjectId",
  "sessionId": "s_123...",
  "userId": "u_456...",
  "role": "Frontend Developer",
  "questions": [...],
  "responses": [...],
  "createdAt": "2025-01-11T..."
}
```

### Reports Collection:
```json
{
  "_id": "ObjectId",
  "reportId": "r_789...",
  "sessionId": "s_123...",
  "userId": "u_456...",
  "overallScore": 78,
  "categories": {...},
  "facial": {...},
  "voice": {...},
  "posture": {...},
  "questionFeedback": [...],
  "suggestions": [...]
}
```

## 🎯 Testing

### Without MongoDB:
1. Start app
2. Register user
3. Complete interview
4. View in dashboard
5. **Restart server** → Data lost ❌

### With MongoDB:
1. Start app
2. Register user
3. Complete interview
4. View in dashboard
5. **Restart server** → Data persists ✅

## 🔍 Check Connection Status

Visit: http://localhost:3001/health

```json
{
  "status": "ok",
  "timestamp": "2025-01-11T...",
  "database": "MongoDB" // or "In-Memory"
}
```

## 📦 Installation

```bash
# Backend
cd backend
npm install  # Installs mongoose
npm run dev

# Frontend (no changes needed)
cd frontend
npm run dev
```

## 🎨 Navigation Menu Styling

- **Sticky top navbar** - Always visible
- **Dark mode support** - Matches theme
- **Smooth animations** - Fade in/out
- **Responsive design** - Mobile & desktop
- **Active indicators** - Know where you are

## 🚨 Troubleshooting

**"MongoDB connection error":**
- Check connection string
- Verify username/password
- Check IP whitelist
- App still works (uses in-memory)

**"Navbar overlaps content":**
- Added `pt-16` or `pt-20` to pages
- Navbar is sticky at top

**"Menu doesn't close on mobile":**
- Click outside or navigate
- Auto-closes on link click

## ✨ What's Next

Your app now has:
- ✅ Beautiful navigation menu
- ✅ MongoDB integration (optional)
- ✅ Persistent data storage
- ✅ Hybrid fallback system
- ✅ Mobile-responsive design

**To use MongoDB:** Just add the connection string to `.env` and restart!

**To keep in-memory:** Leave `MONGODB_URI` empty - works perfectly!
