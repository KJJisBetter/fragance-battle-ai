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

      // Use the direct search URL format: https://www.fragrantica.com/search/?query=aventus
      const searchUrl = `https://www.fragrantica.com/search/?query=${encodeURIComponent(query)}`;
      console.log(`🔍 Fragrantica URL: ${searchUrl}`);

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const results: ScrapedFragrance[] = [];

      console.log(`🔍 Fragrantica response status: ${response.status}`);
      console.log(`🔍 Page title: ${$('title').text()}`);

      // Parse search results - try multiple selectors
      const searchSelectors = [
        '.searched-element',
        '.perfume-item',
        '.search-perfume',
        '.cell',
        '.perfume'
      ];

      let elementsFound = false;

      for (const selector of searchSelectors) {
        const elements = $(selector);
        console.log(`🔍 Found ${elements.length} elements with selector: ${selector}`);

        if (elements.length > 0) {
          elementsFound = true;

          elements.each((index, element) => {
            if (index >= 10) return; // Limit to first 10 results

            const $element = $(element);

            // Try multiple ways to extract name and brand
            let name = $element.find('.searched-perfume-name a').text().trim() ||
                      $element.find('a[href*="/perfume/"]').first().text().trim() ||
                      $element.find('.perfume-name').text().trim() ||
                      $element.find('strong').text().trim();

            let brand = $element.find('.searched-perfume-brand').text().trim() ||
                       $element.find('.brand').text().trim() ||
                       $element.find('.perfume-brand').text().trim();

            // If name contains "by" pattern, extract brand from it
            if (name && !brand && name.includes(' by ')) {
              const parts = name.split(' by ');
              if (parts.length === 2) {
                name = parts[0].trim();
                brand = parts[1].trim();
              }
            }

            console.log(`🔍 Extracted: "${name}" by "${brand}"`);

            if (name && brand && name.length > 2 && brand.length > 2) {
              // Extract year from name if present (e.g., "Sauvage (2015)")
              const yearMatch = name.match(/\((\d{4})\)/);
              const cleanName = name.replace(/\(\d{4}\)/, '').trim();
              const year = yearMatch ? parseInt(yearMatch[1]) : undefined;

              // Extract basic notes if available
              const notesText = $element.find('.notes').text() ||
                               $element.find('.perfume-notes').text() ||
                               '';
              const notes = notesText ? notesText.split(',').map(n => n.trim()).filter(n => n.length > 0) : [];

              results.push({
                name: cleanName,
                brand,
                notes: notes.length > 0 ? notes : ['Fresh', 'Aromatic'], // Default notes
                concentration: 'eau_de_toilette', // Default, will be updated
                year,
                description: `${cleanName} by ${brand}${year ? ` (${year})` : ''}`,
                source: 'fragrantica'
              });
            }
          });

          break; // Stop after finding results with one selector
        }
      }

      if (!elementsFound) {
        console.log(`🔍 No search results found on page. HTML preview:`, response.data.substring(0, 500));
      }

      console.log(`🔍 Fragrantica final results: ${results.length}`);
      return results;

    } catch (error: any) {
      console.error('Fragrantica scraping error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
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
      console.log(`🕷️  Scraper.searchAll: "${query}"`);

      // Try Fragrantica first (more comprehensive)
      const fragranticaResults = await this.searchFragrantica(query);
      console.log(`🕷️  Fragrantica results: ${fragranticaResults.length}`);

      if (fragranticaResults.length > 0) {
        return fragranticaResults;
      }

      // Fallback to Parfumo if Fragrantica fails
      const parfumoResults = await this.searchParfumo(query);
      console.log(`🕷️  Parfumo results: ${parfumoResults.length}`);

      if (parfumoResults.length > 0) {
        return parfumoResults;
      }

      // If both fail, use fallback
      console.log(`🕷️  Both scrapers failed, using fallback data for "${query}"`);
      const fallbackResults = this.getFallbackResults(query);
      console.log(`🕷️  Fallback results: ${fallbackResults.length}`);
      return fallbackResults;

    } catch (error) {
      console.error('All scraping failed:', error);
      console.log(`🕷️  Exception thrown, using fallback data for "${query}"`);
      const fallbackResults = this.getFallbackResults(query);
      console.log(`🕷️  Fallback results after exception: ${fallbackResults.length}`);
      return fallbackResults;
    }
  }

  private getFallbackResults(query: string): ScrapedFragrance[] {
    console.log(`🎯 getFallbackResults called with query: "${query}"`);

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
      },
      // Parfum de Marly Collection
      {
        name: 'Layton',
        brand: 'Parfums de Marly',
        notes: ['Apple', 'Bergamot', 'Lavender', 'Geranium', 'Jasmine', 'Vanilla', 'Musk'],
        concentration: 'eau_de_parfum',
        year: 2016,
        description: 'A sophisticated aromatic fragrance with apple and lavender.',
        source: 'fragrantica'
      },
      {
        name: 'Pegasus',
        brand: 'Parfums de Marly',
        notes: ['Bergamot', 'Heliotrope', 'Bitter Almond', 'Jasmine', 'Vanilla', 'Sandalwood'],
        concentration: 'eau_de_parfum',
        year: 2011,
        description: 'A sweet and powdery fragrance with almond and vanilla.',
        source: 'fragrantica'
      },
      {
        name: 'Herod',
        brand: 'Parfums de Marly',
        notes: ['Cinnamon', 'Pepper', 'Osmanthus', 'Tobacco', 'Vanilla', 'Cypriol'],
        concentration: 'eau_de_parfum',
        year: 2012,
        description: 'A warm spicy fragrance with tobacco and vanilla.',
        source: 'fragrantica'
      },
      {
        name: 'Sedley',
        brand: 'Parfums de Marly',
        notes: ['Bergamot', 'Spearmint', 'Watery Notes', 'Lavender', 'Geranium', 'Sandalwood', 'White Musk'],
        concentration: 'eau_de_parfum',
        year: 2019,
        description: 'A fresh aquatic fragrance with mint and marine notes.',
        source: 'fragrantica'
      },
      {
        name: 'Carlisle',
        brand: 'Parfums de Marly',
        notes: ['Bergamot', 'Nutmeg', 'Rose', 'Patchouli', 'Vanilla', 'Oud'],
        concentration: 'eau_de_parfum',
        year: 2015,
        description: 'A rich oriental fragrance with rose and oud.',
        source: 'fragrantica'
      },
      {
        name: 'Percival',
        brand: 'Parfums de Marly',
        notes: ['Bergamot', 'Mandarin', 'Lavender', 'Jasmine', 'Rose', 'Immortelle', 'Vanilla', 'Ambroxan'],
        concentration: 'eau_de_parfum',
        year: 2016,
        description: 'A floral aromatic fragrance with lavender and jasmine.',
        source: 'fragrantica'
      },
      {
        name: 'Galloway',
        brand: 'Parfums de Marly',
        notes: ['Elemi', 'Pink Pepper', 'Saffron', 'Rose', 'Patchouli', 'Oud', 'Sandalwood'],
        concentration: 'eau_de_parfum',
        year: 2014,
        description: 'A spicy oriental fragrance with saffron and oud.',
        source: 'fragrantica'
      }
    ];

    // Filter based on query
    const lowerQuery = query.toLowerCase();
    console.log(`🎯 Filtering with lowerQuery: "${lowerQuery}"`);

    const filtered = fallbackData.filter(fragrance =>
      fragrance.name.toLowerCase().includes(lowerQuery) ||
      fragrance.brand.toLowerCase().includes(lowerQuery)
    );

    console.log(`🎯 Found ${filtered.length} matches from ${fallbackData.length} total fragrances`);

    if (filtered.length > 0) {
      console.log(`🎯 First match: ${filtered[0].brand} - ${filtered[0].name}`);
    }

    return filtered;
  }
}

export const fragranceScraper = new FragranceScraper();
