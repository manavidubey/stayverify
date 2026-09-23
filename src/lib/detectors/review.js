import { pipeline } from '@xenova/transformers';

let extractor = null;

/**
 * Helper to compute cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
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
}

/**
 * Review Integrity Detector
 * Input: listing's review text (array of strings)
 * Method: sentence embeddings + cosine similarity clustering
 */
export async function detectReviewIntegrity(reviews) {
  if (!reviews || !Array.isArray(reviews) || reviews.length < 2) {
    return {
      review_text_similarity_score: null,
      review_count: reviews ? reviews.length : 0,
    };
  }

  try {
    // Load model lazily
    if (!extractor) {
      // Use a small model suitable for browser/node
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    // Get embeddings
    const embeddings = [];
    for (const text of reviews) {
      if (text.trim()) {
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        embeddings.push(Array.from(output.data));
      }
    }

    if (embeddings.length < 2) {
      return {
        review_text_similarity_score: null,
        review_count: reviews.length,
      };
    }

    // Calculate max pairwise similarity
    let maxSimilarity = 0;
    let totalSimilarity = 0;
    let pairs = 0;

    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const sim = cosineSimilarity(embeddings[i], embeddings[j]);
        if (sim > maxSimilarity) maxSimilarity = sim;
        totalSimilarity += sim;
        pairs++;
      }
    }

    const avgSimilarity = pairs > 0 ? totalSimilarity / pairs : 0;
    
    // We can use a mix of max similarity and average. Max is a good red flag indicator.
    // If there is one pair of highly duplicated reviews, maxSimilarity will be close to 1.
    // For MVP we'll just use the maximum pairwise similarity found.
    // Ensure it's between 0 and 1
    const finalScore = Math.max(0, Math.min(1, maxSimilarity));

    return {
      review_text_similarity_score: parseFloat(finalScore.toFixed(2)),
      review_count: reviews.length,
    };
  } catch (error) {
    console.error("Error in detectReviewIntegrity:", error);
    return {
      review_text_similarity_score: null,
      review_count: reviews.length,
    };
  }
}
