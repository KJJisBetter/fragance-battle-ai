import express from 'express';
import { FragranceModel } from '../models/Fragrance';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// GET /api/fragrances - Get all fragrances
router.get('/', async (req, res, next) => {
  try {
    const fragrances = await FragranceModel.findAll();
    res.json(fragrances);
  } catch (error) {
    next(error);
  }
});

// GET /api/fragrances/category/:category - Get fragrances by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const fragrances = await FragranceModel.findByCategory(category);
    res.json(fragrances);
  } catch (error) {
    next(error);
  }
});

// GET /api/fragrances/:id - Get specific fragrance
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const fragrance = await FragranceModel.findById(id);

    if (!fragrance) {
      throw createError('Fragrance not found', 404);
    }

    res.json(fragrance);
  } catch (error) {
    next(error);
  }
});

// POST /api/fragrances/batch - Get multiple fragrances by IDs
router.post('/batch', async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      throw createError('IDs must be an array', 400);
    }

    const fragrances = await FragranceModel.findByIds(ids);
    res.json(fragrances);
  } catch (error) {
    next(error);
  }
});

export default router;
