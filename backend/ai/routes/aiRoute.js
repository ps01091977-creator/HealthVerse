import express from 'express';
import { 
  handleChat, 
  handleSTT,
  handleTTS, 
  handleVoiceSession, 
  handleSyncKnowledge, 
  handleHealthCheck 
} from '../controllers/aiChatController.js';

import upload from '../../middlewares/multer.js';

const aiRouter = express.Router();

// Primary Conversational AI & Tool Calling endpoint
aiRouter.post('/chat', handleChat);

// Voice STT / Transcription endpoints (supports multipart/form-data with 'audio' or 'file', as well as JSON)
aiRouter.post('/voice/stt', upload.single('audio'), handleSTT);
aiRouter.post('/voice/transcribe', upload.single('audio'), handleSTT);
aiRouter.post('/transcribe', upload.single('audio'), handleSTT);
aiRouter.post('/voice/tts', handleTTS);
aiRouter.get('/voice/session', handleVoiceSession);

// Vector DB & Knowledge Synchronization
aiRouter.post('/sync-knowledge', handleSyncKnowledge);

// Health & System status
aiRouter.get('/health', handleHealthCheck);

export default aiRouter;
