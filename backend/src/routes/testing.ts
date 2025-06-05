import express from 'express';
import { TestResultModel } from '../models/TestResult';
import { FragranceModel } from '../models/Fragrance';
import { createError } from '../middleware/errorHandler';
import { auth } from '../middleware/auth';

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

export default router;
