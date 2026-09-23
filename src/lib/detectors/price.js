/**
 * Pricing Anomaly Detector
 * Input: listing price, location, date range
 * Method: compare against a benchmark (mock for MVP)
 */
export async function detectPricingAnomaly(price, location) {
  if (typeof price !== 'number' || isNaN(price) || price === 0) {
    return {
      price_deviation_from_market_pct: null
    };
  }

  // MVP mock: We assume the market average is around $250 for this scenario
  // A more robust implementation would query a database of historical prices for the location.
  const mockMarketAverage = 250;
  
  // Calculate percentage deviation
  const deviation = ((price - mockMarketAverage) / mockMarketAverage) * 100;
  
  return {
    price_deviation_from_market_pct: Math.round(deviation),
  };
}
