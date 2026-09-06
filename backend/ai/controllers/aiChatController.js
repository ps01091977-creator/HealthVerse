import jwt from 'jsonwebtoken';
import { processUserQuery } from '../services/ragService.js';
import { syncKnowledgeBase, syncDoctors } from '../services/qdrantService.js';
import { isConnected as isQdrantReady } from '../config/qdrantClient.js';
import { getGrokClient } from '../services/grokService.js';
import { getInworldConfig, generateInworldSessionToken, synthesizeSpeech } from '../services/inworldService.js';
import doctorModel from '../../models/doctorModel.js';
import { KNOWLEDGE_DOCUMENTS } from '../knowledge/knowledgeBase.js';

/**
 * Extract user ID from token header if present (supports authenticated & guest users)
 */
const extractUserId = (req) => {
  const token = req.headers.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || null;
  } catch (err) {
    return null;
  }
};

/**
 * POST /api/ai/chat
 * Primary conversational AI chat endpoint with RAG and Tool Calling
 */
export const handleChat = async (req, res) => {
  try {
    const { message, chatHistory, clientAction } = req.body;

    if (!message && !clientAction) {
      return res.status(400).json({
        success: false,
        message: "A message string or clientAction is required.",
      });
    }

    const userId = extractUserId(req);

    const result = await processUserQuery({
      message: message || '',
      chatHistory: chatHistory || [],
      userId,
      clientAction: clientAction || null,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[AIChatController] Error handling chat:', error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your AI healthcare request.",
      error: error.message,
    });
  }
};

/**
 * POST /api/ai/voice/stt or POST /api/transcribe
 * High-accuracy Speech-to-Text Audio Transcription via Groq Whisper API (whisper-large-v3)
 */
export const handleSTT = async (req, res) => {
  try {
    const file = req.file;
    const { audioBase64, mimeType } = req.body || {};

    if (!file && !audioBase64) {
      return res.status(400).json({ 
        success: false, 
        message: "Audio file (multipart/form-data) or audioBase64 payload is required for transcription." 
      });
    }

    const { transcribeAudioWithGroqWhisper } = await import('../services/groqWhisperService.js');
    const result = await transcribeAudioWithGroqWhisper({ 
      file, 
      audioBase64, 
      mimeType: mimeType || file?.mimetype || 'audio/webm' 
    });

    return res.json(result);
  } catch (error) {
    console.error('[AIChatController] STT error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/ai/voice/tts
 * Synthesize speech from text
 */
export const handleTTS = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Text is required for TTS." });
    }

    const ttsResult = await synthesizeSpeech(text);
    return res.json({ success: true, ...ttsResult });
  } catch (error) {
    console.error('[AIChatController] TTS error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/ai/voice/session
 * Get Inworld session token for client SDK
 */
export const handleVoiceSession = async (req, res) => {
  try {
    const userId = extractUserId(req);
    const session = await generateInworldSessionToken({ userId });
    return res.json(session);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/ai/sync-knowledge
 * Re-index doctors and knowledge base into Qdrant vector database
 */
export const handleSyncKnowledge = async (req, res) => {
  try {
    // 1. Sync Knowledge Base documents
    await syncKnowledgeBase(KNOWLEDGE_DOCUMENTS);

    // 2. Fetch doctors from database and sync
    const doctors = await doctorModel.find({}).select("-password -email");
    await syncDoctors(doctors);

    return res.json({
      success: true,
      message: `Successfully synchronized ${KNOWLEDGE_DOCUMENTS.length} KB documents and ${doctors.length} doctors into vector index.`,
      docCount: doctors.length,
      kbCount: KNOWLEDGE_DOCUMENTS.length,
    });
  } catch (error) {
    console.error('[AIChatController] Sync error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/ai/health
 * Diagnostic endpoint for AI services
 */
export const handleHealthCheck = (req, res) => {
  const grokConfigured = Boolean(process.env.GROK_API_KEY || process.env.XAI_API_KEY);
  const qdrantConfigured = Boolean(process.env.QDRANT_URL);
  const inworldInfo = getInworldConfig();

  res.json({
    status: 'online',
    services: {
      grokLLM: {
        configured: grokConfigured,
        model: 'grok-2-latest (xAI)',
        provider: grokConfigured ? 'xai-grok' : 'fallback-clinical-engine',
      },
      qdrantVectorDB: {
        configured: qdrantConfigured,
        ready: isQdrantReady(),
        storage: isQdrantReady() ? 'qdrant-cluster' : 'in-memory-cosine-vector-store',
      },
      inworldVoice: {
        configured: inworldInfo.isConfigured,
        voiceMode: inworldInfo.isConfigured ? 'inworld-studio' : 'browser-webspeech-hd',
      }
    },
    version: '2.0.0-rag',
  });
};
