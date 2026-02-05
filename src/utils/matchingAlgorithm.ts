interface DesignerCriteria {
  quantity: number;
  leadTime: string; // "1-3", "4-6", "7-10", "10+"
  location: string;
  priceRange: string;
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
  applyStrictFilters?: boolean; // If true, non-matching gets very low score
}

interface ManufacturerProfile {
  moq: number;
  maxCapacity?: number;
  leadTime: number; // in days
  location: string;
  priceTier: string;
  rating?: number;
  categories: string[];
}

// Regional location mapping - comprehensive list of countries by region
export const REGION_COUNTRIES: Record<string, string[]> = {
  asia: [
    'afghanistan', 'armenia', 'azerbaijan', 'bahrain', 'bangladesh', 'bhutan', 
    'brunei', 'cambodia', 'china', 'cyprus', 'georgia', 'india', 'indonesia', 
    'iran', 'iraq', 'israel', 'japan', 'jordan', 'kazakhstan', 'kuwait', 
    'kyrgyzstan', 'laos', 'lebanon', 'malaysia', 'maldives', 'mongolia', 
    'myanmar', 'nepal', 'north korea', 'oman', 'pakistan', 'palestine', 
    'philippines', 'qatar', 'saudi arabia', 'singapore', 'south korea', 
    'sri lanka', 'syria', 'taiwan', 'tajikistan', 'thailand', 'timor-leste',
    'turkey', 'turkmenistan', 'united arab emirates', 'uae', 'uzbekistan', 
    'vietnam', 'yemen',
    // Common city names in Asia
    'dhaka', 'mumbai', 'delhi', 'bangalore', 'karachi', 'shanghai', 'beijing',
    'tokyo', 'manila', 'jakarta', 'bangkok', 'ho chi minh', 'hanoi'
  ],
  europe: [
    'albania', 'andorra', 'austria', 'belarus', 'belgium', 'bosnia', 
    'herzegovina', 'bulgaria', 'croatia', 'czech republic', 'denmark', 
    'estonia', 'finland', 'france', 'germany', 'greece', 'hungary', 
    'iceland', 'ireland', 'italy', 'kosovo', 'latvia', 'liechtenstein', 
    'lithuania', 'luxembourg', 'malta', 'moldova', 'monaco', 'montenegro', 
    'netherlands', 'north macedonia', 'norway', 'poland', 'portugal', 
    'romania', 'russia', 'san marino', 'serbia', 'slovakia', 'slovenia', 
    'spain', 'sweden', 'switzerland', 'ukraine', 'uk', 'united kingdom',
    'vatican',
    // Common city names in Europe
    'milan', 'rome', 'paris', 'berlin', 'london', 'madrid', 'barcelona',
    'amsterdam', 'brussels', 'vienna', 'prague', 'budapest', 'warsaw'
  ],
  canada: ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary'],
  'north america': [
    'usa', 'united states', 'america', 'mexico', 'canada',
    'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
    'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'portland'
  ],
  'central america': [
    'belize', 'costa rica', 'el salvador', 'guatemala', 'honduras', 
    'nicaragua', 'panama'
  ],
  'south america': [
    'argentina', 'bolivia', 'brazil', 'chile', 'colombia', 'ecuador', 
    'guyana', 'paraguay', 'peru', 'suriname', 'uruguay', 'venezuela',
    'sao paulo', 'rio de janeiro', 'buenos aires', 'bogota', 'lima'
  ],
  africa: [
    'algeria', 'angola', 'benin', 'botswana', 'burkina faso', 'burundi',
    'cameroon', 'cape verde', 'central african republic', 'chad', 'comoros',
    'congo', 'djibouti', 'egypt', 'equatorial guinea', 'eritrea', 'ethiopia',
    'gabon', 'gambia', 'ghana', 'guinea', 'guinea-bissau', 'ivory coast',
    'kenya', 'lesotho', 'liberia', 'libya', 'madagascar', 'malawi', 'mali',
    'mauritania', 'mauritius', 'morocco', 'mozambique', 'namibia', 'niger',
    'nigeria', 'rwanda', 'sao tome', 'senegal', 'seychelles', 'sierra leone',
    'somalia', 'south africa', 'south sudan', 'sudan', 'tanzania', 'togo',
    'tunisia', 'uganda', 'zambia', 'zimbabwe',
    'cairo', 'lagos', 'nairobi', 'johannesburg', 'cape town'
  ],
};

