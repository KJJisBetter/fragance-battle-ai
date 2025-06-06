import { query } from '../config/database';

export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  concentration?: 'EDT' | 'EDP' | 'Parfum' | 'Cologne';
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  versatility: number;
  categories: string[];
  description?: string;
  imageUrl?: string;
  priceCents?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class FragranceModel {
  static async findAll(): Promise<Fragrance[]> {
    const result = await query('SELECT * FROM fragrances ORDER BY name');
    return result.rows.map(this.mapDbToFragrance);
  }

  static async findByCategory(category: string): Promise<Fragrance[]> {
    const result = await query(
      'SELECT * FROM fragrances WHERE $1 = ANY(categories) ORDER BY name',
      [category]
    );
    return result.rows.map(this.mapDbToFragrance);
  }

  static async findById(id: string): Promise<Fragrance | null> {
    const result = await query('SELECT * FROM fragrances WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.mapDbToFragrance(result.rows[0]) : null;
  }

  static async findByIds(ids: string[]): Promise<Fragrance[]> {
    const result = await query(
      'SELECT * FROM fragrances WHERE id = ANY($1) ORDER BY name',
      [ids]
    );
    return result.rows.map(this.mapDbToFragrance);
  }

  static async searchFragrances(searchTerm: string): Promise<Fragrance[]> {
    const result = await query(`
      SELECT * FROM fragrances
      WHERE LOWER(name) LIKE $1 OR LOWER(brand) LIKE $1
      ORDER BY
        CASE
          WHEN LOWER(name) = $2 THEN 1
          WHEN LOWER(name) LIKE $3 THEN 2
          WHEN LOWER(brand) = $2 THEN 3
          ELSE 4
        END,
        name
      LIMIT 10
    `, [
      `%${searchTerm}%`,  // $1 - partial match
      searchTerm,         // $2 - exact match
      `${searchTerm}%`    // $3 - starts with
    ]);
    return result.rows.map(this.mapDbToFragrance);
  }

  static async findByNameAndBrand(name: string, brand: string): Promise<Fragrance | null> {
    const result = await query(
      'SELECT * FROM fragrances WHERE LOWER(name) = LOWER($1) AND LOWER(brand) = LOWER($2)',
      [name, brand]
    );
    return result.rows.length > 0 ? this.mapDbToFragrance(result.rows[0]) : null;
  }

  static async create(fragrance: Omit<Fragrance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fragrance> {
    const result = await query(`
      INSERT INTO fragrances (
        name, brand, concentration, top_notes, middle_notes, base_notes,
        versatility, categories, description, image_url, price_cents
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
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
      fragrance.imageUrl,
      fragrance.priceCents
    ]);
    return this.mapDbToFragrance(result.rows[0]);
  }

  private static mapDbToFragrance(row: any): Fragrance {
    // Parse categories from PostgreSQL array format
    let categories: string[] = [];
    if (row.categories) {
      if (Array.isArray(row.categories)) {
        categories = row.categories;
      } else if (typeof row.categories === 'string') {
        // Handle PostgreSQL array string format like "{category1,category2}"
        categories = row.categories
          .replace(/^\{|\}$/g, '') // Remove curly braces
          .split(',')
          .map((cat: string) => cat.trim())
          .filter(Boolean);
      }
    }

    return {
      id: row.id,
      name: row.name,
      brand: row.brand,
      concentration: row.concentration,
      topNotes: row.top_notes || [],
      middleNotes: row.middle_notes || [],
      baseNotes: row.base_notes || [],
      versatility: row.versatility,
      categories,
      description: row.description,
      imageUrl: row.image_url,
      priceCents: row.price_cents,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
