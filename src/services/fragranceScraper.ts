import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedFragrance {
  name: string;
  brand: string;
  notes: string[];
  concentration: string;
  year?: number;
  description?: string;
  source: 'fragrantica' | 'parfumo';
}

class FragranceScraper {
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async searchFragrantica(query: string): Promise<ScrapedFragrance[]> {
    try {
      // Add delay to be respectful to the server
      await this.delay(1000);

      // Search Fragrantica
      const searchUrl = `https://www.fragrantica.com/search/`;
      const response = await axios.post(searchUrl,
        `search_query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 10000
        }
      );

      const $ = cheerio.load(response.data);
      const results: ScrapedFragrance[] = [];

      // Parse search results
      $('.searched-element').each((index, element) => {
        if (index >= 10) return; // Limit to first 10 results

        const $element = $(element);
        const nameElement = $element.find('.searched-perfume-name a');
        const brandElement = $element.find('.searched-perfume-brand');

        const name = nameElement.text().trim();
        const brand = brandElement.text().trim();

        if (name && brand) {
          // Extract year from name if present (e.g., "Sauvage (2015)")
          const yearMatch = name.match(/\((\d{4})\)/);
          const cleanName = name.replace(/\(\d{4}\)/, '').trim();
          const year = yearMatch ? parseInt(yearMatch[1]) : undefined;

          results.push({
            name: cleanName,
            brand,
            notes: [], // Will be filled when scraping individual pages
            concentration: 'eau_de_toilette', // Default, will be updated
            year,
            source: 'fragrantica'
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Fragrantica scraping error:', error);
      return [];
    }
  }

  async searchParfumo(query: string): Promise<ScrapedFragrance[]> {
    try {
      await this.delay(1000);

      // Search Parfumo
      const searchUrl = `https://www.parfumo.com/search`;
      const response = await axios.get(searchUrl, {
        params: { q: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const results: ScrapedFragrance[] = [];

      // Parse Parfumo results (adjust selectors based on actual HTML structure)
      $('.search-result-item').each((index, element) => {
        if (index >= 10) return;

        const $element = $(element);
        const name = $element.find('.perfume-name').text().trim();
        const brand = $element.find('.brand-name').text().trim();

        if (name && brand) {
          results.push({
            name,
            brand,
            notes: [],
            concentration: 'eau_de_toilette',
            source: 'parfumo'
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Parfumo scraping error:', error);
      return [];
    }
  }

  async searchAll(query: string): Promise<ScrapedFragrance[]> {
    try {
      // Try Fragrantica first (more comprehensive)
      const fragranticaResults = await this.searchFragrantica(query);

      if (fragranticaResults.length > 0) {
        return fragranticaResults;
      }

      // Fallback to Parfumo if Fragrantica fails
      const parfumoResults = await this.searchParfumo(query);
      return parfumoResults;

    } catch (error) {
      console.error('All scraping failed:', error);
      return this.getFallbackResults(query);
    }
  }

  private getFallbackResults(query: string): ScrapedFragrance[] {
    // Enhanced fallback with more popular fragrances
    const fallbackData: ScrapedFragrance[] = [
      {
        name: 'Sauvage',
        brand: 'Dior',
        notes: ['Bergamot', 'Pepper', 'Ambroxan', 'Cedar'],
        concentration: 'eau_de_toilette',
        year: 2015,
        description: 'A fresh and raw fragrance with Calabrian bergamot and Ambroxan.',
        source: 'fragrantica'
      },
      {
        name: 'Bleu de Chanel',
        brand: 'Chanel',
        notes: ['Lemon', 'Bergamot', 'Pink Pepper', 'Cedar', 'Sandalwood'],
        concentration: 'eau_de_parfum',
        year: 2010,
        description: 'An aromatic-woody fragrance that embodies freedom.',
        source: 'fragrantica'
      },
      {
        name: 'Aventus',
        brand: 'Creed',
        notes: ['Pineapple', 'Blackcurrant', 'Apple', 'Birch', 'Musk'],
        concentration: 'eau_de_parfum',
        year: 2010,
        description: 'A sophisticated fragrance celebrating strength and success.',
        source: 'fragrantica'
      },
      {
        name: 'La Vie Est Belle',
        brand: 'Lancôme',
        notes: ['Blackcurrant', 'Pear', 'Iris', 'Jasmine', 'Vanilla'],
        concentration: 'eau_de_parfum',
        year: 2012,
        description: 'A feminine gourmand fragrance about happiness.',
        source: 'fragrantica'
      },
      {
        name: 'Acqua di Gio',
        brand: 'Giorgio Armani',
        notes: ['Lime', 'Jasmine', 'Cedar', 'Musk'],
        concentration: 'eau_de_toilette',
        year: 1996,
        description: 'An aquatic fragrance inspired by the sea.',
        source: 'fragrantica'
      },
      {
        name: 'Black Opium',
        brand: 'Yves Saint Laurent',
        notes: ['Pink Pepper', 'Orange Blossom', 'Coffee', 'Vanilla', 'White Musk'],
        concentration: 'eau_de_parfum',
        year: 2014,
        description: 'An addictive gourmand fragrance with coffee and vanilla.',
        source: 'fragrantica'
      },
      {
        name: 'Tom Ford Oud Wood',
        brand: 'Tom Ford',
        notes: ['Oud', 'Rosewood', 'Cardamom', 'Sandalwood', 'Vanilla'],
        concentration: 'eau_de_parfum',
        year: 2007,
        description: 'A smooth and smoky oud fragrance.',
        source: 'fragrantica'
      },
      {
        name: 'Good Girl',
        brand: 'Carolina Herrera',
        notes: ['Almond', 'Coffee', 'Tuberose', 'Jasmine', 'Cacao'],
        concentration: 'eau_de_parfum',
        year: 2016,
        description: 'A bold fragrance representing the duality of modern women.',
        source: 'fragrantica'
      }
    ];

    // Filter based on query
    const lowerQuery = query.toLowerCase();
    return fallbackData.filter(fragrance =>
      fragrance.name.toLowerCase().includes(lowerQuery) ||
      fragrance.brand.toLowerCase().includes(lowerQuery)
    );
  }
}

export const fragranceScraper = new FragranceScraper();
