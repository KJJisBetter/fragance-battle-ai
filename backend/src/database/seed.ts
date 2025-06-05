import { query } from '../config/database';
import logger from '../utils/logger';

const sampleFragrances = [
  {
    name: 'Sauvage EDP',
    brand: 'Dior',
    concentration: 'EDP',
    topNotes: ['Bergamot', 'Pink Pepper'],
    middleNotes: ['Lavender', 'Star Anise', 'Nutmeg'],
    baseNotes: ['Ambroxan', 'Vanilla'],
    versatility: 5,
    categories: ['daily_driver', 'office', 'club', 'signature', 'special'],
    description: 'A fresh and woody fragrance with remarkable longevity',
    priceCents: 15000
  },
  {
    name: 'Light Blue',
    brand: 'Dolce & Gabbana',
    concentration: 'EDT',
    topNotes: ['Bergamot', 'Apple', 'Cedar'],
    middleNotes: ['Bamboo', 'Jasmine', 'White Rose'],
    baseNotes: ['Cedar', 'Musk', 'Amber'],
    versatility: 4,
    categories: ['daily_driver', 'college', 'summer'],
    description: 'Fresh, fruity, and floral - perfect for everyday wear',
    priceCents: 8500
  },
  {
    name: 'Versace Eros',
    brand: 'Versace',
    concentration: 'EDT',
    topNotes: ['Mint', 'Green Apple', 'Lemon'],
    middleNotes: ['Tonka Bean', 'Geranium'],
    baseNotes: ['Vanilla', 'Vetiver', 'Oakmoss', 'Cedar'],
    versatility: 3,
    categories: ['club', 'date'],
    description: 'Bold and seductive fragrance for night occasions',
    priceCents: 9500
  },
  {
    name: 'Bleu de Chanel EDP',
    brand: 'Chanel',
    concentration: 'EDP',
    topNotes: ['Citrus', 'Mint'],
    middleNotes: ['Pink Pepper', 'Ginger', 'Nutmeg', 'Jasmine'],
    baseNotes: ['Cedar', 'Sandalwood', 'Amber'],
    versatility: 5,
    categories: ['office', 'signature', 'special'],
    description: 'Sophisticated and timeless, perfect for professionals',
    priceCents: 18000
  },
  {
    name: 'Y EDT',
    brand: 'Yves Saint Laurent',
    concentration: 'EDT',
    topNotes: ['Bergamot', 'Ginger'],
    middleNotes: ['Sage', 'Geranium'],
    baseNotes: ['Balsam Fir', 'Cedar', 'Amberwood'],
    versatility: 4,
    categories: ['college', 'date'],
    description: 'Fresh and modern fragrance for the confident man',
    priceCents: 11000
  },
  {
    name: 'Acqua di Gio',
    brand: 'Giorgio Armani',
    concentration: 'EDT',
    topNotes: ['Bergamot', 'Neroli', 'Green Tangerine'],
    middleNotes: ['Marine Notes', 'Jasmine', 'Rosemary'],
    baseNotes: ['White Musk', 'Cedar', 'Oakmoss'],
    versatility: 4,
    categories: ['summer', 'daily_driver'],
    description: 'Aquatic and fresh, inspired by the Mediterranean sea',
    priceCents: 9000
  },
  {
    name: 'The One EDP',
    brand: 'Dolce & Gabbana',
    concentration: 'EDP',
    topNotes: ['Grapefruit', 'Coriander'],
    middleNotes: ['Cardamom', 'Ginger', 'Orange Blossom'],
    baseNotes: ['Tobacco', 'Cedar', 'Amber'],
    versatility: 3,
    categories: ['date', 'winter', 'special'],
    description: 'Warm and spicy, perfect for intimate occasions',
    priceCents: 12500
  },
  {
    name: 'Spicebomb Extreme',
    brand: 'Viktor & Rolf',
    concentration: 'EDP',
    topNotes: ['Black Pepper', 'Lavender'],
    middleNotes: ['Caraway', 'Cinnamon'],
    baseNotes: ['Tobacco', 'Vanilla'],
    versatility: 3,
    categories: ['club', 'winter'],
    description: 'Explosive spicy fragrance for cold weather',
    priceCents: 14000
  }
];

export async function seedDatabase(): Promise<void> {
  try {
    logger.info('Starting database seeding...');

    // Clear existing data (optional - be careful in production!)
    await query('TRUNCATE TABLE ai_recommendations, test_results, test_sessions, fragrances, user_preferences, users RESTART IDENTITY CASCADE');

    // Insert sample fragrances
    for (const fragrance of sampleFragrances) {
      await query(`
        INSERT INTO fragrances (
          name, brand, concentration, top_notes, middle_notes, base_notes,
          versatility, categories, description, price_cents
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        fragrance.name,
        fragrance.brand,
        fragrance.concentration,
        fragrance.topNotes,
        fragrance.middleNotes,
        fragrance.baseNotes,
        fragrance.versatility,
        fragrance.categories,
        fragrance.description,
        fragrance.priceCents
      ]);
    }

    logger.info(`Seeded ${sampleFragrances.length} fragrances`);
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding error:', error);
      process.exit(1);
    });
}
