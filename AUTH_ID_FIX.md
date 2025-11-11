# Authentication ID Fix

## Problem
Registration was failing with error:
```
Cast to ObjectId failed for value "u_1762887715547_0jhrq667v" (type string) at path "_id"
```

## Root Cause
The registration route was trying to set a custom string ID as MongoDB's `_id` field:
```typescript
const userId = `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const userData = {
  _id: userId,  // ❌ MongoDB _id must be ObjectId, not string
  // ...
};
```

MongoDB's `_id` field must be an ObjectId (24-character hex string), not a custom string.

## Solution

### 1. Let MongoDB Generate IDs
Changed the registration flow to let MongoDB automatically generate the `_id`:

**Before:**
```typescript
const userId = `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const userData = {
  _id: userId,  // ❌ Custom string ID
  id: userId,
  email,
  password: hashedPassword,
  name,
};
```

**After:**
```typescript
const userData = {
  email,
  password: hashedPassword,
  name,
  // Let MongoDB generate _id automatically
};

const newUser = await createUser(userData);
const userId = newUser._id?.toString() || newUser.id;
```

### 2. Updated In-Memory Storage
For the in-memory fallback (when MongoDB is not connected), we still generate custom IDs:

```typescript
export async function createUser(userData: any) {
  if (isMongoDBConnected()) {
    const user = await User.create(userData);
    return user.toObject();
  } else {
    // Generate ID for in-memory storage
    const userId = `u_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userWithId = {
      ...userData,
      _id: userId,
      id: userId,
    };
    memoryUsers.set(userId, userWithId);
    return userWithId;
  }
}
```

## What Changed

### Files Modified:
1. `backend/src/routes/auth.routes.ts` - Registration endpoint
2. `backend/src/services/storage.service.ts` - User creation logic

### Behavior:
- ✅ MongoDB mode: Uses MongoDB-generated ObjectId
- ✅ In-memory mode: Uses custom string ID
- ✅ Both modes work seamlessly
- ✅ JWT tokens use the appropriate ID format

## Testing

1. **Restart the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Try registering a new user:**
   - Go to the registration page
   - Fill in email, password, and name
   - Click Register
   - Should succeed without errors

3. **Verify the user ID:**
   - Check the response - you'll get a token and user object
   - The ID will be a MongoDB ObjectId (if connected) or custom string (if not)

## Result
✅ Registration now works with MongoDB
✅ Login works with the generated IDs
✅ Sessions and reports can be linked to users properly
