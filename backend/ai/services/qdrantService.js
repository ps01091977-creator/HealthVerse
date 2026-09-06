import { getQdrantClient, checkQdrantHealth } from '../config/qdrantClient.js';
import { getEmbedding, getBatchEmbeddings, EMBEDDING_DIMENSION } from './embeddingService.js';
import { KNOWLEDGE_DOCUMENTS } from '../knowledge/knowledgeBase.js';

export const KB_COLLECTION = 'novacare_kb';
export const DOCTORS_COLLECTION = 'novacare_doctors';

// In-Memory Vector Store Fallback
const inMemoryStore = {
  [KB_COLLECTION]: [],      // Array of { id, vector, payload }
  [DOCTORS_COLLECTION]: [], // Array of { id, vector, payload }
};

/**
 * Compute cosine similarity between two float vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Ensure a collection exists in Qdrant
 */
const ensureCollection = async (client, collectionName) => {
  try {
    const collections = await client.getCollections();
    const exists = collections.collections.some(c => c.name === collectionName);
    if (!exists) {
      console.log(`[Qdrant] Creating collection "${collectionName}" with vector size ${EMBEDDING_DIMENSION}...`);
      await client.createCollection(collectionName, {
        vectors: {
          size: EMBEDDING_DIMENSION,
          distance: 'Cosine',
        },
      });
      console.log(`[Qdrant] Collection "${collectionName}" created.`);
    }
    return true;
  } catch (error) {
    console.warn(`[Qdrant] ensureCollection error for ${collectionName}:`, error.message);
    return false;
  }
};

/**
 * Initialize Qdrant and Seed Collections
 */
export const initQdrant = async () => {
  const isHealthy = await checkQdrantHealth();
  const client = getQdrantClient();

  if (isHealthy && client) {
    try {
      await ensureCollection(client, KB_COLLECTION);
      await ensureCollection(client, DOCTORS_COLLECTION);
    } catch (err) {
      console.warn('[Qdrant] Collection initialization error:', err.message);
    }
  }

  // Always seed initial KB in-memory and in Qdrant if available
  await syncKnowledgeBase(KNOWLEDGE_DOCUMENTS);
};

/**
 * Sync / Upsert Knowledge Base Documents
 */
export const syncKnowledgeBase = async (documents = KNOWLEDGE_DOCUMENTS) => {
  console.log(`[Qdrant] Indexing ${documents.length} knowledge base documents...`);
  const texts = documents.map(d => `${d.title}\n${d.content}`);
  const vectors = await getBatchEmbeddings(texts);

  const points = documents.map((doc, idx) => ({
    id: idx + 1,
    vector: vectors[idx],
    payload: {
      docId: doc.id,
      title: doc.title,
      category: doc.category,
      content: doc.content,
    },
  }));

  // Update in-memory store
  inMemoryStore[KB_COLLECTION] = points;

  // Update Qdrant if connected
  const client = getQdrantClient();
  if (client) {
    try {
      await client.upsert(KB_COLLECTION, {
        wait: true,
        points: points.map(p => ({
          id: p.id,
          vector: p.vector,
          payload: p.payload,
        })),
      });
      console.log(`[Qdrant] Successfully synced ${points.length} points to "${KB_COLLECTION}".`);
    } catch (err) {
      console.warn(`[Qdrant] Upsert to ${KB_COLLECTION} failed, cached in memory:`, err.message);
    }
  }
};

/**
 * Sync / Upsert Doctor Records into Vector Store
 */
export const syncDoctors = async (doctors = []) => {
  if (!Array.isArray(doctors) || doctors.length === 0) return;

  console.log(`[Qdrant] Indexing ${doctors.length} doctors for vector search...`);
  const texts = doctors.map(doc => 
    `Doctor Name: ${doc.name}. Speciality: ${doc.speciality}. Degree: ${doc.degree}. Experience: ${doc.experience}. About: ${doc.about}. Fees: ₹${doc.fees}. Available: ${doc.available}. Average Rating: ${doc.averageRating || 5.0} stars.`
  );

  const vectors = await getBatchEmbeddings(texts);

  // Generate valid integer or UUID id
  const points = doctors.map((doc, idx) => ({
    id: idx + 1000,
    vector: vectors[idx],
    payload: {
      _id: doc._id?.toString(),
      name: doc.name,
      speciality: doc.speciality,
      degree: doc.degree,
      experience: doc.experience,
      about: doc.about,
      fees: doc.fees,
      image: doc.image,
      available: doc.available,
      address: doc.address,
      averageRating: doc.averageRating || 5.0,
      ratingCount: doc.ratingCount || 0,
    },
  }));

  // Update in-memory store
  inMemoryStore[DOCTORS_COLLECTION] = points;

  // Update Qdrant if connected
  const client = getQdrantClient();
  if (client) {
    try {
      await client.upsert(DOCTORS_COLLECTION, {
        wait: true,
        points: points.map(p => ({
          id: p.id,
          vector: p.vector,
          payload: p.payload,
        })),
      });
      console.log(`[Qdrant] Successfully synced ${points.length} doctor profiles to "${DOCTORS_COLLECTION}".`);
    } catch (err) {
      console.warn(`[Qdrant] Upsert to ${DOCTORS_COLLECTION} failed, cached in memory:`, err.message);
    }
  }
};

/**
 * Semantic Vector Search in Knowledge Base
 */
export const searchKnowledgeBase = async (queryText, topK = 3) => {
  if (!queryText) return [];

  const queryVector = await getEmbedding(queryText);
  const client = getQdrantClient();

  if (client) {
    try {
      // Latest @qdrant/js-client-rest query API
      const result = await client.query(KB_COLLECTION, {
        query: queryVector,
        limit: topK,
        with_payload: true,
      });

      const points = result?.points || (Array.isArray(result) ? result : []);
      if (points && points.length > 0) {
        return points.map(res => ({
          score: res.score,
          title: res.payload?.title || '',
          category: res.payload?.category || 'general',
          content: res.payload?.content || '',
        }));
      }
    } catch (err) {
      console.warn('[Qdrant] KB search error, falling back to memory store:', err.message);
    }
  }

  // In-memory cosine search fallback
  const scored = inMemoryStore[KB_COLLECTION].map(item => ({
    score: cosineSimilarity(queryVector, item.vector),
    title: item.payload.title,
    category: item.payload.category,
    content: item.payload.content,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
};

/**
 * Semantic Vector Search for Doctors
 */
export const searchDoctorsVector = async (queryText, topK = 4) => {
  if (!queryText) return [];

  const queryVector = await getEmbedding(queryText);
  const client = getQdrantClient();

  if (client) {
    try {
      const result = await client.query(DOCTORS_COLLECTION, {
        query: queryVector,
        limit: topK,
        with_payload: true,
      });

      const points = result?.points || (Array.isArray(result) ? result : []);
      if (points && points.length > 0) {
        return points.map(res => ({
          score: res.score,
          ...res.payload,
        }));
      }
    } catch (err) {
      console.warn('[Qdrant] Doctors vector search error, falling back to memory store:', err.message);
    }
  }

  // In-memory cosine search fallback
  const scored = inMemoryStore[DOCTORS_COLLECTION].map(item => ({
    score: cosineSimilarity(queryVector, item.vector),
    ...item.payload,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
};
