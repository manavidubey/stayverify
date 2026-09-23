import vision from '@google-cloud/vision';

// Initialize the client.
// It will automatically use the GOOGLE_CLOUD_VISION_KEY if configured as Google credentials,
// but usually it requires GOOGLE_APPLICATION_CREDENTIALS file or passing credentials.
// For the MVP, we assume the environment is set up or we can pass an API key directly.
// The Vision API client library supports API keys via the `apiKey` option.
const client = new vision.ImageAnnotatorClient({
  apiKey: process.env.GOOGLE_CLOUD_VISION_KEY,
});

/**
 * Image Authenticity Detector
 * Input: one or more listing image URLs
 * Method: reverse image search (Google Cloud Vision API WEB_DETECTION feature)
 */
export async function detectImageAuthenticity(imageUrls) {
  if (!imageUrls || imageUrls.length === 0) {
    return {
      reverse_image_match_found: null,
      matched_source: null,
      match_count: null,
    };
  }

  try {
    let totalMatchCount = 0;
    let matchedSource = null;
    let matchFound = false;

    // For MVP, we'll just check the first image to save API calls
    const url = imageUrls[0];
    
    // In a real app we might process all images
    const [result] = await client.webDetection(url);
    const webDetection = result.webDetection;
    
    if (webDetection && webDetection.pagesWithMatchingImages && webDetection.pagesWithMatchingImages.length > 0) {
      matchFound = true;
      totalMatchCount = webDetection.pagesWithMatchingImages.length;
      matchedSource = `Found on ${webDetection.pagesWithMatchingImages[0].url}`;
    }

    return {
      reverse_image_match_found: matchFound,
      matched_source: matchedSource,
      match_count: totalMatchCount,
    };
  } catch (error) {
    console.error("Error in detectImageAuthenticity:", error);
    // Fallback if API fails (e.g. no key)
    return {
      reverse_image_match_found: null,
      matched_source: null,
      match_count: null,
    };
  }
}
