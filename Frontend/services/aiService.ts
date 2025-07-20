import axios from 'axios';

// Types for AI analysis
export interface AIScene {
  id: string;
  startTime: number;
  endTime: number;
  description: string;
  confidence: number;
  tags: string[];
  type: 'action' | 'dialogue' | 'establishing' | 'closeup' | 'wide' | 'transition' | 'highlight';
  mood: 'energetic' | 'calm' | 'dramatic' | 'funny' | 'serious' | 'romantic';
  dominantColors?: string[];
  motionLevel?: 'low' | 'medium' | 'high';
  shotType?: 'closeup' | 'medium' | 'wide' | 'extreme_wide';
}

export interface AICaption {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface VideoAnalysisResult {
  scenes: AIScene[];
  captions: AICaption[];
  metadata: {
    duration: number;
    resolution: { width: number; height: number };
    fps: number;
  };
}

// API Configuration
const API_CONFIG = {
  OPENAI: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    baseURL: 'https://api.openai.com/v1',
  },
  GOOGLE_CLOUD: {
    apiKey: process.env.REACT_APP_GOOGLE_CLOUD_API_KEY || '',
  },
  AZURE: {
    apiKey: process.env.REACT_APP_AZURE_API_KEY || '',
    endpoint: process.env.REACT_APP_AZURE_ENDPOINT || '',
  },
  AWS: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || '',
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
  }
};

// Main AI Service Class
export class AIService {
  private static instance: AIService;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Main analysis method
  async analyzeVideo(videoFile: File, scriptContent?: string): Promise<VideoAnalysisResult> {
    try {
      console.log('Starting AI video analysis...');
      if (scriptContent) {
        console.log('📝 Using script information for enhanced analysis');
      }
      
      // Use the backend API for real AI analysis
      const formData = new FormData();
      formData.append('file', videoFile);
      if (scriptContent) {
        formData.append('script_content', scriptContent);
      }
      
      const response = await axios.post('http://localhost:8000/analyze-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for video processing
      });
      
      if (response.data.success) {
        const { scenes, transcript, metadata } = response.data;
        
        // Convert backend scenes to frontend format
        const convertedScenes: AIScene[] = scenes.map((scene: any) => ({
          id: scene.id,
          startTime: scene.startTime,
          endTime: scene.endTime,
          description: scene.description,
          confidence: scene.confidence,
          tags: scene.tags,
          type: scene.type,
          mood: scene.mood,
          dominantColors: scene.dominantColors || [],
          motionLevel: scene.motionLevel || 'medium',
          shotType: scene.shotType || 'medium'
        }));
        
        // Create captions from transcript
        const captions: AICaption[] = transcript ? [{
          id: '1',
          text: transcript,
          startTime: 0,
          endTime: metadata.duration || 0,
          confidence: 0.9
        }] : [];
        
        const result: VideoAnalysisResult = {
          scenes: convertedScenes,
          captions,
          metadata: {
            duration: metadata.duration || 0,
            resolution: { width: 1920, height: 1080 }, // Default
            fps: 30
          }
        };

        console.log('AI analysis completed:', {
          scenes: convertedScenes.length,
          captions: captions.length,
          duration: metadata.duration
        });

        return result;
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.generateFallbackAnalysis(videoFile);
    }
  }

