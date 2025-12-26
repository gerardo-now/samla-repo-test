/**
 * Voice Provider Abstraction
 * 
 * INTERNAL ONLY - Provider name must NEVER appear in UI
 * All AI voice functionality is routed through this abstraction
 * 
 * Uses ElevenLabs API internally: https://elevenlabs.io/docs/api-reference
 */

import {
  getVoicesForUI,
  textToSpeech,
  textToSpeechStream,
  cloneVoice as elevenLabsCloneVoice,
  deleteVoice as elevenLabsDeleteVoice,
  generateSpeechBase64,
  createConversation,
  getUserSubscription,
} from "./elevenlabsProvider";

// ============================================================================
// TYPES (Generic - no provider names)
// ============================================================================

export interface VoiceGenerateOptions {
  text: string;
  voiceId: string;
  language?: string;
}

export interface VoiceGenerateResult {
  audioUrl: string;
  audioBase64?: string;
  durationSeconds: number;
}

export interface VoiceCloneOptions {
  name: string;
  audioFiles: Blob[];
  workspaceId: string;
  consentConfirmed: boolean;
  description?: string;
}

export interface VoiceCloneResult {
  voiceId: string;
  name: string;
  previewUrl?: string;
}

export interface ConversationAgentOptions {
  systemPrompt: string;
  voiceId: string;
  firstMessage?: string;
  tools?: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
  maxDurationSeconds?: number;
}

export interface ConversationSession {
  sessionId: string;
  websocketUrl: string;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  accent?: string;
  gender?: string;
  tone?: string;
  previewUrl?: string;
  isCustom: boolean;
}

export interface VoiceQuota {
  charactersUsed: number;
  charactersLimit: number;
  voicesUsed: number;
  voicesLimit: number;
  resetsAt: Date;
}

// ============================================================================
// VOICE PROVIDER CLASS
// ============================================================================

class VoiceProvider {
  /**
   * Generate speech from text
   */
  async generateSpeech(options: VoiceGenerateOptions): Promise<VoiceGenerateResult | null> {
    try {
      const audioBuffer = await textToSpeech({
        text: options.text,
        voiceId: options.voiceId,
      });

      // Convert to base64 for easy use
      const base64 = Buffer.from(audioBuffer).toString("base64");
      const audioBase64 = `data:audio/mpeg;base64,${base64}`;

      // Estimate duration (rough: ~150 words per minute, 5 chars per word)
      const estimatedDuration = (options.text.length / 5 / 150) * 60;

      return {
        audioUrl: audioBase64, // Data URL for immediate playback
        audioBase64,
        durationSeconds: Math.max(1, Math.round(estimatedDuration)),
      };
    } catch (error) {
      console.error("Error generating speech:", error);
      return null;
    }
  }

  /**
   * Generate speech and return only base64
   */
  async generateSpeechBase64(text: string, voiceId: string): Promise<string | null> {
    return generateSpeechBase64(text, voiceId);
  }

  /**
   * Stream speech for real-time applications
   */
  async streamSpeech(
    options: VoiceGenerateOptions
  ): Promise<ReadableStream<Uint8Array> | null> {
    try {
      return await textToSpeechStream({
        text: options.text,
        voiceId: options.voiceId,
      });
    } catch (error) {
      console.error("Error streaming speech:", error);
      return null;
    }
  }

  /**
   * Clone a voice from audio samples
   * IMPORTANT: Requires user consent confirmation
   */
  async cloneVoice(options: VoiceCloneOptions): Promise<VoiceCloneResult | null> {
    // Consent is required by law and API terms
    if (!options.consentConfirmed) {
      console.error("Voice cloning requires consent confirmation");
      return null;
    }

    if (options.audioFiles.length === 0) {
      console.error("At least one audio sample is required");
      return null;
    }

    try {
      const result = await elevenLabsCloneVoice({
        name: options.name,
        description: options.description,
        files: options.audioFiles,
        labels: {
          workspace: options.workspaceId,
        },
      });

      return {
        voiceId: result.voice_id,
        name: result.name,
        previewUrl: result.preview_url,
      };
    } catch (error) {
      console.error("Error cloning voice:", error);
      return null;
    }
  }

  /**
   * Delete a cloned voice
   */
  async deleteVoice(voiceId: string): Promise<boolean> {
    return elevenLabsDeleteVoice(voiceId);
  }

  /**
   * Get all available voices (formatted for UI)
   */
  async getAvailableVoices(): Promise<Voice[]> {
    try {
      return await getVoicesForUI();
    } catch (error) {
      console.error("Error fetching voices:", error);
      // Return default voices if API fails
      return [
        { id: "default_sofia", name: "Sofia", language: "Spanish", gender: "female", isCustom: false },
        { id: "default_carlos", name: "Carlos", language: "Spanish", gender: "male", isCustom: false },
        { id: "default_maria", name: "María", language: "Spanish", gender: "female", isCustom: false },
        { id: "default_diego", name: "Diego", language: "Spanish", gender: "male", isCustom: false },
      ];
    }
  }

  /**
   * Get voices filtered by criteria
   */
  async getVoicesByLanguage(language: string): Promise<Voice[]> {
    const voices = await this.getAvailableVoices();
    return voices.filter(
      (v) => v.language.toLowerCase().includes(language.toLowerCase())
    );
  }

  /**
   * Create a conversational AI session (for phone calls)
   */
  async createConversationAgent(
    options: ConversationAgentOptions
  ): Promise<ConversationSession | null> {
    try {
      const result = await createConversation({
        system_prompt: options.systemPrompt,
        voice_id: options.voiceId,
        first_message: options.firstMessage,
        max_duration_seconds: options.maxDurationSeconds,
        tools: options.tools?.map((t) => ({
          type: "function",
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        })),
      });

      return {
        sessionId: result.conversation_id,
        websocketUrl: result.websocket_url,
      };
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  }

  /**
   * Get voice usage quota
   */
  async getQuota(): Promise<VoiceQuota | null> {
    try {
      const subscription = await getUserSubscription();
      return {
        charactersUsed: subscription.character_count,
        charactersLimit: subscription.character_limit,
        voicesUsed: subscription.voice_add_edit_counter,
        voicesLimit: subscription.max_voice_add_edits,
        resetsAt: new Date(subscription.next_character_count_reset_unix * 1000),
      };
    } catch (error) {
      console.error("Error fetching quota:", error);
      return null;
    }
  }
}

export const voiceProvider = new VoiceProvider();
