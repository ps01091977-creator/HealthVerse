import Groq, { toFile } from 'groq-sdk';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

let groqClient = null;

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  if (!groqClient || groqClient.apiKey !== apiKey) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};

/**
 * Transcribe Audio using Groq's Whisper API (whisper-large-v3 / whisper-large-v3-turbo)
 * In-memory buffer processing with `toFile` for maximum speed and reliability.
 */
export const transcribeAudioWithGroqWhisper = async ({ file, audioBuffer, audioBase64, mimeType = 'audio/webm' }) => {
  const groq = getGroqClient();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || !groq) {
    console.warn('[GroqWhisper] GROQ_API_KEY is not configured in backend/.env');
    return {
      success: false,
      requiresCredential: true,
      credentialName: 'GROQ_API_KEY',
      message: 'GROQ_API_KEY is missing in backend/.env. Please get a free API key from https://console.groq.com/keys and add GROQ_API_KEY=gsk_... to backend/.env',
    };
  }

  let tempPathToClean = null;

  try {
    // 1. Resolve Audio Buffer
    let bufferToProcess = null;
    let fileName = 'recording.webm';
    let cleanMime = 'audio/webm';

    if (file) {
      if (file.buffer && Buffer.isBuffer(file.buffer)) {
        bufferToProcess = file.buffer;
      } else if (file.path && fs.existsSync(file.path)) {
        tempPathToClean = file.path;
        bufferToProcess = fs.readFileSync(file.path);
      }
      if (file.originalname) {
        fileName = file.originalname;
      }
      if (file.mimetype) {
        cleanMime = file.mimetype;
      }
    } else if (audioBuffer && Buffer.isBuffer(audioBuffer)) {
      bufferToProcess = audioBuffer;
    } else if (audioBase64) {
      const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1].trim() : audioBase64.trim();
      bufferToProcess = Buffer.from(cleanBase64, 'base64');
    }

    if (!bufferToProcess || bufferToProcess.length < 300) {
      return {
        success: false,
        message: 'Audio input was too short or empty. Please speak clearly into your microphone.',
      };
    }

    // Determine extension and filename
    if (cleanMime.includes('wav')) fileName = 'recording.wav';
    else if (cleanMime.includes('mp4') || cleanMime.includes('m4a')) fileName = 'recording.m4a';
    else if (cleanMime.includes('ogg')) fileName = 'recording.ogg';
    else if (cleanMime.includes('mp3')) fileName = 'recording.mp3';
    else fileName = 'recording.webm';

    console.log(`[GroqWhisper] Processing ${bufferToProcess.length} bytes audio (${fileName})...`);

    // 2. Convert Buffer to standard File object for Groq SDK
    const fileObj = await toFile(bufferToProcess, fileName, { type: cleanMime });

    // 3. Language & Vocabulary Priming
    let whisperLang = undefined;
    if (mimeType && typeof mimeType === 'string' && mimeType.includes('lang:')) {
      const l = mimeType.split('lang:')[1].trim();
      if (l.startsWith('hi')) whisperLang = 'hi';
      else if (l.startsWith('en-US')) whisperLang = 'en';
      // For 'en-IN' (Indian English / Hinglish auto), leave language undefined so Whisper effortlessly transcribes mixed Hindi/English
    }

    const medicalPrompt = 'HealthVerse AI clinical consultation doctor appointment slots booking symptoms fever bukhar headache dard pain prescription';

    const models = ['whisper-large-v3', 'whisper-large-v3-turbo'];
    let lastError = null;

    // Known silence / background noise hallucinations produced by Whisper
    const WHISPER_HALLUCINATION_PATTERNS = [
      /^thank\s*you[\.\!\?\s]*$/i,
      /^thank\s*you\s*(very\s*much|so\s*much)[\.\!\?\s]*$/i,
      /^thanks[\.\!\?\s]*$/i,
      /^thanks\s*for\s*(watching|listening)[\.\!\?\s]*$/i,
      /^thank\s*you\s*for\s*(watching|listening)[\.\!\?\s]*$/i,
      /^subtitles\s+by.*$/i,
      /^transcript\s+by.*$/i,
      /^translated\s+by.*$/i,
      /^amara\.org.*$/i,
      /^you[\.\!\?\s]*$/i,
      /^bye[\.\!\?\s]*$/i,
      /^subscribe.*$/i,
      /^like\s+and\s+subscribe.*$/i,
      /^mbc.*$/i,
      /^the\s+end[\.\!\?\s]*$/i,
      /^\.+$/,
    ];

    for (const model of models) {
      try {
        const options = {
          file: fileObj,
          model,
          prompt: medicalPrompt,
          temperature: 0.0,
          response_format: 'json',
        };

        if (whisperLang) {
          options.language = whisperLang;
        }

        const transcription = await groq.audio.transcriptions.create(options);
        const text = (transcription.text || '').trim();

        if (!text) {
          return {
            success: false,
            message: 'No speech detected. Please speak closer to your microphone and try again.',
          };
        }

        // Check if text is a known silence hallucination
        if (WHISPER_HALLUCINATION_PATTERNS.some((pattern) => pattern.test(text))) {
          console.log(`[GroqWhisper] Filtered silence hallucination token: "${text}" from ${model}`);
          return {
            success: false,
            message: 'No clear speech detected. Please speak closer to your microphone and try again.',
          };
        }

        console.log(`[GroqWhisper] ${model} transcript: "${text}"`);
        return {
          success: true,
          text,
          model,
          provider: 'groq-whisper',
        };
      } catch (err) {
        lastError = err;
        console.warn(`[GroqWhisper] ${model} attempt error:`, err.message);
      }
    }

    throw lastError || new Error('Whisper transcription failed');
  } catch (error) {
    console.error('[GroqWhisper] Transcription Error:', error.message);
    return {
      success: false,
      message: error.message || 'Speech transcription failed. Please try again.',
      error: error.message,
    };
  } finally {
    if (tempPathToClean && fs.existsSync(tempPathToClean)) {
      try { fs.unlinkSync(tempPathToClean); } catch (e) {}
    }
  }
};

export default transcribeAudioWithGroqWhisper;