export function isLocationMatch(designerLocation: string, manufacturerLocation: string): boolean {
  const designerLoc = designerLocation.toLowerCase().trim();
  const manufacturerLoc = manufacturerLocation.toLowerCase().trim();
  
  console.log(`[isLocationMatch] Comparing designer: "${designerLoc}" with manufacturer: "${manufacturerLoc}"`);
  
  // If designer chose "any", always match
  if (designerLoc === 'any' || !designerLoc) {
    console.log('[isLocationMatch] Designer chose "any" - MATCH');
    return true;
  }
  
  // Exact match
  if (manufacturerLoc === designerLoc) {
    console.log('[isLocationMatch] Exact match - MATCH');
    return true;
  }
  
  // Check if designer location is a region and manufacturer is in that region
  const regionCountries = REGION_COUNTRIES[designerLoc];
  if (regionCountries) {
    console.log(`[isLocationMatch] Designer chose region "${designerLoc}" with countries:`, regionCountries.slice(0, 10));
    // Check if manufacturer location matches any country/city in the region
    const match = regionCountries.some(country => {
      // Match if manufacturer location contains the country name or vice versa
      const matched = manufacturerLoc.includes(country) || country.includes(manufacturerLoc);
      if (matched) {
        console.log(`[isLocationMatch] Found match with country/city: "${country}" - MATCH`);
      }
      return matched;
    });
    if (!match) {
      console.log('[isLocationMatch] No region match found - NO MATCH');
    }
    return match;
  }
  
  // Check if manufacturer location contains designer location or vice versa
  if (manufacturerLoc.includes(designerLoc) || designerLoc.includes(manufacturerLoc)) {
    console.log('[isLocationMatch] Substring match - MATCH');
    return true;
  }
  
  console.log('[isLocationMatch] No match found - NO MATCH');
  return false;
}

