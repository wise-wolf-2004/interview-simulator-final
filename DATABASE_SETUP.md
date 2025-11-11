# Database Setup Guide

## Current State: In-Memory Storage

The app currently uses **in-memory storage** (JavaScript Map objects):
- ✅ **Pros:** Simple, no setup needed, works immediately
- ❌ **Cons:** Data lost on server restart, not scalable

**Data stored in memory:**
- Users (email, password, name)
- Interview sessions
- Interview reports

## Option 1: Keep In-Memory (Development/Demo)

**Good for:**
- Quick testing
- Demo purposes
- Development

**No setup needed** - just run the app!

## Option 2: Add MongoDB (Production)

**Good for:**
- Production deployment
- Persistent data storage
- Multiple users
- Scalability

### MongoDB Setup Steps:

#### 1. Install MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster (M0)
4. Get connection string

**Option B: Local MongoDB**
```bash
# Windows (with Chocolatey)
choco install mongodb

# Mac
brew tap mongodb/brew
brew install mongodb-community

# Linux
sudo apt-get install mongodb
```

#### 2. Install Mongoose

```bash
cd backend
npm install mongoose
```

#### 3. Add MongoDB Connection String

Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interview-simulator
# OR for local:
MONGODB_URI=mongodb://localhost:27017/interview-simulator
```

#### 4. Create Database Models

I can create these files for you:
- `backend/src/models/User.model.ts`
- `backend/src/models/Session.model.ts`
- `backend/src/models/Report.model.ts`

#### 5. Update Routes to Use MongoDB

Replace Map storage with Mongoose queries.

## Option 3: Use DynamoDB (AWS)

**Good for:**
- AWS deployment
- Serverless architecture
- High scalability

### DynamoDB Setup:

1. Create AWS account
2. Create DynamoDB tables
3. Install AWS SDK
4. Configure credentials

## Recommendation

### For Development/Testing:
✅ **Keep in-memory storage** - It's working fine!

### For Production:
✅ **Use MongoDB Atlas** (free tier available)
- Easy setup
- No server management
- Automatic backups
- Free tier: 512MB storage

## Quick MongoDB Integration

Would you like me to:
1. ✅ Add MongoDB models and connection
2. ✅ Update all routes to use MongoDB
3. ✅ Keep in-memory as fallback

This way you can:
- Test with in-memory (no MongoDB needed)
- Switch to MongoDB when ready (just add connection string)

## Current Data Flow

```
User registers → Stored in Map → Lost on restart
Interview completed → Stored in Map → Lost on restart
Report generated → Stored in Map → Lost on restart
```

## With MongoDB

```
User registers → Saved to MongoDB → Persists forever
Interview completed → Saved to MongoDB → Persists forever
Report generated → Saved to MongoDB → Persists forever
```

## Decision Time

**Choose one:**

1. **Keep as-is** (in-memory)
   - No setup needed
   - Works for demo/testing
   - Data lost on restart

2. **Add MongoDB** (persistent)
   - Requires MongoDB setup
   - Data persists forever
   - Production-ready

3. **Hybrid approach** (best of both)
   - Works without MongoDB
   - Automatically uses MongoDB if configured
   - Flexible for dev and production

Let me know which option you prefer, and I can implement it! 🚀
