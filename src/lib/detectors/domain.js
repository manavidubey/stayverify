import whois from 'whois-json';

const HOTEL_DOMAINS = ['marriott', 'hilton', 'hyatt', 'ihg', 'wyndham', 'choicehotels', 'bestwestern'];

/**
 * Domain/Host Legitimacy Detector
 * Input: listing's domain or host account info
 * Method: WHOIS lookup
 */
export async function detectDomainLegitimacy(domain) {
  if (!domain) {
    return {
      domain_age_days: null,
      host_verified: null,
      typosquat_suspected: null,
    };
  }

  try {
    let extractedDomain = domain;
    try {
      if (domain.startsWith('http')) {
        extractedDomain = new URL(domain).hostname;
      }
    } catch(e) {}
    
    // Simple typosquatting check (if it contains a hotel brand name but isn't exact match or something similar)
    // For MVP, just a basic fuzzy check
    let typosquatSuspected = false;
    const lowerDomain = extractedDomain.toLowerCase();
    for (const brand of HOTEL_DOMAINS) {
      if (lowerDomain.includes(brand) && !lowerDomain.endsWith(`${brand}.com`)) {
        typosquatSuspected = true;
      }
    }

    const results = await whois(extractedDomain);
    let domainAgeDays = 0;
    
    // whois-json returns keys based on raw whois output, which can vary
    const creationDateStr = results.creationDate || results.createdDate || results.creationdate;
    
    if (creationDateStr) {
      const creationDate = new Date(creationDateStr);
      if (!isNaN(creationDate)) {
        const diffTime = Math.abs(new Date() - creationDate);
        domainAgeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    return {
      domain_age_days: domainAgeDays,
      host_verified: false, // Defaulting to false as platform data isn't always available via whois
      typosquat_suspected: typosquatSuspected,
    };
  } catch (error) {
    console.error("Error in detectDomainLegitimacy:", error);
    return {
      domain_age_days: null,
      host_verified: null,
      typosquat_suspected: null,
    };
  }
}
