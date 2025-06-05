import { pool, query } from '../config/database';
import { logger } from '../utils/logger';

const sampleFragrances = [
  {
    name: 'Sauvage EDP',
    brand: 'Dior',
    concentration: 'eau_de_parfum',
    topNotes: ['Bergamot', 'Pink Pepper'],
    middleNotes: ['Lavender', 'Star Anise', 'Nutmeg'],
    baseNotes: ['Ambroxan', 'Vanilla'],
    versatility: 5,
    categories: ['daily_driver', 'office', 'formal', 'special_occasion'],
    description: 'A fresh and woody fragrance with remarkable longevity',
    priceCents: 15000
  },
  {
    name: 'Light Blue',
    brand: 'Dolce & Gabbana',
    concentration: 'eau_de_toilette',
    topNotes: ['Bergamot', 'Apple', 'Cedar'],
    middleNotes: ['Bamboo', 'Jasmine', 'White Rose'],
    baseNotes: ['Cedar', 'Musk', 'Amber'],
    versatility: 4,
    categories: ['daily_driver', 'summer', 'casual'],
    description: 'Fresh, fruity, and floral - perfect for everyday wear',
    priceCents: 8500
  },
  {
    name: 'Versace Eros',
    brand: 'Versace',
    concentration: 'eau_de_toilette',
    topNotes: ['Mint', 'Green Apple', 'Lemon'],
    middleNotes: ['Tonka Bean', 'Geranium'],
    baseNotes: ['Vanilla', 'Vetiver', 'Oakmoss', 'Cedar'],
    versatility: 3,
    categories: ['date_night', 'special_occasion'],
    description: 'Bold and seductive fragrance for night occasions',
    priceCents: 9500
  },
  {
    name: 'Bleu de Chanel EDP',
    brand: 'Chanel',
    concentration: 'eau_de_parfum',
    topNotes: ['Citrus', 'Mint'],
    middleNotes: ['Pink Pepper', 'Ginger', 'Nutmeg', 'Jasmine'],
    baseNotes: ['Cedar', 'Sandalwood', 'Amber'],
    versatility: 5,
    categories: ['office', 'formal', 'special_occasion'],
    description: 'Sophisticated and timeless, perfect for professionals',
    priceCents: 18000
  },
  {
    name: 'Y EDT',
    brand: 'Yves Saint Laurent',
    concentration: 'eau_de_toilette',
    topNotes: ['Bergamot', 'Ginger'],
    middleNotes: ['Sage', 'Geranium'],
    baseNotes: ['Balsam Fir', 'Cedar', 'Amberwood'],
    versatility: 4,
    categories: ['daily_driver', 'date_night'],
    description: 'Fresh and modern fragrance for the confident man',
    priceCents: 11000
  },
  {
    name: 'Acqua di Gio',
    brand: 'Giorgio Armani',
    concentration: 'eau_de_toilette',
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
    concentration: 'eau_de_parfum',
    topNotes: ['Grapefruit', 'Coriander'],
    middleNotes: ['Cardamom', 'Ginger', 'Orange Blossom'],
    baseNotes: ['Tobacco', 'Cedar', 'Amber'],
    versatility: 3,
    categories: ['date_night', 'winter', 'special_occasion'],
    description: 'Warm and spicy, perfect for intimate occasions',
    priceCents: 12500
  },
  {
    name: 'Spicebomb Extreme',
    brand: 'Viktor & Rolf',
    concentration: 'eau_de_parfum',
    topNotes: ['Black Pepper', 'Lavender'],
    middleNotes: ['Caraway', 'Cinnamon'],
    baseNotes: ['Tobacco', 'Vanilla'],
    versatility: 3,
    categories: ['winter', 'special_occasion'],
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
