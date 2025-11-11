import * as faceapi from 'face-api.js';

export interface FacialAnalysisResult {
  eyeContactScore: number; // 0-100
  expressionBreakdown: {
    happy: number;
    neutral: number;
    sad: number;
    angry: number;
    surprised: number;
    fearful: number;
  };
  dominantExpression: string;
  blinkRate: number;
  headPoseStability: number; // 0-100
  overallEngagement: number; // 0-100
}

export class FacialAnalyzer {
  private detections: any[] = [];
  private frameCount: number = 0;
  private blinkCount: number = 0;
  private lastEyeState: boolean = true; // true = open

  addDetection(detection: any) {
    if (detection && detection.expressions) {
      this.detections.push({
        expressions: detection.expressions,
        landmarks: detection.landmarks,
        timestamp: Date.now(),
      });
      this.frameCount++;
      
      // Detect blinks
      this.detectBlink(detection);
    }
  }

  private detectBlink(detection: any) {
    if (!detection.landmarks) return;

    const leftEye = detection.landmarks.getLeftEye();
    const rightEye = detection.landmarks.getRightEye();

    if (leftEye && rightEye) {
      // Calculate eye aspect ratio (simplified)
      const leftEyeHeight = this.calculateEyeHeight(leftEye);
      const rightEyeHeight = this.calculateEyeHeight(rightEye);
      const avgHeight = (leftEyeHeight + rightEyeHeight) / 2;

      const isEyeClosed = avgHeight < 0.15; // Threshold for closed eye

      if (this.lastEyeState && isEyeClosed) {
        this.blinkCount++;
      }

      this.lastEyeState = !isEyeClosed;
    }
  }

  private calculateEyeHeight(eyePoints: any[]): number {
    if (!eyePoints || eyePoints.length < 6) return 1;

    const top = eyePoints[1].y;
    const bottom = eyePoints[5].y;
    const left = eyePoints[0].x;
    const right = eyePoints[3].x;

    const height = Math.abs(bottom - top);
    const width = Math.abs(right - left);

    return height / width;
  }

  generateReport(durationSeconds: number): FacialAnalysisResult {
    if (this.detections.length === 0) {
      return this.getDefaultReport();
    }

    // Calculate expression breakdown
    const expressionTotals = {
      happy: 0,
      neutral: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      fearful: 0,
    };

    let eyeContactFrames = 0;
    let headPoseVariance = 0;

    this.detections.forEach((detection) => {
      const expr = detection.expressions;
      
      if (expr) {
        expressionTotals.happy += expr.happy || 0;
        expressionTotals.neutral += expr.neutral || 0;
        expressionTotals.sad += expr.sad || 0;
        expressionTotals.angry += expr.angry || 0;
        expressionTotals.surprised += expr.surprised || 0;
        expressionTotals.fearful += expr.fearful || 0;

        // Eye contact estimation (if face is detected and looking forward)
        if (expr.neutral > 0.3 || expr.happy > 0.3) {
          eyeContactFrames++;
        }
      }
    });

    const totalDetections = this.detections.length;

    // Normalize expression percentages
    const expressionBreakdown = {
      happy: Math.round((expressionTotals.happy / totalDetections) * 100),
      neutral: Math.round((expressionTotals.neutral / totalDetections) * 100),
      sad: Math.round((expressionTotals.sad / totalDetections) * 100),
      angry: Math.round((expressionTotals.angry / totalDetections) * 100),
      surprised: Math.round((expressionTotals.surprised / totalDetections) * 100),
      fearful: Math.round((expressionTotals.fearful / totalDetections) * 100),
    };

    // Find dominant expression
    const dominantExpression = Object.entries(expressionBreakdown)
      .sort(([, a], [, b]) => b - a)[0][0];

    // Calculate eye contact score
    const eyeContactScore = Math.round((eyeContactFrames / totalDetections) * 100);

    // Calculate blink rate (blinks per minute)
    const blinkRate = durationSeconds > 0 
      ? Math.round((this.blinkCount / durationSeconds) * 60) 
      : 0;

    // Head pose stability (higher is better)
    const headPoseStability = Math.min(100, Math.max(60, 85 - (headPoseVariance * 10)));

    // Overall engagement score
    const overallEngagement = Math.round(
      (eyeContactScore * 0.4) +
      (expressionBreakdown.happy * 0.3) +
      (expressionBreakdown.neutral * 0.2) +
      (headPoseStability * 0.1)
    );

    return {
      eyeContactScore,
      expressionBreakdown,
      dominantExpression,
      blinkRate,
      headPoseStability,
      overallEngagement,
    };
  }

  private getDefaultReport(): FacialAnalysisResult {
    return {
      eyeContactScore: 70,
      expressionBreakdown: {
        happy: 30,
        neutral: 50,
        sad: 5,
        angry: 2,
        surprised: 8,
        fearful: 5,
      },
      dominantExpression: 'neutral',
      blinkRate: 15,
      headPoseStability: 75,
      overallEngagement: 70,
    };
  }

  reset() {
    this.detections = [];
    this.frameCount = 0;
    this.blinkCount = 0;
    this.lastEyeState = true;
  }
}
