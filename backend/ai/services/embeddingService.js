import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const EMBEDDING_DIMENSION = 1536;

let openaiClient = null;

const getOpenAIClient = () => {
  const apiKey = process.env.EMBEDDING_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

/**
 * Deterministic fallback embedding generator (1536 dimensions)
 * Uses word token frequency and char n-gram hashing with unit normalization.
 */
const generateDeterministicEmbedding = (text) => {
  const vec = new Array(EMBEDDING_DIMENSION).fill(0);
  const clean = (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length === 0) return vec;

  // Word hashing & n-gram projections
  words.forEach((word, idx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const pos = Math.abs(hash) % EMBEDDING_DIMENSION;
    vec[pos] += 1.0;

    // Bigram context
    if (idx > 0) {
      const bi = words[idx - 1] + '_' + word;
      let biHash = 0;
      for (let i = 0; i < bi.length; i++) {
        biHash = (biHash << 5) - biHash + bi.charCodeAt(i);
        biHash |= 0;
      }
      const biPos = Math.abs(biHash) % EMBEDDING_DIMENSION;
      vec[biPos] += 1.5;
    }
  });

  // L2 Normalize
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
      vec[i] /= norm;
    }
  }

  return vec;
};

let openaiEmbeddingQuotaExceeded = false;

/**
 * Generate embedding for a single text string
 */
export const getEmbedding = async (text) => {
  if (!text || typeof text !== 'string') {
    return new Array(EMBEDDING_DIMENSION).fill(0);
  }

  if (!openaiEmbeddingQuotaExceeded) {
    const client = getOpenAIClient();
    if (client) {
      try {
        const response = await client.embeddings.create({
          model: 'text-embedding-3-small',
          input: text.substring(0, 8000),
        });
        return response.data[0].embedding;
      } catch (error) {
        console.warn('[EmbeddingService] OpenAI embedding unavailable, switching to local fast vectorizer:', error.message);
        if (error.status === 429 || error.status === 400 || error.status === 401) {
          openaiEmbeddingQuotaExceeded = true;
        }
      }
    }
  }

  // Instant fallback to deterministic normalized embedding
  return generateDeterministicEmbedding(text);
};

/**
 * Generate embeddings for an array of text strings
 */
export const getBatchEmbeddings = async (texts) => {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  if (!openaiEmbeddingQuotaExceeded) {
    const client = getOpenAIClient();
    if (client) {
      try {
        const response = await client.embeddings.create({
          model: 'text-embedding-3-small',
          input: texts.map(t => (t || '').substring(0, 8000)),
        });
        return response.data.map(d => d.embedding);
      } catch (error) {
        console.warn('[EmbeddingService] Batch OpenAI embedding unavailable:', error.message);
        if (error.status === 429 || error.status === 400 || error.status === 401) {
          openaiEmbeddingQuotaExceeded = true;
        }
      }
    }
  }

  return texts.map(generateDeterministicEmbedding);
};

export { EMBEDDING_DIMENSION };
