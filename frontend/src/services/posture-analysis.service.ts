export interface PostureAnalysisResult {
  stabilityScore: number; // 0-100
  movementLevel: 'minimal' | 'moderate' | 'excessive';
  postureQuality: 'poor' | 'fair' | 'good' | 'excellent';
  fidgetingDetected: boolean;
  averageMovement: number; // pixels per frame
  overallBodyLanguageScore: number; // 0-100
}

export class PostureAnalyzer {
  private facePositions: Array<{ x: number; y: number; timestamp: number }> = [];
  private movements: number[] = [];

  addFacePosition(x: number, y: number) {
    const timestamp = Date.now();
    
    if (this.facePositions.length > 0) {
      const lastPos = this.facePositions[this.facePositions.length - 1];
      const movement = Math.sqrt(
        Math.pow(x - lastPos.x, 2) + Math.pow(y - lastPos.y, 2)
      );
      this.movements.push(movement);
    }

    this.facePositions.push({ x, y, timestamp });

    // Keep only last 100 positions to avoid memory issues
    if (this.facePositions.length > 100) {
      this.facePositions.shift();
      this.movements.shift();
    }
  }

  generateReport(): PostureAnalysisResult {
    if (this.movements.length === 0) {
      return this.getDefaultReport();
    }

    // Calculate average movement
    const averageMovement = this.movements.reduce((a, b) => a + b, 0) / this.movements.length;

    // Calculate movement variance (stability)
    const mean = averageMovement;
    const variance = this.movements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.movements.length;
    const stdDev = Math.sqrt(variance);

    // Stability score (lower movement = higher stability)
    const stabilityScore = Math.round(Math.max(0, Math.min(100, 100 - (averageMovement * 2))));

    // Determine movement level
    let movementLevel: 'minimal' | 'moderate' | 'excessive';
    if (averageMovement < 5) {
      movementLevel = 'minimal';
    } else if (averageMovement < 15) {
      movementLevel = 'moderate';
    } else {
      movementLevel = 'excessive';
    }

    // Detect fidgeting (high variance in movement)
    const fidgetingDetected = stdDev > 10;

    // Determine posture quality
    let postureQuality: 'poor' | 'fair' | 'good' | 'excellent';
    if (stabilityScore >= 85) {
      postureQuality = 'excellent';
    } else if (stabilityScore >= 70) {
      postureQuality = 'good';
    } else if (stabilityScore >= 50) {
      postureQuality = 'fair';
    } else {
      postureQuality = 'poor';
    }

    // Overall body language score
    const overallBodyLanguageScore = Math.round(
      (stabilityScore * 0.6) +
      (fidgetingDetected ? 0 : 20) +
      (movementLevel === 'minimal' ? 20 : movementLevel === 'moderate' ? 10 : 0)
    );

    return {
      stabilityScore,
      movementLevel,
      postureQuality,
      fidgetingDetected,
      averageMovement: Math.round(averageMovement * 10) / 10,
      overallBodyLanguageScore: Math.min(100, Math.max(0, overallBodyLanguageScore)),
    };
  }

  private getDefaultReport(): PostureAnalysisResult {
    return {
      stabilityScore: 75,
      movementLevel: 'moderate',
      postureQuality: 'good',
      fidgetingDetected: false,
      averageMovement: 8.5,
      overallBodyLanguageScore: 75,
    };
  }

  reset() {
    this.facePositions = [];
    this.movements = [];
  }
}
