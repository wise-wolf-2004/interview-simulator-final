# Analysis Architecture

## Overview

The interview analysis system is now modular with separate analyzers for each feature, providing real-time analysis instead of hardcoded values.

## Architecture

```
frontend/src/services/
├── facial-analysis.service.ts    # Face detection & expression analysis
├── voice-analysis.service.ts     # Voice tone, pitch, pace analysis
├── posture-analysis.service.ts   # Body language & movement tracking
└── analysis.service.ts           # Core utilities (existing)
```

## Analysis Modules

### 1. Facial Analysis (`FacialAnalyzer`)

**Tracks:**
- Eye contact percentage
- Facial expressions (happy, neutral, sad, angry, surprised, fearful)
- Blink rate (blinks per minute)
- Head pose stability
- Overall engagement score

**Methods:**
- `addDetection(detection)` - Add face-api.js detection result
- `generateReport(durationSeconds)` - Generate comprehensive facial analysis
- `reset()` - Clear all data

**Output:**
```typescript
{
  eyeContactScore: 75,        // 0-100
  expressionBreakdown: {
    happy: 30,
    neutral: 50,
    sad: 5,
    // ...
  },
  dominantExpression: 'neutral',
  blinkRate: 15,              // blinks/min
  headPoseStability: 75,      // 0-100
  overallEngagement: 70       // 0-100
}
```

### 2. Voice Analysis (`VoiceAnalyzer`)

**Tracks:**
- Pitch (Hz) and variation
- Loudness and variation
- Speaking pace (words/min)
- Pause count and duration
- Filler words (um, uh, like, etc.)
- Tone quality (monotone/moderate/dynamic)

**Methods:**
- `addSample(pitch, loudness)` - Add audio metrics
- `addTranscript(text, timestamp)` - Add transcribed text
- `generateReport(durationSeconds)` - Generate voice analysis
- `reset()` - Clear all data

**Output:**
```typescript
{
  averagePitch: 150,          // Hz
  pitchVariation: 30,         // 0-100
  averageLoudness: 50,        // 0-100
  speakingPace: 120,          // words/min
  fillerWordCount: 8,
  fillerWordRate: 2.5,        // per minute
  toneQuality: 'moderate',
  confidenceScore: 70,        // 0-100
  clarityScore: 75            // 0-100
}
```

### 3. Posture Analysis (`PostureAnalyzer`)

**Tracks:**
- Face position movement
- Posture stability
- Movement level (minimal/moderate/excessive)
- Fidgeting detection
- Overall body language score

**Methods:**
- `addFacePosition(x, y)` - Track face position
- `generateReport()` - Generate posture analysis
- `reset()` - Clear all data

**Output:**
```typescript
{
  stabilityScore: 85,         // 0-100
  movementLevel: 'minimal',
  postureQuality: 'excellent',
  fidgetingDetected: false,
  averageMovement: 5.2,       // pixels
  overallBodyLanguageScore: 85 // 0-100
}
```

## Integration Flow

### During Interview (InterviewChat.tsx)

1. **Initialization:**
   ```typescript
   const facialAnalyzerRef = useRef(new FacialAnalyzer());
   const voiceAnalyzerRef = useRef(new VoiceAnalyzer());
   const postureAnalyzerRef = useRef(new PostureAnalyzer());
   ```

2. **Real-time Tracking (every 2 seconds):**
   ```typescript
   // Facial analysis
   const detection = await analyzeFace(videoElement);
   facialAnalyzerRef.current.addDetection(detection);
   
   // Voice analysis
   const audioMetrics = audioAnalyzer.getMetrics();
   voiceAnalyzerRef.current.addSample(pitch, loudness);
   
   // Posture analysis
   postureAnalyzerRef.current.addFacePosition(x, y);
   ```

3. **After Each Response:**
   ```typescript
   voiceAnalyzerRef.current.addTranscript(text, timestamp);
   ```

4. **Generate Final Report:**
   ```typescript
   const facialReport = facialAnalyzerRef.current.generateReport(duration);
   const voiceReport = voiceAnalyzerRef.current.generateReport(duration);
   const postureReport = postureAnalyzerRef.current.generateReport();
   
   const enhancedReport = {
     ...aiReport,
     facial: facialReport,
     voice: voiceReport,
     posture: postureReport,
   };
   ```

### Report Display (Report.tsx)

The report page now displays real analysis data:

```typescript
const facial = report.facial;
const voice = report.voice;
const posture = report.posture;

// Use real data
const eyeContactScore = facial?.eyeContactScore || 75;
const blinkRate = facial?.blinkRate || 15;
const speakingPace = voice?.speakingPace || 120;
const stabilityScore = posture?.stabilityScore || 85;
```

## Key Features

### ✅ Real-Time Analysis
- Continuous tracking during interview
- Live metrics updates every 2 seconds
- No hardcoded values

### ✅ Comprehensive Metrics
- **Facial:** 6 expressions, eye contact, blinks, engagement
- **Voice:** Pitch, loudness, pace, fillers, confidence
- **Posture:** Stability, movement, fidgeting, quality

### ✅ Modular Design
- Each analyzer is independent
- Easy to test and maintain
- Can be enhanced individually

### ✅ Fallback Support
- Default values if no data collected
- Graceful degradation
- Always generates a report

## Future Enhancements

1. **Advanced Posture Tracking:**
   - Use MediaPipe Pose for full body tracking
   - Detect slouching, leaning, hand gestures

2. **Emotion Timeline:**
   - Track expression changes over time
   - Identify stress points in interview

3. **Voice Stress Analysis:**
   - Detect voice tremors
   - Analyze speech patterns for nervousness

4. **Comparative Analytics:**
   - Compare with successful interviews
   - Benchmark against role averages

5. **Real-time Coaching:**
   - Live feedback during practice mode
   - Suggestions to improve immediately

## Testing

Each analyzer can be tested independently:

```typescript
// Test Facial Analyzer
const analyzer = new FacialAnalyzer();
analyzer.addDetection(mockDetection);
const report = analyzer.generateReport(300);
console.log(report);
```

## Performance

- Lightweight analyzers (~1KB each)
- Minimal memory footprint
- Efficient data structures
- No external API calls during analysis
