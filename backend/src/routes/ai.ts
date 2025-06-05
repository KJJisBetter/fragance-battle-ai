import express from 'express';
import { generateFragranceRecommendation } from '../config/openai';
import { FragranceModel } from '../models/Fragrance';
import { TestResultModel } from '../models/TestResult';
import { query } from '../config/database';
import { auth } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// POST /api/ai/recommendations - Generate AI recommendations
router.post('/recommendations', auth, async (req, res, next) => {
  try {
    const { category } = req.body;
    const userId = (req as any).user.id;

    if (!category) {
      throw createError('Category is required', 400);
    }

    // Get user's test history
    const sessions = await TestResultModel.getUserSessions(userId);
    const userPreferences = await getUserPreferences(userId);

    // Get available fragrances for the category
    const availableFragrances = await FragranceModel.findByCategory(category);

    // Generate AI recommendation
    const recommendation = await generateFragranceRecommendation(
      {
        testHistory: sessions,
        preferences: userPreferences
      },
      category,
      availableFragrances
    );

    // Save recommendation to database
    await query(`
      INSERT INTO ai_recommendations (user_id, category, reasoning, confidence)
      VALUES ($1, $2, $3, $4)
    `, [userId, category, recommendation, 0.8]);

    res.json({
      category,
      recommendation,
      confidence: 0.8,
      availableFragrances
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/recommendations/:userId - Get user's AI recommendations
router.get('/recommendations/:userId', auth, async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own recommendations
    if ((req as any).user.id !== userId) {
      throw createError('Access denied', 403);
    }

    const result = await query(`
      SELECT * FROM ai_recommendations
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/analyze-preferences - Analyze user preferences from test results
router.post('/analyze-preferences', auth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;

    // Get user's test sessions and results
    const sessions = await TestResultModel.getUserSessions(userId);
    const allResults = [];

    for (const session of sessions) {
      const results = await TestResultModel.getSessionResults(session.id);
      allResults.push(...results);
    }

    if (allResults.length === 0) {
      throw createError('No test results found for analysis', 404);
    }

    // Analyze fragrance preferences
    const selectedFragranceIds = allResults.flatMap(result => result.selectedFragrances);
    const selectedFragrances = await FragranceModel.findByIds(selectedFragranceIds);

    // Extract patterns
    const brandFrequency: { [key: string]: number } = {};
    const noteFrequency: { [key: string]: number } = {};
    const categoryFrequency: { [key: string]: number } = {};

    selectedFragrances.forEach(fragrance => {
      // Count brands
      brandFrequency[fragrance.brand] = (brandFrequency[fragrance.brand] || 0) + 1;

      // Count notes
      [...fragrance.topNotes, ...fragrance.middleNotes, ...fragrance.baseNotes].forEach(note => {
        noteFrequency[note] = (noteFrequency[note] || 0) + 1;
      });

      // Count categories
      fragrance.categories.forEach(category => {
        categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
      });
    });

    // Generate insights
    const insights = {
      favoriteNotes: Object.entries(noteFrequency)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([note]) => note),

      preferredBrands: Object.entries(brandFrequency)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([brand]) => brand),

      categoryPreferences: Object.entries(categoryFrequency)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .map(([category, count]) => ({ category, count })),

      averageVersatility: selectedFragrances.reduce((sum, f) => sum + f.versatility, 0) / selectedFragrances.length,

      totalTests: allResults.length,
      totalFragrancesTested: selectedFragranceIds.length
    };

    res.json(insights);
  } catch (error) {
    next(error);
  }
});

async function getUserPreferences(userId: string) {
  const result = await query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
}

export default router;
