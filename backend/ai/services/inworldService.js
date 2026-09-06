import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Inworld & Cloud AI Voice Service
 * Handles Inworld character session tokens, TTS audio synthesis, and High-Accuracy AI Speech-to-Text (STT).
 */

export const getInworldConfig = () => {
  const apiKey = process.env.INWORLD_API_KEY;
  const apiSecret = process.env.INWORLD_API_SECRET;
  const scene = process.env.INWORLD_SCENE || process.env.INWORLD_CHARACTER;

  return {
    isConfigured: Boolean(apiKey && apiSecret),
    apiKey: apiKey ? '***configured***' : null,
    scene: scene || null,
  };
};

/**
 * High-Accuracy AI Speech-to-Text Transcription (Transcribes Hindi, Hinglish, English audio)
 */
export const transcribeAudio = async ({ audioBase64, mimeType = 'audio/webm' }) => {
  if (!audioBase64) {
    return { success: false, message: 'Audio data is missing.' };
  }

  const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1].trim() : audioBase64.trim();
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const cleanMime = (mimeType || 'audio/webm').split(';')[0];
      const candidateModels = ['gemini-3.6-flash', 'gemini-2.0-flash'];
      
      console.log(`[VoiceSTT] Sending ${cleanBase64.length} bytes of audio (${cleanMime}) to Gemini Speech-to-Text...`);
      
      const payload = {
        contents: [
          {
            parts: [
              {
                text: "Listen carefully to this patient healthcare query audio. Transcribe the exact words spoken by the user in English, Hindi, or Hinglish accurately. Output ONLY the raw transcribed text without any quotes, preamble, or markdown.",
              },
              {
                inline_data: {
                  mime_type: cleanMime,
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
      };

      const requestPromises = candidateModels.map(async (model) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const response = await axios.post(url, payload, { timeout: 8000 });
        const transcript = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        if (!transcript) throw new Error(`Empty transcript from ${model}`);
        return {
          model,
          transcript,
        };
      });

      try {
        const winner = await Promise.any(requestPromises);
        console.log(`[VoiceSTT] Successfully transcribed audio via ${winner.model}: "${winner.transcript}"`);
        return {
          success: true,
          text: winner.transcript,
          provider: `gemini-${winner.model}`,
        };
      } catch (raceErr) {
        console.warn('[VoiceSTT] All Gemini models failed or timed out:', raceErr.message);
      }
    } catch (err) {
      console.warn('[VoiceSTT] Gemini transcription error:', err.response?.data || err.message);
    }
  }

  return {
    success: false,
    message: 'Could not transcribe audio. Please try speaking closer to the microphone.',
  };
};

/**
 * Generate Inworld Session Token for client Web SDK / Real-time Voice
 */
export const generateInworldSessionToken = async (userContext = {}) => {
  const apiKey = process.env.INWORLD_API_KEY;
  const apiSecret = process.env.INWORLD_API_SECRET;
  const scene = process.env.INWORLD_SCENE || process.env.INWORLD_CHARACTER;

  if (!apiKey || !apiSecret) {
    return {
      success: false,
      isConfigured: false,
      message: "Inworld credentials (INWORLD_API_KEY, INWORLD_API_SECRET) not configured in backend .env. Client will use Web Speech API fallback.",
    };
  }

  try {
    const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const response = await axios.post(
      'https://api.inworld.ai/v1/session/token',
      {
        scene: scene || undefined,
        user: {
          id: userContext.userId || 'anonymous-novacare-user',
          name: userContext.userName || 'Patient',
        },
      },
      {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    return {
      success: true,
      token: response.data.token,
      sessionId: response.data.sessionId,
      expirationTime: response.data.expirationTime,
    };
  } catch (error) {
    console.warn('[InworldService] Failed to generate session token:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
      message: "Inworld session creation failed, using Web Speech voice engine fallback.",
    };
  }
};

/**
 * Synthesize Speech Audio (Text to Speech)
 */
export const synthesizeSpeech = async (text) => {
  const apiKey = process.env.INWORLD_API_KEY;
  const apiSecret = process.env.INWORLD_API_SECRET;

  if (!apiKey || !apiSecret) {
    return {
      success: false,
      useBrowserTTS: true,
      text,
      message: "Inworld API key not configured. Using high-definition Web Speech Synthesis on client.",
    };
  }

  try {
    const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const response = await axios.post(
      'https://api.inworld.ai/v1/tts',
      { text: text.substring(0, 500), voiceId: 'default' },
      {
        headers: { 'Authorization': `Basic ${basicAuth}` },
        responseType: 'arraybuffer',
        timeout: 6000,
      }
    );

    const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
    return {
      success: true,
      audioBase64: `data:audio/mp3;base64,${base64Audio}`,
    };
  } catch (err) {
    console.warn('[InworldService] TTS synthesis error, delegating to browser speech synthesis:', err.message);
    return {
      success: false,
      useBrowserTTS: true,
      text,
    };
  }
};
