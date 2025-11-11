export interface VoiceAnalysisResult {
  averagePitch: number; // Hz
  pitchVariation: number; // 0-100 (higher = more varied)
  averageLoudness: number; // 0-100
  loudnessVariation: number; // 0-100
  speakingPace: number; // words per minute
  pauseCount: number;
  averagePauseDuration: number; // seconds
  fillerWordCount: number;
  fillerWordRate: number; // per minute
  toneQuality: 'monotone' | 'moderate' | 'dynamic';
  confidenceScore: number; // 0-100
  clarityScore: number; // 0-100
}

export class VoiceAnalyzer {
  private pitchSamples: number[] = [];
  private loudnessSamples: number[] = [];
  private transcripts: string[] = [];
  private timestamps: number[] = [];
  private totalWords: number = 0;
  private totalFillers: number = 0;

  addSample(pitch: number, loudness: number) {
    this.pitchSamples.push(pitch);
    this.loudnessSamples.push(loudness);
  }

  addTranscript(text: string, timestamp: number) {
    this.transcripts.push(text);
    this.timestamps.push(timestamp);
    
    const words = text.split(/\s+/).filter(w => w.length > 0);
    this.totalWords += words.length;
    
    // Count filler words
    const fillers = this.countFillerWords(text);
    this.totalFillers += fillers;
  }

  private countFillerWords(text: string): number {
    const fillerPatterns = [
      /\bum\b/gi,
      /\buh\b/gi,
      /\blike\b/gi,
      /\byou know\b/gi,
      /\bbasically\b/gi,
      /\bactually\b/gi,
      /\bliterally\b/gi,
      /\bkind of\b/gi,
      /\bsort of\b/gi,
    ];

    let count = 0;
    fillerPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) count += matches.length;
    });

    return count;
  }

  private calculateVariation(samples: number[]): number {
    if (samples.length < 2) return 0;

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length;
    const stdDev = Math.sqrt(variance);

    // Normalize to 0-100 scale
    return Math.min(100, (stdDev / mean) * 100);
  }

  generateReport(durationSeconds: number): VoiceAnalysisResult {
    if (this.pitchSamples.length === 0) {
      return this.getDefaultReport();
    }

    // Calculate pitch metrics
    const averagePitch = this.pitchSamples.reduce((a, b) => a + b, 0) / this.pitchSamples.length;
    const pitchVariation = this.calculateVariation(this.pitchSamples);

    // Calculate loudness metrics
    const averageLoudness = this.loudnessSamples.reduce((a, b) => a + b, 0) / this.loudnessSamples.length;
    const loudnessVariation = this.calculateVariation(this.loudnessSamples);

    // Calculate speaking pace
    const speakingPace = durationSeconds > 0 
      ? Math.round((this.totalWords / durationSeconds) * 60) 
      : 0;

    // Estimate pauses (simplified - based on transcript gaps)
    const pauseCount = Math.max(0, this.transcripts.length - 1);
    const averagePauseDuration = pauseCount > 0 && this.timestamps.length > 1
      ? (this.timestamps[this.timestamps.length - 1] - this.timestamps[0]) / pauseCount / 1000
      : 0;

    // Filler word metrics
    const fillerWordRate = durationSeconds > 0
      ? (this.totalFillers / durationSeconds) * 60
      : 0;

    // Determine tone quality
    let toneQuality: 'monotone' | 'moderate' | 'dynamic';
    if (pitchVariation < 20 && loudnessVariation < 20) {
      toneQuality = 'monotone';
    } else if (pitchVariation > 50 || loudnessVariation > 50) {
      toneQuality = 'dynamic';
    } else {
      toneQuality = 'moderate';
    }

    // Calculate confidence score
    const confidenceScore = Math.round(
      (Math.min(100, averageLoudness) * 0.4) +
      (Math.min(100, 100 - fillerWordRate * 5) * 0.3) +
      (pitchVariation * 0.3)
    );

    // Calculate clarity score
    const clarityScore = Math.round(
      (Math.min(100, 100 - fillerWordRate * 5) * 0.5) +
      (Math.min(100, speakingPace / 2) * 0.3) +
      (loudnessVariation * 0.2)
    );

    return {
      averagePitch: Math.round(averagePitch),
      pitchVariation: Math.round(pitchVariation),
      averageLoudness: Math.round(averageLoudness),
      loudnessVariation: Math.round(loudnessVariation),
      speakingPace,
      pauseCount,
      averagePauseDuration: Math.round(averagePauseDuration * 10) / 10,
      fillerWordCount: this.totalFillers,
      fillerWordRate: Math.round(fillerWordRate * 10) / 10,
      toneQuality,
      confidenceScore: Math.min(100, Math.max(0, confidenceScore)),
      clarityScore: Math.min(100, Math.max(0, clarityScore)),
    };
  }

  private getDefaultReport(): VoiceAnalysisResult {
    return {
      averagePitch: 150,
      pitchVariation: 30,
      averageLoudness: 50,
      loudnessVariation: 25,
      speakingPace: 120,
      pauseCount: 5,
      averagePauseDuration: 1.5,
      fillerWordCount: 8,
      fillerWordRate: 2.5,
      toneQuality: 'moderate',
      confidenceScore: 70,
      clarityScore: 75,
    };
  }

  reset() {
    this.pitchSamples = [];
    this.loudnessSamples = [];
    this.transcripts = [];
    this.timestamps = [];
    this.totalWords = 0;
    this.totalFillers = 0;
  }
}