export function calculateMatchScore(
  designer: DesignerCriteria,
  manufacturer: ManufacturerProfile
): number {
  console.log('[calculateMatchScore] Starting calculation');
  console.log('  Designer criteria:', designer);
  console.log('  Manufacturer profile:', manufacturer);
  
  // 1. Category Score (HIGHEST PRIORITY - 40%)
  let categoryScore = 0;
  if (designer.categories && designer.categories.length > 0 && 
      manufacturer.categories && manufacturer.categories.length > 0) {
    const matchingCategories = designer.categories.filter(dc => 
      manufacturer.categories.some(mc => 
        mc.toLowerCase() === dc.toLowerCase()
      )
    );
    categoryScore = (matchingCategories.length / designer.categories.length) * 100;
    console.log(`  Category Score: ${categoryScore} (matching: ${matchingCategories.length}/${designer.categories.length})`);
  } else {
    categoryScore = 50;
    console.log('  Category Score: 50 (no categories to compare)');
  }

  // 2. Quantity Score (MOQ) - 30%
  let quantityScore = 0;
  let quantityPenalty = false;
  
  if (designer.quantity <= 0) {
    quantityScore = 50; // Neutral if no quantity specified
    console.log('  Quantity Score: 50 (no quantity specified)');
  } else if (designer.quantity < manufacturer.moq) {
    // Below MOQ - no fit
    quantityScore = 0;
    quantityPenalty = true;
    console.log(`  Quantity Score: ${quantityScore.toFixed(1)} (below MOQ: ${designer.quantity} < ${manufacturer.moq})${quantityPenalty ? ' - STRICT PENALTY' : ''}`);
  } else if (manufacturer.maxCapacity && designer.quantity > manufacturer.maxCapacity) {
    // Exceeds capacity - severe penalty in strict mode
    const rawScore = (manufacturer.maxCapacity / designer.quantity) * 100;
    quantityScore = designer.applyStrictFilters ? Math.min(rawScore, 10) : rawScore;
    quantityPenalty = designer.applyStrictFilters;
    console.log(`  Quantity Score: ${quantityScore.toFixed(1)} (exceeds capacity: ${designer.quantity} > ${manufacturer.maxCapacity})${quantityPenalty ? ' - STRICT PENALTY' : ''}`);
  } else {
    // Perfect match - within MOQ and capacity
    quantityScore = 100;
    console.log(`  Quantity Score: 100 (perfect fit: ${designer.quantity} between ${manufacturer.moq} and ${manufacturer.maxCapacity || 'unlimited'})`);
  }

  // 3. Location Score - 15%
  let locationScore = 50; // neutral default
  let locationPenalty = false;
  
  if (isLocationMatch(designer.location || 'any', manufacturer.location || '')) {
    locationScore = 100;
  } else {
    locationScore = designer.applyStrictFilters ? 0 : 50;
    locationPenalty = designer.applyStrictFilters;
  }
  console.log(`  Location Score: ${locationScore}${locationPenalty ? ' - CRITICAL PENALTY (0)' : ''}`);

  // 4. Price Score - 15%
  let priceScore = 50; // neutral default
  let pricePenalty = false;
  
  // If designer specified min/max price, use that for scoring
  if (designer.minPrice !== undefined || designer.maxPrice !== undefined) {
    // Extract price from manufacturer's price_range (format: "$15-$30 per unit")
    const priceMatch = manufacturer.priceTier.match(/\$(\d+)-\$(\d+)/);
    if (priceMatch) {
      const manufacturerMin = parseInt(priceMatch[1]);
      const manufacturerMax = parseInt(priceMatch[2]);
      const userMin = designer.minPrice ?? 0;
      const userMax = designer.maxPrice ?? Infinity;
      
      // Perfect overlap - manufacturer range is within designer range
      if (manufacturerMin >= userMin && manufacturerMax <= userMax) {
        priceScore = 100;
      } 
      // Partial overlap - ranges overlap
      else if (manufacturerMin <= userMax && manufacturerMax >= userMin) {
        const overlapStart = Math.max(manufacturerMin, userMin);
        const overlapEnd = Math.min(manufacturerMax, userMax);
        const overlapSize = overlapEnd - overlapStart;
        const designerRangeSize = userMax - userMin || 1;
        priceScore = (overlapSize / designerRangeSize) * 100;
      }
      // No overlap - penalty
      else {
        priceScore = designer.applyStrictFilters ? 0 : 30;
        pricePenalty = designer.applyStrictFilters;
      }
    }
    console.log(`  Price Score: ${priceScore.toFixed(1)}${pricePenalty ? ' - STRICT PENALTY' : ''}`);
  } else if (manufacturer.priceTier === designer.priceRange) {
    // Fallback to tier matching if no specific prices
    priceScore = 100;
    console.log(`  Price Score: 100 (tier match)`);
  } else {
    console.log(`  Price Score: ${priceScore} (default)`);
  }

  // Lead time and rating are not used for now

  // Final Weighted Score with Location as critical priority
  const finalScore =
    0.40 * categoryScore +
    0.30 * quantityScore +
    0.15 * locationScore +
    0.15 * priceScore;

  console.log(`  FINAL SCORE: ${Math.round(finalScore)} (breakdown: cat=${(0.40*categoryScore).toFixed(1)}, qty=${(0.30*quantityScore).toFixed(1)}, loc=${(0.15*locationScore).toFixed(1)}, price=${(0.15*priceScore).toFixed(1)})`);

  return Math.round(finalScore);
}
