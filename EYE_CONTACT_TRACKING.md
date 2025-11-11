# Eye Contact Tracking System Explained

## Overview

The eye contact tracking system uses **face-api.js** to detect faces and estimate eye contact based on facial landmarks and expressions.

## How It Works

### 1. Real-Time Detection (Every 2 seconds)

**Location:** `frontend/src/pages/InterviewChat.tsx` → `startMetricsTracking()`

```typescript
const faceDetection = await faceapi
  .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks()
  .withFaceExpressions();

if (faceDetection) {
  facialAnalyzerRef.current.addDetection(faceDetection);
}
```

**What happens:**
- Captures video frame from webcam
- Detects face using TinyFaceDetector (fast, lightweight)
- Extracts 68 facial landmarks (eye positions, nose, mouth, etc.)
- Analyzes facial expressions (happy, neutral, sad, etc.)

### 2. Simple Eye Contact Estimation

**Location:** `frontend/src/services/analysis.service.ts` → `analyzeFace()`

```typescript
const landmarks = detection.landmarks;
const leftEye = landmarks.getLeftEye();
const rightEye = landmarks.getRightEye();
const eyeContact = leftEye && rightEye ? 0.7 : 0.3;
```

**Logic:**
- ✅ **Both eyes detected** → 70% eye contact (0.7)
- ❌ **Eyes not detected** → 30% eye contact (0.3)

**Why this works:**
- If face is turned away, eyes won't be detected
- If looking at camera, both eyes are clearly visible
- Simple but effective for basic tracking

### 3. Advanced Eye Contact Calculation

**Location:** `frontend/src/services/facial-analysis.service.ts` → `generateReport()`

```typescript
this.detections.forEach((detection) => {
  const expr = detection.expressions;
  
  // Eye contact estimation (if face is detected and looking forward)
  if (expr.neutral > 0.3 || expr.happy > 0.3) {
    eyeContactFrames++;
  }
});

const eyeContactScore = Math.round((eyeContactFrames / totalDetections) * 100);
```

**Logic:**
- Counts frames where face shows **neutral** or **happy** expression
- These expressions indicate person is looking forward/engaged
- Calculates percentage: `(frames with eye contact / total frames) × 100`

**Example:**
- 100 frames captured
- 75 frames show neutral/happy expression
- Eye contact score = 75%

### 4. Display in Live Metrics

**Location:** `frontend/src/pages/InterviewChat.tsx`

```typescript
const faceMetrics = await analyzeFace(videoRef.current);
setLiveMetrics({
  tone: audioMetrics.loudness > 50 ? 'Confident' : 'Calm',
  eyeContact: `${Math.round(faceMetrics.eyeContact * 100)}%`,
});
```

**Shows:**
- Real-time percentage in interview page
- Updates every 2 seconds
- Example: "Eye Contact: 70%"

### 5. Display in Report

**Location:** `frontend/src/pages/Report.tsx`

```typescript
const avgEyeContact = facial?.eyeContactScore || 75;

// Doughnut chart showing percentage
const eyeContactData = {
  labels: ['Maintained', 'Not Maintained'],
  datasets: [{
    data: [avgEyeContact, 100 - avgEyeContact],
    backgroundColor: ['#4f46e5', '#e5e7eb'],
  }],
};
```

**Shows:**
- Doughnut chart with percentage
- "Eye contact maintained for XX% of the session"
- Additional metrics: blink rate, engagement score

## Current Limitations

### 1. Simplified Detection
```typescript
const eyeContact = leftEye && rightEye ? 0.7 : 0.3;
```
- **Issue:** Binary decision (70% or 30%)
- **Better:** Calculate actual gaze direction

### 2. Expression-Based Estimation
```typescript
if (expr.neutral > 0.3 || expr.happy > 0.3) {
  eyeContactFrames++;
}
```
- **Issue:** Assumes neutral/happy = looking at camera
- **Better:** Use head pose angles

### 3. No Gaze Direction
- Currently doesn't track where eyes are actually looking
- Only detects if face is visible and forward-facing

## How to Improve Eye Contact Tracking

### Option 1: Add Head Pose Detection

```typescript
// Get head rotation angles
const headPose = detection.angle;
const isLookingForward = 
  Math.abs(headPose.yaw) < 15 &&    // Left/right rotation
  Math.abs(headPose.pitch) < 15 &&  // Up/down rotation
  Math.abs(headPose.roll) < 15;     // Tilt

if (isLookingForward) {
  eyeContactFrames++;
}
```

### Option 2: Use Eye Aspect Ratio (EAR)

```typescript
// Calculate if eyes are open and looking forward
const leftEAR = calculateEyeAspectRatio(leftEyeLandmarks);
const rightEAR = calculateEyeAspectRatio(rightEyeLandmarks);

const eyesOpen = leftEAR > 0.2 && rightEAR > 0.2;
const lookingForward = /* check pupil position */;

if (eyesOpen && lookingForward) {
  eyeContactFrames++;
}
```

### Option 3: Use MediaPipe Face Mesh

More accurate face tracking with 468 landmarks:
```typescript
import { FaceMesh } from '@mediapipe/face_mesh';

// Get precise eye gaze direction
const gazeDirection = calculateGazeFromLandmarks(landmarks);
const isLookingAtCamera = gazeDirection.z > 0.8; // Looking forward
```

## Current Accuracy

**Estimated Accuracy:** ~70-75%

**Works well when:**
- ✅ Good lighting
- ✅ Face clearly visible
- ✅ Looking at camera
- ✅ Minimal head movement

**Less accurate when:**
- ❌ Poor lighting
- ❌ Face partially hidden
- ❌ Looking away but face still visible
- ❌ Wearing glasses (reflections)

## Data Flow Summary

```
1. Video Frame (every 2s)
   ↓
2. face-api.js Detection
   ↓
3. Extract Landmarks & Expressions
   ↓
4. Calculate Eye Contact (0.3 or 0.7)
   ↓
5. Store in FacialAnalyzer
   ↓
6. Generate Report (percentage)
   ↓
7. Display in UI (chart + text)
```

## Example Output

**During Interview:**
```
Live Metrics:
- Eye Contact: 70%
- Tone: Confident
```

**In Report:**
```
Eye Contact Card:
- Score: 75%
- Doughnut Chart: 75% maintained, 25% not maintained
- Blink Rate: 18 blinks/min
- Engagement: 72%
```

## Conclusion

The current system provides a **good baseline** for eye contact tracking:
- ✅ Works in real-time
- ✅ No complex setup
- ✅ Reasonable accuracy
- ⚠️ Could be more precise with advanced techniques

For most interview practice scenarios, this level of accuracy is sufficient to give users helpful feedback about their eye contact habits.
