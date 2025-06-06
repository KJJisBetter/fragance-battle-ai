import express from 'express';
import { TestResultModel } from '../models/TestResult';
import { FragranceModel } from '../models/Fragrance';
import { createError } from '../middleware/errorHandler';
import { auth } from '../middleware/auth';
import { fragranceScraper, ScrapedFragrance } from '../services/fragranceScraper';

const router = express.Router();

// POST /api/testing/session - Create new test session
router.post('/session', auth, async (req, res, next) => {
  try {
    const { sessionName, isBlindTest = true } = req.body;
    const userId = (req as any).user.id;

    const session = await TestResultModel.createSession(userId, sessionName, isBlindTest);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

// POST /api/testing/session/:sessionId/result - Add test result
router.post('/session/:sessionId/result', auth, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { category, selectedFragrances, maxSelections } = req.body;

    if (!category || !Array.isArray(selectedFragrances) || !maxSelections) {
      throw createError('Missing required fields', 400);
    }

    const result = await TestResultModel.addResult(
      sessionId,
      category,
      selectedFragrances,
      maxSelections
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/testing/session/:sessionId/complete - Complete test session
router.post('/session/:sessionId/complete', auth, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await TestResultModel.completeSession(sessionId);
    res.json({ message: 'Session completed successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/testing/session/:sessionId/results - Get session results
router.get('/session/:sessionId/results', auth, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const results = await TestResultModel.getSessionResults(sessionId);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// GET /api/testing/sessions - Get user's test sessions
router.get('/sessions', auth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const sessions = await TestResultModel.getUserSessions(userId);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// GET /api/testing/battle-data/:category - Get battle data for category
router.get('/battle-data/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const fragrances = await FragranceModel.findByCategory(category);

    // Transform fragrances to match frontend format
    const transformedFragrances = fragrances.map(fragrance => ({
      id: fragrance.id,
      name: fragrance.name,
      brand: fragrance.brand,
      notes: {
        top: fragrance.topNotes,
        middle: fragrance.middleNotes,
        base: fragrance.baseNotes
      },
      versatility: fragrance.versatility,
      categories: fragrance.categories,
      description: fragrance.description,
      imageUrl: fragrance.imageUrl,
      price: fragrance.priceCents ? fragrance.priceCents / 100 : undefined,
      concentration: fragrance.concentration as 'EDT' | 'EDP' | 'Parfum' | 'Cologne'
    }));

    // Battle configuration based on your HTML prototype
    const battleConfigs = {
      daily_driver: {
        title: 'DAILY DRIVER BATTLE',
        purpose: 'Everyday use when you need reliability',
        examples: 'Work commute, gym, errands, casual lunch',
        instruction: 'Pick the TWO that feel most comfortable and versatile',
        maxSelections: 2
      },
      college: {
        title: 'COLLEGE/CAMPUS BATTLE',
        purpose: 'For classroom, study sessions, and campus social life',
        examples: 'Lectures, library sessions, campus events',
        instruction: 'Pick ONE that\'s pleasant, not distracting, and crowd-pleasing',
        maxSelections: 1
      },
      summer: {
        title: 'SUMMER/WARM WEATHER BATTLE',
        purpose: 'For hot, humid days when you need something refreshing',
        examples: 'Beach days, outdoor activities, park outings',
        instruction: 'Pick ONE that feels most cooling and pleasant',
        maxSelections: 1
      },
      office: {
        title: 'OFFICE/PROFESSIONAL BATTLE',
        purpose: 'For work settings requiring confidence and professionalism',
        examples: 'Job interviews, business meetings, presentations',
        instruction: 'Pick ONE that feels sophisticated but not overpowering',
        maxSelections: 1
      },
      club: {
        title: 'CLUB/NIGHT OUT BATTLE',
        purpose: 'For nightlife when you want to make an impression',
        examples: 'Clubs, bars, concerts, parties',
        instruction: 'Pick ONE with the best projection and appeal',
        maxSelections: 1
      },
      date: {
        title: 'DATE NIGHT BATTLE',
        purpose: 'For romantic settings when you want to create attraction',
        examples: 'Dinner dates, intimate evenings',
        instruction: 'Pick ONE that feels most seductive and memorable',
        maxSelections: 1
      },
      signature: {
        title: 'SIGNATURE SCENT BATTLE',
        purpose: 'Your personal trademark that becomes identified with you',
        examples: 'Everyday life when you want to be consistently recognized',
        instruction: 'Pick ONE that feels most "you" and versatile year-round',
        maxSelections: 1
      },
      winter: {
        title: 'FALL/WINTER BATTLE',
        purpose: 'For cold weather when you need something warmer',
        examples: 'Holiday gatherings, cold days, winter activities',
        instruction: 'Pick ONE that feels cozy and substantial',
        maxSelections: 1
      },
      special: {
        title: 'SPECIAL OCCASION BATTLE',
        purpose: 'For important events requiring sophistication',
        examples: 'Weddings, formal dinners, milestone celebrations',
        instruction: 'Pick ONE that feels most refined and impressive',
        maxSelections: 1
      }
    };

    const config = battleConfigs[category as keyof typeof battleConfigs];
    if (!config) {
      throw createError('Invalid category', 400);
    }

    res.json({
      category,
      ...config,
      fragrances: transformedFragrances
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/testing/fragrance - Add new fragrance with AI category prediction
router.post('/fragrance', async (req, res, next) => {
  try {
    const {
      name,
      brand,
      concentration,
      topNotes,
      middleNotes,
      baseNotes,
      description,
      imageUrl,
      priceCents
    } = req.body;

    if (!name || !brand || !topNotes || !middleNotes || !baseNotes) {
      throw createError('Missing required fields: name, brand, and notes are required', 400);
    }

    // Map frontend concentration values to database enum values
    const concentrationMap: { [key: string]: string } = {
      'Cologne': 'Cologne',
      'EDT': 'EDT',
      'EDP': 'EDP',
      'Parfum': 'Parfum'
    };

    const dbConcentration = concentrationMap[concentration] || 'EDT';

    // AI Category Prediction
    const suggestedCategories = await predictFragranceCategories({
      name,
      brand,
      topNotes,
      middleNotes,
      baseNotes,
      description,
      concentration: dbConcentration
    });

    // Calculate versatility based on note complexity and AI suggestions
    const versatility = calculateVersatility(topNotes, middleNotes, baseNotes, suggestedCategories);

    const newFragrance = await FragranceModel.create({
      name,
      brand,
                concentration: dbConcentration as 'EDT' | 'EDP' | 'Parfum' | 'Cologne',
      topNotes,
      middleNotes,
      baseNotes,
      versatility,
      categories: suggestedCategories,
      description,
      imageUrl,
      priceCents: priceCents || 0
    });

    res.status(201).json({
      fragrance: newFragrance,
      suggestedCategories,
      message: 'Fragrance added successfully with AI-suggested categories'
    });
  } catch (error) {
    next(error);
  }
});

// AI Category Prediction Function
async function predictFragranceCategories(fragranceData: {
  name: string;
  brand: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  description?: string;
  concentration?: string;
}): Promise<string[]> {
  const { name, brand, topNotes, middleNotes, baseNotes, description, concentration } = fragranceData;

  // Create a prompt for AI analysis
  const prompt = `
Analyze this fragrance and suggest appropriate categories from this list: daily_driver, college, summer, office, club, date, signature, winter, special.

Fragrance: ${name} by ${brand}
Concentration: ${concentration || 'EDT'}
Top Notes: ${topNotes.join(', ')}
Middle Notes: ${middleNotes.join(', ')}
Base Notes: ${baseNotes.join(', ')}
Description: ${description || 'No description'}

Category Guidelines:
- daily_driver: Versatile, inoffensive, good for everyday use
- college: Pleasant, not overpowering, appropriate for campus
- summer: Fresh, light, good for hot weather
- office: Professional, sophisticated, moderate projection
- club: Strong projection, attention-grabbing, evening wear
- date: Romantic, seductive, intimate settings
- signature: Unique, memorable, can be worn year-round
- winter: Warm, cozy, heavier fragrances
- special: Formal occasions, sophisticated, refined

Return only a JSON array of 2-4 most appropriate categories. Example: ["daily_driver", "office", "summer"]
`;

  try {
    // For now, use a simple rule-based system
    // You can replace this with OpenAI API later
    const categories = await ruleBasedCategoryPrediction(fragranceData);
    return categories;
  } catch (error) {
    console.error('AI prediction failed, using fallback:', error);
    // Fallback to basic categorization
    return ['daily_driver'];
  }
}

// Simple rule-based category prediction (can be replaced with AI)
async function ruleBasedCategoryPrediction(fragranceData: {
  name: string;
  brand: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  description?: string;
  concentration?: string;
}): Promise<string[]> {
  const { topNotes, middleNotes, baseNotes, description, concentration } = fragranceData;
  const allNotes = [...topNotes, ...middleNotes, ...baseNotes].map(note => note.toLowerCase());
  const desc = (description || '').toLowerCase();

  const categories: string[] = [];

  // Fresh/Citrus = Summer, Daily Driver
  if (allNotes.some(note => ['bergamot', 'lemon', 'lime', 'grapefruit', 'orange', 'citrus'].includes(note))) {
    categories.push('summer', 'daily_driver');
  }

  // Aquatic/Marine = Summer, Daily Driver
  if (allNotes.some(note => ['marine', 'sea', 'aquatic', 'water'].includes(note)) || desc.includes('aquatic')) {
    categories.push('summer', 'daily_driver');
  }

  // Woody/Spicy = Office, Winter
  if (allNotes.some(note => ['cedar', 'sandalwood', 'vetiver', 'oak', 'pepper', 'spice'].includes(note))) {
    categories.push('office', 'winter');
  }

  // Sweet/Gourmand = Date, Special
  if (allNotes.some(note => ['vanilla', 'chocolate', 'honey', 'caramel', 'sugar'].includes(note))) {
    categories.push('date', 'special');
  }

  // Floral = College, Date
  if (allNotes.some(note => ['rose', 'jasmine', 'lavender', 'lily', 'peony', 'iris'].includes(note))) {
    categories.push('college', 'date');
  }

  // Heavy/Strong = Club, Winter
  if (concentration === 'EDP' || concentration === 'Parfum' || desc.includes('strong') || desc.includes('powerful')) {
    categories.push('club', 'winter');
  }

  // Professional terms = Office
  if (desc.includes('professional') || desc.includes('sophisticated') || desc.includes('elegant')) {
    categories.push('office');
  }

  // Always include daily_driver for versatile fragrances
  if (categories.length >= 2) {
    categories.push('daily_driver');
  }

  // Remove duplicates and limit to 4 categories
  return [...new Set(categories)].slice(0, 4);
}

// Calculate versatility score based on notes and categories
function calculateVersatility(topNotes: string[], middleNotes: string[], baseNotes: string[], categories: string[]): number {
  let score = 3; // Base score

  // More categories = more versatile
  score += Math.min(categories.length * 0.5, 2);

  // Fresh top notes increase versatility
  const freshNotes = ['bergamot', 'lemon', 'citrus', 'grapefruit'];
  if (topNotes.some(note => freshNotes.includes(note.toLowerCase()))) {
    score += 0.5;
  }

  // Balanced note pyramid increases versatility
  const totalNotes = topNotes.length + middleNotes.length + baseNotes.length;
  if (totalNotes >= 6 && totalNotes <= 12) {
    score += 0.5;
  }

  return Math.min(Math.round(score), 5);
}

// GET /api/testing/fragrance-search - Search for existing fragrances with smart caching
router.get('/fragrance-search', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json({ fragrances: [] });
    }

    const searchTerm = q.toLowerCase();
    console.log(`🔍 Searching for: "${searchTerm}"`);

    // Search existing database first
    const existingFragrances = await FragranceModel.searchFragrances(searchTerm);
    console.log(`📁 Database results: ${existingFragrances.length}`);

    // Always search online for fresh results, even if we have local ones
    let externalResults = [];
    try {
      console.log(`🌐 Starting external search...`);
      externalResults = await searchExternalFragranceDatabase(searchTerm);
      console.log(`🌐 External results: ${externalResults.length}`);

      // SMART CACHING: Auto-save new scraped fragrances to database
      if (externalResults.length > 0) {
        await cacheScrapedFragrances(externalResults, searchTerm);
      }
    } catch (error) {
      console.error('External search failed, using cached results only:', error);
    }

    // Combine results (existing from DB + fresh from scraping)
    const allResults = [...existingFragrances, ...externalResults];

    // Remove duplicates based on name + brand combination
    const uniqueResults = allResults.filter((fragrance, index, self) =>
      index === self.findIndex(f =>
        f.name.toLowerCase() === fragrance.name.toLowerCase() &&
        f.brand.toLowerCase() === fragrance.brand.toLowerCase()
      )
    );

    console.log(`✅ Final results: ${uniqueResults.length} (${existingFragrances.length} from DB, ${externalResults.length} external)`);

    res.json({
      fragrances: uniqueResults.slice(0, 10), // Limit to 10 results
      source: {
        database: existingFragrances.length,
        external: externalResults.length,
        total: uniqueResults.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/testing/fragrance-from-search - Add fragrance from search result
router.post('/fragrance-from-search', async (req, res, next) => {
  try {
    const { fragranceData } = req.body;

    if (!fragranceData) {
      throw createError('Fragrance data is required', 400);
    }

    // If it's from external source, run AI categorization
    let suggestedCategories = [];
    if (fragranceData.source === 'external') {
      suggestedCategories = await predictFragranceCategories({
        name: fragranceData.name,
        brand: fragranceData.brand,
        topNotes: fragranceData.topNotes || [],
        middleNotes: fragranceData.middleNotes || [],
        baseNotes: fragranceData.baseNotes || [],
        description: fragranceData.description,
        concentration: fragranceData.concentration
      });
    } else {
      // Use existing categories if from database
      suggestedCategories = fragranceData.categories || [];
    }

    // Map concentration to database format
    const concentrationMap: { [key: string]: string } = {
      'Cologne': 'Cologne',
      'EDT': 'EDT',
      'EDP': 'EDP',
      'Parfum': 'Parfum'
    };

    const dbConcentration = concentrationMap[fragranceData.concentration] || 'EDT';
    const versatility = calculateVersatility(
      fragranceData.topNotes || [],
      fragranceData.middleNotes || [],
      fragranceData.baseNotes || [],
      suggestedCategories
    );

    const newFragrance = await FragranceModel.create({
      name: fragranceData.name,
      brand: fragranceData.brand,
      concentration: dbConcentration as 'EDT' | 'EDP' | 'Parfum' | 'Cologne',
      topNotes: fragranceData.topNotes || [],
      middleNotes: fragranceData.middleNotes || [],
      baseNotes: fragranceData.baseNotes || [],
      versatility,
      categories: suggestedCategories,
      description: fragranceData.description,
      imageUrl: fragranceData.imageUrl,
      priceCents: fragranceData.priceCents || 0
    });

    res.status(201).json({
      fragrance: newFragrance,
      suggestedCategories,
      message: 'Fragrance added successfully from search',
      source: fragranceData.source
    });
  } catch (error) {
    next(error);
  }
});

// Search external fragrance databases using web scraping
async function searchExternalFragranceDatabase(searchTerm: string): Promise<any[]> {
  try {
    console.log(`🔍 External search: searching for "${searchTerm}"`);

    // First try RapidAPI
    const { fragranceAPI } = await import('../services/fragranceAPI');

    let apiResults: any[] = [];

    // OPTION 1: RapidAPI (Now working with /perfumes/search endpoint!)
    try {
      console.log(`🔍 Trying RapidAPI for "${searchTerm}"`);
      apiResults = await fragranceAPI.searchFragrances(searchTerm);
      console.log(`🔍 RapidAPI main search: ${apiResults.length} results`);

      // If no results, try alternative API
      if (apiResults.length === 0) {
        apiResults = await fragranceAPI.searchAlternativeAPI(searchTerm);
        console.log(`🔍 RapidAPI alternative search: ${apiResults.length} results`);
      }
    } catch (apiError) {
      console.error('RapidAPI search failed:', apiError);
    }

    // OPTION 2: Fragrantica scraper (backup)
    if (apiResults.length === 0) {
      try {
        console.log(`🕷️ RapidAPI failed, trying Fragrantica scraper for "${searchTerm}"`);
        const { fragranceScraper } = await import('../services/fragranceScraper');
        const scrapedResults = await fragranceScraper.searchFragrantica(searchTerm);

        if (scrapedResults.length > 0) {
          console.log(`🕷️ Fragrantica scraper results: ${scrapedResults.length}`);
          apiResults = scrapedResults;
        }
      } catch (scraperError) {
        console.error('Fragrantica scraper failed:', scraperError);
      }
    }

    // OPTION 3: Enhanced fallback (always available)
    if (apiResults.length === 0) {
      console.log(`🔍 Using enhanced fallback database for "${searchTerm}"`);
      apiResults = fragranceAPI.getFallbackFragrances(searchTerm);
    }

    console.log(`🔍 Final results: ${apiResults.length}`);

    // If still no results, return empty but log it
    if (apiResults.length === 0) {
      console.log(`🔍 No results found for "${searchTerm}"`);
    }

    // Transform API results to match our format
    return apiResults.map((fragrance: any) => {
      const notes = fragrance.notes || [];
      const notesPerSection = Math.ceil(notes.length / 3);

      return {
        name: fragrance.name,
        brand: fragrance.brand,
        concentration: mapConcentrationFromAPI(fragrance.concentration),
        topNotes: notes.slice(0, notesPerSection),
        middleNotes: notes.slice(notesPerSection, notesPerSection * 2),
        baseNotes: notes.slice(notesPerSection * 2),
        description: fragrance.description || `A ${fragrance.concentration} fragrance from ${fragrance.brand}`,
        imageUrl: null,
        priceCents: fragrance.price ? parsePriceToSents(fragrance.price) : 15000,
        source: "external",
        apiSource: fragrance.source,
        year: fragrance.year,
        rating: fragrance.rating
      };
    });
  } catch (error) {
    console.error('External search error:', error);

    // Final fallback to enhanced data
    const { fragranceAPI } = await import('../services/fragranceAPI');
    const fallbackResults = fragranceAPI.getFallbackFragrances(searchTerm);
    console.log(`🔍 Final fallback: ${fallbackResults.length} results`);

    return fallbackResults.map((fragrance: any) => ({
      name: fragrance.name,
      brand: fragrance.brand,
      concentration: mapConcentrationFromAPI(fragrance.concentration),
      topNotes: fragrance.notes.slice(0, Math.ceil(fragrance.notes.length / 3)),
      middleNotes: fragrance.notes.slice(Math.ceil(fragrance.notes.length / 3), Math.ceil(fragrance.notes.length * 2 / 3)),
      baseNotes: fragrance.notes.slice(Math.ceil(fragrance.notes.length * 2 / 3)),
      description: fragrance.description,
      imageUrl: null,
      priceCents: 15000,
      source: "external",
      apiSource: "fallback",
      year: fragrance.year
    }));
  }
}

// Helper function to map API concentration to our format
function mapConcentrationFromAPI(concentration: string): string {
  const concentrationMap: { [key: string]: string } = {
    'eau_fraiche': 'EDT',
    'eau_de_cologne': 'Cologne',
    'eau_de_toilette': 'EDT',
    'eau_de_parfum': 'EDP',
    'parfum': 'Parfum',
    'EDT': 'EDT',
    'EDP': 'EDP',
    'Parfum': 'Parfum',
    'Cologne': 'Cologne'
  };

  return concentrationMap[concentration] || 'EDT';
}

// Helper function to parse price strings to cents
function parsePriceToSents(priceStr: string): number {
  const match = priceStr.match(/[\d,]+\.?\d*/);
  if (match) {
    const price = parseFloat(match[0].replace(',', ''));
    return Math.round(price * 100); // Convert to cents
  }
  return 15000; // Default price
}

// Smart caching function - automatically save scraped fragrances to database
async function cacheScrapedFragrances(externalResults: any[], searchTerm: string): Promise<void> {
  try {
    for (const fragrance of externalResults) {
      // Check if fragrance already exists in database
      const existing = await FragranceModel.findByNameAndBrand(fragrance.name, fragrance.brand);

      if (!existing) {
        // Map concentration back to database format
            const concentrationMap: { [key: string]: string } = {
      'Cologne': 'Cologne',
      'EDT': 'EDT',
      'EDP': 'EDP',
      'Parfum': 'Parfum'
    };

    const dbConcentration = concentrationMap[fragrance.concentration] || 'EDT';

        // Run AI categorization on scraped fragrance
        const suggestedCategories = await predictFragranceCategories({
          name: fragrance.name,
          brand: fragrance.brand,
          topNotes: fragrance.topNotes || [],
          middleNotes: fragrance.middleNotes || [],
          baseNotes: fragrance.baseNotes || [],
          description: fragrance.description,
          concentration: dbConcentration
        });

        const versatility = calculateVersatility(
          fragrance.topNotes || [],
          fragrance.middleNotes || [],
          fragrance.baseNotes || [],
          suggestedCategories
        );

        // Auto-save to database for future instant access
        await FragranceModel.create({
          name: fragrance.name,
          brand: fragrance.brand,
          concentration: dbConcentration as 'EDT' | 'EDP' | 'Parfum' | 'Cologne',
          topNotes: fragrance.topNotes || [],
          middleNotes: fragrance.middleNotes || [],
          baseNotes: fragrance.baseNotes || [],
          versatility,
          categories: suggestedCategories,
          description: fragrance.description || `A ${fragrance.concentration} fragrance from ${fragrance.brand}`,
          imageUrl: fragrance.imageUrl,
          priceCents: fragrance.priceCents || 0
        });

        console.log(`🎯 Auto-cached: ${fragrance.brand} ${fragrance.name} with categories: ${suggestedCategories.join(', ')}`);
      }
    }
  } catch (error) {
    console.error('Error caching scraped fragrances:', error);
    // Don't throw - caching is a nice-to-have, not essential
  }
}

export default router;
