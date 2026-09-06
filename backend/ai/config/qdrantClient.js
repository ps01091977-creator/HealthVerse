import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
dotenv.config();

let qdrant = null;
let isQdrantConnected = false;

export const getQdrantClient = () => {
  if (qdrant) return qdrant;

  const url = process.env.QDRANT_URL || 'http://localhost:6333';
  const apiKey = process.env.QDRANT_API_KEY || undefined;

  try {
    qdrant = new QdrantClient({
      url,
      apiKey: apiKey && apiKey.trim() !== '' ? apiKey : undefined,
      checkCompatibility: false,
    });
    console.log(`[Qdrant] Initialized client for ${url}`);
    return qdrant;
  } catch (error) {
    console.warn(`[Qdrant] Client initialization warning:`, error.message);
    return null;
  }
};

export const checkQdrantHealth = async () => {
  try {
    const client = getQdrantClient();
    if (!client) return false;
    const collections = await client.getCollections();
    isQdrantConnected = true;
    console.log(`[Qdrant] Connected successfully. Existing collections:`, collections.collections.map(c => c.name));
    return true;
  } catch (error) {
    isQdrantConnected = false;
    console.warn(`[Qdrant] Not connected (will use smart in-memory vector fallback):`, error.message);
    return false;
  }
};

export const isConnected = () => isQdrantConnected;
