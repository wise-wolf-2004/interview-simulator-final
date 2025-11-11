import * as faceapi from 'face-api.js';
import type { FaceMetrics } from '../types';

let modelsLoaded = false;

export async function loadFaceModels() {
  if (modelsLoaded) return;

  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

export async function analyzeFace(videoElement: HTMLVideoElement): Promise<FaceMetrics> {
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (!detection) {
      return { smile: 0, eyeContact: 0.5, blinkRate: 0 };
    }

    const expressions = detection.expressions;
    const smile = expressions.happy || 0;

    // Estimate eye contact based on face angle (simplified)
    const landmarks = detection.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const eyeContact = leftEye && rightEye ? 0.7 : 0.3;

    return {
      smile: parseFloat(smile.toFixed(2)),
      eyeContact: parseFloat(eyeContact.toFixed(2)),
      blinkRate: 0, // Would need temporal analysis
    };
  } catch (error) {
    console.error('Face analysis error:', error);
    return { smile: 0, eyeContact: 0.5, blinkRate: 0 };
  }
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  async initialize(stream: MediaStream) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
  }

  getMetrics(): { loudness: number; pitch: number } {
    if (!this.analyser || !this.dataArray) {
      return { loudness: 0, pitch: 0 };
    }

    const dataArray = new Uint8Array(this.dataArray.length);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate RMS (loudness)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const loudness = Math.min(100, (rms / 128) * 100);

    // Estimate pitch (simplified - find peak frequency)
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    const pitch = (maxIndex * this.audioContext!.sampleRate) / this.analyser.fftSize;

    return {
      loudness: parseFloat(loudness.toFixed(2)),
      pitch: parseFloat(pitch.toFixed(2)),
    };
  }

  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export function countFillerWords(text: string): number {
  const fillers = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];
  const lowerText = text.toLowerCase();
  return fillers.reduce((count, filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, 'g');
    const matches = lowerText.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

export function calculatePace(wordCount: number, durationSeconds: number): number {
  if (durationSeconds === 0) return 0;
  return parseFloat((wordCount / (durationSeconds / 60)).toFixed(2));
}
