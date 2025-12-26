/**
 * ElevenLabs Voice Provider
 * 
 * Official API Documentation: https://elevenlabs.io/docs/api-reference
 * 
 * INTERNAL USE ONLY - Provider name must NEVER appear in UI
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const ELEVENLABS_API_URL = "https://api.elevenlabs.io";

// ============================================================================
// TYPES
// ============================================================================

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: "premade" | "cloned" | "generated";
  labels: Record<string, string>;
  description?: string;
  preview_url?: string;
  available_for_tiers: string[];
  settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface ElevenLabsModel {
  model_id: string;
  name: string;
  description: string;
  can_be_finetuned: boolean;
  can_do_text_to_speech: boolean;
  can_do_voice_conversion: boolean;
  languages: Array<{ language_id: string; name: string }>;
}

export interface TextToSpeechOptions {
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
  outputFormat?: "mp3_44100_128" | "mp3_44100_192" | "pcm_16000" | "pcm_22050" | "pcm_24000";
}

export interface VoiceCloneOptions {
  name: string;
  description?: string;
  files: Blob[]; // Audio files for voice cloning
  labels?: Record<string, string>;
}

// ============================================================================
// API HELPERS
// ============================================================================

async function elevenlabsFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${ELEVENLABS_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
  }

  // Check if response is JSON or binary
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  
  // For audio responses, return the response object itself
  return response as unknown as T;
}

// ============================================================================
// VOICES API
// ============================================================================

/**
 * Get list of all available voices
 * Endpoint: GET /v1/voices
 */
export async function getVoices(): Promise<ElevenLabsVoice[]> {
  interface VoicesResponse {
    voices: ElevenLabsVoice[];
  }
  
  const data = await elevenlabsFetch<VoicesResponse>("/v1/voices");
  return data.voices;
}

/**
 * Get a specific voice by ID
 * Endpoint: GET /v1/voices/{voice_id}
 */
export async function getVoice(voiceId: string): Promise<ElevenLabsVoice> {
  return elevenlabsFetch<ElevenLabsVoice>(`/v1/voices/${voiceId}`);
}

/**
 * Get voices filtered by language (Spanish voices for SAMLA)
 */
export async function getSpanishVoices(): Promise<ElevenLabsVoice[]> {
  const voices = await getVoices();
  return voices.filter(voice => {
    const labels = voice.labels || {};
    const language = labels.language?.toLowerCase() || "";
    return (
      language.includes("spanish") ||
      language.includes("español") ||
      language === "es"
    );
  });
}

/**
 * Delete a cloned voice
 * Endpoint: DELETE /v1/voices/{voice_id}
 */