  // Extract video metadata
  private async extractVideoMetadata(videoFile: File): Promise<{ duration: number; resolution: { width: number; height: number }; fps: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(videoFile);
      
      video.onloadedmetadata = () => {
        const metadata = {
          duration: video.duration,
          resolution: {
            width: video.videoWidth,
            height: video.videoHeight
          },
          fps: 30 // Default, could be extracted from video
        };
        
        URL.revokeObjectURL(url);
        resolve(metadata);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = url;
    });
  }

  // Extract frames from video
  private async extractVideoFrames(videoFile: File, duration: number): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(videoFile);
      const frames: string[] = [];
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Extract frames at regular intervals (max 10 frames)
        const frameCount = Math.min(10, Math.floor(duration / 3));
        const frameInterval = duration / frameCount;
        let currentFrame = 0;
        
        const extractFrame = () => {
          if (currentFrame >= frameCount) {
            URL.revokeObjectURL(url);
            resolve(frames);
            return;
          }
          
          const timePosition = currentFrame * frameInterval;
          video.currentTime = timePosition;
          
          video.onseeked = () => {
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);
              frames.push(frameDataUrl);
            }
            currentFrame++;
            setTimeout(extractFrame, 0);
          };
        };
        
        extractFrame();
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to extract video frames'));
      };
      
      video.src = url;
    });
  }

  // Analyze scenes using OpenAI Vision API
  private async analyzeScenes(frames: string[], metadata: any): Promise<AIScene[]> {
    if (!API_CONFIG.OPENAI.apiKey) {
      console.warn('OpenAI API key not configured, using fallback scene analysis');
      return this.generateFallbackScenes(metadata.duration);
    }

    try {
      const scenes: AIScene[] = [];
      
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const timePosition = (i / frames.length) * metadata.duration;
        
        const scene = await this.analyzeFrameWithOpenAI(frame, timePosition, metadata.duration);
        scenes.push(scene);
      }
      
      return this.mergeSimilarScenes(scenes);
      
    } catch (error) {
      console.error('OpenAI scene analysis failed:', error);
      return this.generateFallbackScenes(metadata.duration);
    }
  }

  // Analyze single frame with OpenAI Vision
  private async analyzeFrameWithOpenAI(frameDataUrl: string, timePosition: number, totalDuration: number): Promise<AIScene> {
    const base64Image = frameDataUrl.split(',')[1];
    
    const response = await axios.post(
      `${API_CONFIG.OPENAI.baseURL}/chat/completions`,
      {
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this video frame and provide scene information in JSON format:
                {
                  "description": "Brief scene description",
                  "sceneType": "action|dialogue|establishing|closeup|wide|transition|highlight",
                  "mood": "energetic|calm|dramatic|funny|serious|romantic",
                  "shotType": "closeup|medium|wide|extreme_wide",
                  "motionLevel": "low|medium|high",
                  "dominantColors": ["#hex1", "#hex2", "#hex3"],
                  "tags": ["tag1", "tag2", "tag3"],
                  "confidence": 0.95
                }
                
                Time position: ${timePosition.toFixed(2)}s of ${totalDuration.toFixed(2)}s total.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.OPENAI.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    try {
      const analysis = JSON.parse(response.data.choices[0].message.content);
      
      return {
        id: `scene_${timePosition}`,
        startTime: timePosition,
        endTime: timePosition + (totalDuration / 10), // Assume 10 scenes
        description: analysis.description || 'Scene detected',
        confidence: analysis.confidence || 0.8,
        tags: analysis.tags || ['scene'],
        type: analysis.sceneType || 'establishing',
        mood: analysis.mood || 'calm',
        dominantColors: analysis.dominantColors || ['#000000'],
        motionLevel: analysis.motionLevel || 'medium',
        shotType: analysis.shotType || 'medium'
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return this.generateFallbackScene(timePosition, totalDuration);
    }
  }

  // Analyze audio using OpenAI Whisper
  private async analyzeAudio(videoFile: File): Promise<AICaption[]> {
    if (!API_CONFIG.OPENAI.apiKey) {
      console.warn('OpenAI API key not configured, skipping audio analysis');
      return [];
    }

    try {
      // Extract audio from video
      const audioBlob = await this.extractAudioFromVideo(videoFile);
      
      // Transcribe with Whisper
      const transcription = await this.transcribeAudio(audioBlob);
      
      // Convert to captions
      return this.convertTranscriptionToCaptions(transcription);
      
    } catch (error) {
      console.error('Audio analysis failed:', error);
      return [];
    }
  }

  // Extract audio from video
  private async extractAudioFromVideo(videoFile: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(videoFile);
      
      video.onloadedmetadata = () => {
        // For now, we'll use the video file directly
        // In a real implementation, you'd extract audio
        URL.revokeObjectURL(url);
        resolve(videoFile);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to extract audio'));
      };
      
      video.src = url;
    });
  }

  // Transcribe audio with OpenAI Whisper
  private async transcribeAudio(audioBlob: Blob): Promise<any> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp4');
    formData.append('model', 'whisper-1');
    
    const response = await axios.post(
      `${API_CONFIG.OPENAI.baseURL}/audio/transcriptions`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.OPENAI.apiKey}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      }
    );
    
    return response.data;
  }

  // Convert transcription to captions
  private convertTranscriptionToCaptions(transcription: any): AICaption[] {
    if (!transcription.text) return [];
    
    const words = transcription.text.split(' ');
    const wordsPerCaption = 8;
    const captions: AICaption[] = [];
    
    for (let i = 0; i < words.length; i += wordsPerCaption) {
      const captionWords = words.slice(i, i + wordsPerCaption);
      const startTime = (i / words.length) * 120; // Assume 2-minute video
      const endTime = ((i + wordsPerCaption) / words.length) * 120;
      
      captions.push({
        id: `caption_${i}`,
        text: captionWords.join(' '),
        startTime,
        endTime,
        confidence: 0.9
      });
    }
    
    return captions;
  }

  // Merge similar scenes
  private mergeSimilarScenes(scenes: AIScene[]): AIScene[] {
    if (scenes.length <= 1) return scenes;
    
    const merged: AIScene[] = [];
    let currentScene = scenes[0];
    
    for (let i = 1; i < scenes.length; i++) {
      const scene = scenes[i];
      
      // Check if scenes are similar and close in time
      if (this.areScenesSimilar(currentScene, scene) && 
          scene.startTime - currentScene.endTime < 10) {
        // Merge scenes
        currentScene.endTime = scene.endTime;
        currentScene.tags = [...new Set([...currentScene.tags, ...scene.tags])];
        currentScene.confidence = Math.max(currentScene.confidence, scene.confidence);
      } else {
        merged.push(currentScene);
        currentScene = scene;
      }
    }
    
    merged.push(currentScene);
    return merged;
  }

  // Check if scenes are similar
  private areScenesSimilar(scene1: AIScene, scene2: AIScene): boolean {
    return scene1.type === scene2.type && 
           scene1.mood === scene2.mood &&
           this.calculateTagSimilarity(scene1.tags, scene2.tags) > 0.3;
  }

  // Calculate tag similarity
  private calculateTagSimilarity(tags1: string[], tags2: string[]): number {
    const set1 = new Set(tags1);
    const set2 = new Set(tags2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  // Generate fallback analysis when APIs fail
  private generateFallbackAnalysis(videoFile: File): VideoAnalysisResult {
    console.log('Generating fallback analysis...');
    
    return {
      scenes: this.generateFallbackScenes(120), // Assume 2-minute video
      captions: this.generateFallbackCaptions(),
      metadata: {
        duration: 120,
        resolution: { width: 1920, height: 1080 },
        fps: 30
      }
    };
  }

  // Generate fallback scenes
  private generateFallbackScenes(duration: number): AIScene[] {
    const sceneCount = 4;
    const sceneDuration = duration / sceneCount;
    
    const fallbackScenes: AIScene[] = [
      {
        id: 'fallback_1',
        startTime: 0,
        endTime: sceneDuration,
        description: 'Opening scene - establishing shot',
        confidence: 0.7,
        tags: ['establishing', 'intro', 'fallback'],
        type: 'establishing',
        mood: 'calm',
        dominantColors: ['#000000', '#ffffff', '#cccccc'],
        motionLevel: 'low',
        shotType: 'wide'
      },
      {
        id: 'fallback_2',
        startTime: sceneDuration,
        endTime: sceneDuration * 2,
        description: 'Main action sequence',
        confidence: 0.7,
        tags: ['action', 'dynamic', 'fallback'],
        type: 'action',
        mood: 'energetic',
        dominantColors: ['#ff0000', '#ffff00', '#00ff00'],
        motionLevel: 'high',
        shotType: 'medium'
      },
      {
        id: 'fallback_3',
        startTime: sceneDuration * 2,
        endTime: sceneDuration * 3,
        description: 'Dialogue scene',
        confidence: 0.7,
        tags: ['dialogue', 'conversation', 'fallback'],
        type: 'dialogue',
        mood: 'serious',
        dominantColors: ['#0000ff', '#ffffff', '#cccccc'],
        motionLevel: 'low',
        shotType: 'closeup'
      },
      {
        id: 'fallback_4',
        startTime: sceneDuration * 3,
        endTime: duration,
        description: 'Closing sequence',
        confidence: 0.7,
        tags: ['highlight', 'climax', 'fallback'],
        type: 'highlight',
        mood: 'dramatic',
        dominantColors: ['#ff00ff', '#ffff00', '#00ffff'],
        motionLevel: 'medium',
        shotType: 'wide'
      }
    ];
    
    return fallbackScenes;
  }

  // Generate fallback scene
  private generateFallbackScene(timePosition: number, totalDuration: number): AIScene {
    return {
      id: `fallback_scene_${timePosition}`,
      startTime: timePosition,
      endTime: timePosition + (totalDuration / 10),
      description: 'Scene detected (fallback analysis)',
      confidence: 0.7,
      tags: ['fallback', 'auto-detected'],
      type: 'establishing',
      mood: 'calm',
      dominantColors: ['#000000', '#ffffff'],
      motionLevel: 'medium',
      shotType: 'medium'
    };
  }

  // Generate fallback captions
  private generateFallbackCaptions(): AICaption[] {
    return [
      {
        id: 'fallback_caption_1',
        text: 'Welcome to our tutorial (fallback)',
        startTime: 0,
        endTime: 3,
        confidence: 0.7
      },
      {
        id: 'fallback_caption_2',
        text: 'Today we will learn about video editing (fallback)',
        startTime: 3,
        endTime: 7,
        confidence: 0.7
      },
      {
        id: 'fallback_caption_3',
        text: 'Let us start with the basics (fallback)',
        startTime: 7,
        endTime: 12,
        confidence: 0.7
      },
      {
        id: 'fallback_caption_4',
        text: 'This is an important technique (fallback)',
        startTime: 12,
        endTime: 18,
        confidence: 0.7
      }
    ];
  }

  // Check API availability
  checkAPIAvailability(): { openai: boolean; google: boolean; azure: boolean; aws: boolean } {
    return {
      openai: !!API_CONFIG.OPENAI.apiKey,
      google: !!API_CONFIG.GOOGLE_CLOUD.apiKey,
      azure: !!API_CONFIG.AZURE.apiKey,
      aws: !!(API_CONFIG.AWS.accessKeyId && API_CONFIG.AWS.secretAccessKey)
    };
  }
}

// Export singleton instance
export const aiService = AIService.getInstance(); 