export async function deleteVoice(voiceId: string): Promise<boolean> {
  try {
    await elevenlabsFetch(`/v1/voices/${voiceId}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.error("Error deleting voice:", error);
    return false;
  }
}

// ============================================================================
// TEXT-TO-SPEECH API
// ============================================================================

/**
 * Convert text to speech
 * Endpoint: POST /v1/text-to-speech/{voice_id}
 * 
 * Returns audio as ArrayBuffer
 */
export async function textToSpeech(
  options: TextToSpeechOptions
): Promise<ArrayBuffer> {
  const {
    text,
    voiceId,
    modelId = "eleven_multilingual_v2", // Best for Spanish
    voiceSettings,
    outputFormat = "mp3_44100_128",
  } = options;

  const response = await fetch(
    `${ELEVENLABS_API_URL}/v1/text-to-speech/${voiceId}?output_format=${outputFormat}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: voiceSettings ? {
          stability: voiceSettings.stability ?? 0.5,
          similarity_boost: voiceSettings.similarityBoost ?? 0.75,
          style: voiceSettings.style ?? 0,
          use_speaker_boost: voiceSettings.useSpeakerBoost ?? true,
        } : undefined,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Text-to-speech error (${response.status}): ${errorText}`);
  }

  return response.arrayBuffer();
}

/**
 * Stream text to speech (for real-time applications)
 * Endpoint: POST /v1/text-to-speech/{voice_id}/stream
 */
export async function textToSpeechStream(
  options: TextToSpeechOptions
): Promise<ReadableStream<Uint8Array>> {
  const {
    text,
    voiceId,
    modelId = "eleven_multilingual_v2",
    outputFormat = "mp3_44100_128",
  } = options;

  const response = await fetch(
    `${ELEVENLABS_API_URL}/v1/text-to-speech/${voiceId}/stream?output_format=${outputFormat}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stream error (${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error("No response body for streaming");
  }

  return response.body;
}

// ============================================================================
// VOICE CLONING API (Instant Voice Cloning)
// ============================================================================

/**
 * Clone a voice from audio samples
 * Endpoint: POST /v1/voices/add
 * 
 * Requires audio files (MP3, WAV, etc.) of the voice to clone
 */
export async function cloneVoice(
  options: VoiceCloneOptions
): Promise<ElevenLabsVoice> {
  const { name, description, files, labels } = options;

  const formData = new FormData();
  formData.append("name", name);
  
  if (description) {
    formData.append("description", description);
  }

  // Add audio files
  files.forEach((file, index) => {
    formData.append("files", file, `sample_${index}.mp3`);
  });

  // Add labels as JSON
  if (labels) {
    formData.append("labels", JSON.stringify(labels));
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/v1/voices/add`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Voice cloning error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Edit a cloned voice's settings
 * Endpoint: POST /v1/voices/{voice_id}/edit
 */
export async function editVoice(
  voiceId: string,
  updates: { name?: string; description?: string; labels?: Record<string, string> }
): Promise<boolean> {
  const formData = new FormData();
  
  if (updates.name) formData.append("name", updates.name);
  if (updates.description) formData.append("description", updates.description);
  if (updates.labels) formData.append("labels", JSON.stringify(updates.labels));

  const response = await fetch(`${ELEVENLABS_API_URL}/v1/voices/${voiceId}/edit`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: formData,
  });

  return response.ok;
}

// ============================================================================
// MODELS API
// ============================================================================

/**
 * Get available models
 * Endpoint: GET /v1/models
 */
export async function getModels(): Promise<ElevenLabsModel[]> {
  return elevenlabsFetch<ElevenLabsModel[]>("/v1/models");
}

// ============================================================================
// USER API
// ============================================================================

interface UserSubscription {
  character_count: number;
  character_limit: number;
  can_extend_character_limit: boolean;
  allowed_to_extend_character_limit: boolean;
  next_character_count_reset_unix: number;
  voice_limit: number;
  max_voice_add_edits: number;
  voice_add_edit_counter: number;
}

/**
 * Get user subscription info (for quota tracking)
 * Endpoint: GET /v1/user/subscription
 */
export async function getUserSubscription(): Promise<UserSubscription> {
  return elevenlabsFetch<UserSubscription>("/v1/user/subscription");
}

// ============================================================================
// CONVERSATIONAL AI API (for phone calls)
// ============================================================================

interface ConversationConfig {
  agent_id?: string;
  first_message?: string;
  system_prompt?: string;
  voice_id: string;
  model_id?: string;
  language?: string;
  max_duration_seconds?: number;
  tools?: Array<{
    type: string;
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
}

/**
 * Create a conversation session for phone calls
 * This uses ElevenLabs Conversational AI
 */
export async function createConversation(
  config: ConversationConfig
): Promise<{ conversation_id: string; websocket_url: string }> {
  const response = await elevenlabsFetch<{ conversation_id: string; websocket_url: string }>(
    "/v1/convai/conversation",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: config.agent_id,
        first_message: config.first_message,
        system_prompt: config.system_prompt,
        voice_id: config.voice_id,
        model_id: config.model_id || "eleven_turbo_v2",
        language: config.language || "es",
        max_duration_seconds: config.max_duration_seconds || 600, // 10 min default
        tools: config.tools,
      }),
    }
  );

  return response;
}

// ============================================================================
// HELPER FOR SAMLA
// ============================================================================

/**
 * Get voices formatted for SAMLA UI (no provider name exposed)
 */
export async function getVoicesForUI(): Promise<Array<{
  id: string;
  name: string;
  language: string;
  accent?: string;
  gender?: string;
  tone?: string;
  previewUrl?: string;
  isCustom: boolean;
}>> {
  try {
    const voices = await getVoices();
    
    return voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      language: voice.labels?.language || "Spanish",
      accent: voice.labels?.accent,
      gender: voice.labels?.gender,
      tone: voice.labels?.description || voice.labels?.use_case,
      previewUrl: voice.preview_url,
      isCustom: voice.category === "cloned",
    }));
  } catch (error) {
    console.error("Error fetching voices:", error);
    return [];
  }
}

/**
 * Generate speech and return as base64 for easy frontend use
 */
export async function generateSpeechBase64(
  text: string,
  voiceId: string
): Promise<string | null> {
  try {
    const audioBuffer = await textToSpeech({ text, voiceId });
    const base64 = Buffer.from(audioBuffer).toString("base64");
    return `data:audio/mpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
}

