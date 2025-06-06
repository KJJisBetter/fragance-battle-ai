import axios from 'axios';

export interface APIFragrance {
  name: string;
  brand: string;
  notes: string[];
  concentration: string;
  year?: number;
  description?: string;
  price?: string;
  rating?: number;
  source: 'rapidapi';
  imageUrl?: string;
}

class FragranceAPIService {
  private rapidAPIKey: string;
  private rapidAPIHost: string;

  constructor() {
    // Updated working API key and host
    this.rapidAPIKey = 'f1de923b71msh9159e95206a9c58p106ec3jsn8843bd2b9972';
    this.rapidAPIHost = 'fragrancefinder-api.p.rapidapi.com';
  }

  async searchFragrances(query: string): Promise<APIFragrance[]> {
    try {
      console.log(`🔍 FragranceFinder API: searching for "${query}"`);

      // Use the working /perfumes/search endpoint
      const response = await axios.get(`https://${this.rapidAPIHost}/perfumes/search`, {
        params: {
          q: query
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': this.rapidAPIHost,
        },
        timeout: 10000,
      });

      console.log(`🔍 FragranceFinder API raw response structure:`, {
        isArray: Array.isArray(response.data),
        hasHits: !!response.data?.hits,
        dataKeys: response.data ? Object.keys(response.data) : [],
        length: response.data?.length || response.data?.hits?.length || 0
      });

      // Handle different response structures
      let resultsArray = [];
      if (Array.isArray(response.data)) {
        // Direct array response (current API format)
        resultsArray = response.data;
      } else if (response.data?.hits && Array.isArray(response.data.hits)) {
        // Wrapped in hits object (your example format)
        resultsArray = response.data.hits;
      } else {
        resultsArray = [];
      }

      console.log(`🔍 FragranceFinder API returned: ${resultsArray.length} results`);

      return this.transformFragranceFinderResults(resultsArray);
    } catch (error) {
      console.error('FragranceFinder API search error:', error);
      return [];
    }
  }

  async searchSimilarFragrances(fragranceName: string): Promise<APIFragrance[]> {
    try {
      console.log(`🔍 FragranceFinder API: finding similar to "${fragranceName}"`);

      // Try the dupes/similarity endpoint (might need specific fragrance ID)
      const response = await axios.get(`https://${this.rapidAPIHost}/similar`, {
        params: {
          keyword: fragranceName,
          perPage: 5
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': this.rapidAPIHost,
        },
        timeout: 10000,
      });

      console.log(`🔍 Similar fragrances API returned: ${response.data?.length || 0} results`);

      return this.transformFragranceFinderResults(response.data || []);
    } catch (error) {
      console.error('FragranceFinder similarity API error:', error);
      return [];
    }
  }

  async searchAlternativeAPI(query: string): Promise<APIFragrance[]> {
    try {
      // Try different search approaches
      console.log(`🔍 Trying alternative search approaches for "${query}"`);

      // Try searching by brand
      const brandResponse = await axios.get(`https://${this.rapidAPIHost}/search`, {
        params: {
          keyword: query,
          perPage: 5,
          page: 1
        },
        headers: {
          'X-RapidAPI-Key': this.rapidAPIKey,
          'X-RapidAPI-Host': this.rapidAPIHost,
        },
        timeout: 8000,
      });

      if (brandResponse.data && brandResponse.data.length > 0) {
        console.log(`🔍 Alternative search found: ${brandResponse.data.length} results`);
        return this.transformFragranceFinderResults(brandResponse.data);
      }

      return [];
    } catch (error) {
      console.error('Alternative FragranceFinder API search error:', error);
      return [];
    }
  }

  // Transform results from FragranceFinder API
  private transformFragranceFinderResults(results: any[]): APIFragrance[] {
    if (!Array.isArray(results)) {
      console.log('🔍 API returned non-array data, attempting to extract...');
      // Handle case where API returns an object instead of array
      if (results && typeof results === 'object') {
        const possibleArrays = Object.values(results).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          results = possibleArrays[0] as any[];
        } else {
          results = [results]; // Wrap single object in array
        }
      } else {
        return [];
      }
    }

        return results.map(item => {
      console.log('🔍 Processing fragrance item keys:', Object.keys(item));

      // Extract clean fragrance name from "perfume" field
      let name = item.perfume || item.name || item.title || 'Unknown';
      if (name && name !== 'Unknown') {
        // Clean up name - remove any formatting artifacts
        name = name.replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes
        name = name.replace(/\s+/g, ' ').trim(); // Normalize whitespace
      }

      // Extract clean brand name
      let brand = item.brand || item.house || item.brand_name || '';
      if (brand) {
        // Clean up brand name: "molton brown perfumes and colognes" -> "Molton Brown"
        brand = brand.replace(/\s*perfumes?\s*and\s*colognes?\s*/i, '').trim();
        brand = brand.replace(/\s*perfumes?\s*/i, '').trim();
        brand = brand.replace(/\s*fragrances?\s*/i, '').trim();

        // Normalize brand name - handle known brands properly
        if (brand.toLowerCase().includes('molton brown')) {
          brand = 'Molton Brown';
        } else if (brand.toLowerCase().includes('e. coudray')) {
          brand = 'E. Coudray';
        } else if (brand.toLowerCase().includes('perris monte carlo')) {
          brand = 'Perris Monte Carlo';
        } else {
          // General normalization
          brand = brand.split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
      }

      // Extract year from description (current API format)
      let year = this.extractYear(item.description || '');

      // Extract notes - current API format has direct notes array
      const notes = this.extractNotesFromCurrentAPI(item);

      // Extract accords
      const accords = item.accords || [];

      // Build descriptive text based on notes and accords
      let description = this.buildDescriptionFromAPI(name, brand, notes, accords, year, item.description);

      // Extract image URL
      let imageUrl = item.image || undefined;

      const result = {
        name: name,
        brand: brand,
        notes: notes,
        concentration: this.extractConcentration(item),
        year: year,
        description: description,
        price: item.price || undefined,
        rating: item.rating || item.score || item._score || undefined,
        imageUrl: imageUrl,
        source: 'rapidapi' as const,
      };

      console.log('🔍 Transformed result:', {
        name: result.name,
        brand: result.brand,
        notes: result.notes.length,
        year: result.year
      });
      return result;
    });
  }

  private extractNotesFromAPI(item: any): string[] {
    // Try to extract notes from various possible fields
    if (item.notes && Array.isArray(item.notes)) return item.notes;
    if (item.top_notes || item.middle_notes || item.base_notes) {
      return [
        ...(item.top_notes || []),
        ...(item.middle_notes || []),
        ...(item.base_notes || [])
      ];
    }
    if (item.accords && Array.isArray(item.accords)) return item.accords;
    if (item.ingredients && Array.isArray(item.ingredients)) return item.ingredients;

    // Extract from description
    return this.extractNotes(item.description || '');
  }

  private extractNotesFromNewAPI(item: any): string[] {
    const allNotes: string[] = [];

    // Handle the new structured notes format
    if (item.notes) {
      if (Array.isArray(item.notes)) {
        // Simple array format
        allNotes.push(...item.notes);
      } else if (typeof item.notes === 'object') {
        // Structured format with top, middle, base
        const notesObj = item.notes;
        if (notesObj.top && Array.isArray(notesObj.top)) {
          allNotes.push(...notesObj.top);
        }
        if (notesObj.middle && Array.isArray(notesObj.middle)) {
          allNotes.push(...notesObj.middle);
        }
        if (notesObj.base && Array.isArray(notesObj.base)) {
          allNotes.push(...notesObj.base);
        }
      }
    }

    // Also include main accords as they provide additional scent information
    if (item.main_accords && Array.isArray(item.main_accords)) {
      allNotes.push(...item.main_accords);
    }

    // Remove duplicates and filter out empty values
    const uniqueNotes = [...new Set(allNotes.filter(note => note && note.trim()))];

    // If no notes found, try the legacy method
    if (uniqueNotes.length === 0) {
      return this.extractNotesFromAPI(item);
    }

    return uniqueNotes;
  }

  private extractNotesFromCurrentAPI(item: any): string[] {
    // Current API format has a direct notes array
    if (item.notes && Array.isArray(item.notes)) {
      return item.notes.filter((note: any) => note && note.trim());
    }

    // Fallback to accords if no notes
    if (item.accords && Array.isArray(item.accords)) {
      return item.accords.filter((accord: any) => accord && accord.trim());
    }

    // Last fallback - extract from description
    return this.extractNotes(item.description || '');
  }

  private buildDescription(name: string, brand: string, notes: string[], accords: string[], year?: number): string {
    // Build a rich description based on available data
    let description = `${name} by ${brand}`;

    if (year) {
      description += ` (${year})`;
    }

    // Add fragrance family/accord information
    if (accords && accords.length > 0) {
      const primaryAccord = accords[0];
      description += ` - A ${primaryAccord} fragrance`;
    }

    // Add key notes
    if (notes && notes.length > 0) {
      const topNotes = notes.slice(0, 3); // Show first 3 notes
      description += ` featuring ${topNotes.join(', ').toLowerCase()}`;
    }

    return description;
  }

  private buildDescriptionFromAPI(name: string, brand: string, notes: string[], accords: string[], year?: number, originalDescription?: string): string {
    // For current API, we have rich descriptions already, but clean them up
    if (originalDescription) {
      // Clean up the existing description
      let cleanDesc = originalDescription.replace(/^.*? by .*? is a /, '');
      cleanDesc = cleanDesc.replace(/ fragrance for (women|men|women and men)\..*$/, '');
      cleanDesc = cleanDesc.replace(/\. Top notes are.*$/, '');

      if (cleanDesc.length > 10) {
        return `${name} by ${brand}${year ? ` (${year})` : ''} - ${cleanDesc}`;
      }
    }

    // Fallback to building our own description
    return this.buildDescription(name, brand, notes, accords, year);
  }

  private extractConcentration(item: any): string {
    const concentration = item.concentration || item.type || item.strength || '';
    return this.guessConcentration(concentration + ' ' + (item.name || ''));
  }

  private extractBrand(title: string): string {
    // Extract brand from title (first word or known brands)
    const knownBrands = [
      'Dior', 'Chanel', 'Creed', 'Tom Ford', 'Parfums de Marly',
      'Yves Saint Laurent', 'Giorgio Armani', 'Lancôme', 'Versace',
      'Dolce & Gabbana', 'Calvin Klein', 'Hugo Boss'
    ];

    for (const brand of knownBrands) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }

    return title.split(' ')[0] || 'Unknown';
  }

  private extractNotes(description: string): string[] {
    // Extract fragrance notes from description
    const noteKeywords = [
      'bergamot', 'lemon', 'lime', 'orange', 'grapefruit', 'mandarin',
      'lavender', 'rose', 'jasmine', 'lily', 'violet', 'iris',
      'vanilla', 'musk', 'amber', 'sandalwood', 'cedar', 'oud',
      'pepper', 'cardamom', 'cinnamon', 'nutmeg', 'ginger'
    ];

    const foundNotes = noteKeywords.filter(note =>
      description.toLowerCase().includes(note)
    );

    return foundNotes.length > 0 ? foundNotes : ['Fresh', 'Aromatic'];
  }

  private guessConcentration(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('parfum') && !lower.includes('eau')) return 'Parfum';
    if (lower.includes('edp') || lower.includes('eau de parfum')) return 'EDP';
    if (lower.includes('edt') || lower.includes('eau de toilette')) return 'EDT';
    if (lower.includes('cologne')) return 'Cologne';
    return 'EDT'; // Default
  }

  private extractYear(text: string): number | undefined {
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? parseInt(yearMatch[0]) : undefined;
  }

  // Helper function to convert old concentration format to new
  private convertConcentration(oldConcentration: string): string {
    const concentrationMap: { [key: string]: string } = {
      'eau_fraiche': 'EDT',
      'eau_de_cologne': 'Cologne',
      'eau_de_toilette': 'EDT',
      'eau_de_parfum': 'EDP',
      'parfum': 'Parfum'
    };
    return concentrationMap[oldConcentration] || 'EDT';
  }

  // Fallback search with enhanced data including Parfum de Marly
  getFallbackFragrances(query: string): APIFragrance[] {
    const enhanced_fallback: APIFragrance[] = [
      // Parfum de Marly Collection
      {
        name: 'Layton',
        brand: 'Parfums de Marly',
        notes: ['Apple', 'Bergamot', 'Lavender', 'Geranium', 'Jasmine', 'Vanilla', 'Musk'],
        concentration: 'eau_de_parfum',
        year: 2016,
        description: 'A sophisticated aromatic fragrance with apple and lavender.',
        source: 'rapidapi'
      },
      {
        name: 'Pegasus',
        brand: 'Parfums de Marly',
        notes: ['Bergamot', 'Heliotrope', 'Bitter Almond', 'Jasmine', 'Vanilla', 'Sandalwood'],
        concentration: 'eau_de_parfum',
        year: 2011,
        description: 'A sweet and powdery fragrance with almond and vanilla.',
        source: 'rapidapi'
      },
      {
        name: 'Herod',
        brand: 'Parfums de Marly',
        notes: ['Cinnamon', 'Pepper', 'Osmanthus', 'Tobacco', 'Vanilla', 'Cypriol'],
        concentration: 'eau_de_parfum',
        year: 2012,
        description: 'A warm spicy fragrance with tobacco and vanilla.',
        source: 'rapidapi'
      },
      {
        name: 'Sedley',
        brand: 'Parfums de Marly',
        notes: ['Bergamot', 'Spearmint', 'Watery Notes', 'Lavender', 'Geranium', 'Sandalwood'],
        concentration: 'eau_de_parfum',
        year: 2019,
        description: 'A fresh aquatic fragrance with mint and marine notes.',
        source: 'rapidapi'
      },
      {
        name: 'Carlisle',
        brand: 'Parfums de Marly',
        notes: ['Bergamot', 'Nutmeg', 'Rose', 'Patchouli', 'Vanilla', 'Oud'],
        concentration: 'eau_de_parfum',
        year: 2015,
        description: 'A rich oriental fragrance with rose and oud.',
        source: 'rapidapi'
      },
      // Creed Collection
      {
        name: 'Aventus',
        brand: 'Creed',
        notes: ['Pineapple', 'Blackcurrant', 'Apple', 'Birch', 'Musk', 'Oakmoss', 'Ambergris'],
        concentration: 'eau_de_parfum',
        year: 2010,
        description: 'A sophisticated fragrance celebrating strength and success.',
        source: 'rapidapi'
      },
      {
        name: 'Green Irish Tweed',
        brand: 'Creed',
        notes: ['Lemon Verbena', 'Violet Leaves', 'Iris', 'Sandalwood', 'Ambergris'],
        concentration: 'eau_de_parfum',
        year: 1985,
        description: 'A fresh and sporty fragrance inspired by the Irish countryside.',
        source: 'rapidapi'
      },
      {
        name: 'Silver Mountain Water',
        brand: 'Creed',
        notes: ['Bergamot', 'Mandarin', 'Neroli', 'Green Tea', 'Blackcurrant', 'Musk'],
        concentration: 'eau_de_parfum',
        year: 1995,
        description: 'A crisp and invigorating unisex fragrance.',
        source: 'rapidapi'
      },
      // Dior Collection
      {
        name: 'Sauvage',
        brand: 'Dior',
        notes: ['Bergamot', 'Pepper', 'Ambroxan', 'Cedar'],
        concentration: 'eau_de_toilette',
        year: 2015,
        description: 'A fresh and raw fragrance with Calabrian bergamot.',
        source: 'rapidapi'
      },
      {
        name: 'Sauvage Elixir',
        brand: 'Dior',
        notes: ['Cinnamon', 'Nutmeg', 'Cardamom', 'Licorice', 'Sandalwood', 'Amber'],
        concentration: 'parfum',
        year: 2021,
        description: 'An intense and powerful concentration of Sauvage.',
        source: 'rapidapi'
      },
      {
        name: 'Homme Intense',
        brand: 'Dior',
        notes: ['Lavender', 'Ambergris', 'Cedar', 'Iris', 'Vanilla', 'Leather'],
        concentration: 'eau_de_parfum',
        year: 2011,
        description: 'A sophisticated and intense masculine fragrance.',
        source: 'rapidapi'
      },
      // Chanel Collection
      {
        name: 'Bleu de Chanel',
        brand: 'Chanel',
        notes: ['Lemon', 'Bergamot', 'Pink Pepper', 'Cedar', 'Sandalwood'],
        concentration: 'eau_de_parfum',
        year: 2010,
        description: 'An aromatic-woody fragrance that embodies freedom.',
        source: 'rapidapi'
      },
      {
        name: 'Allure Homme Sport',
        brand: 'Chanel',
        notes: ['Orange', 'Neroli', 'Cedar', 'Tonka Bean', 'White Musk'],
        concentration: 'eau_de_toilette',
        year: 2004,
        description: 'A fresh and energetic fragrance for the modern man.',
        source: 'rapidapi'
      },
      // Tom Ford Collection
      {
        name: 'Oud Wood',
        brand: 'Tom Ford',
        notes: ['Oud', 'Rosewood', 'Cardamom', 'Sandalwood', 'Vanilla'],
        concentration: 'eau_de_parfum',
        year: 2007,
        description: 'A smooth and smoky oud fragrance.',
        source: 'rapidapi'
      },
      {
        name: 'Tobacco Vanille',
        brand: 'Tom Ford',
        notes: ['Tobacco Leaf', 'Vanilla', 'Tonka Bean', 'Cocoa', 'Ginger'],
        concentration: 'eau_de_parfum',
        year: 2007,
        description: 'A warm and spicy tobacco fragrance.',
        source: 'rapidapi'
      },
      {
        name: 'Lost Cherry',
        brand: 'Tom Ford',
        notes: ['Cherry', 'Liqueur', 'Bitter Almond', 'Turkish Rose', 'Jasmine Sambac'],
        concentration: 'eau_de_parfum',
        year: 2018,
        description: 'A tempting and intoxicating cherry fragrance.',
        source: 'rapidapi'
      },
      // YSL Collection
      {
        name: 'La Nuit de L\'Homme',
        brand: 'Yves Saint Laurent',
        notes: ['Cardamom', 'Bergamot', 'Cedar', 'Coumarin', 'Vetiver'],
        concentration: 'eau_de_toilette',
        year: 2009,
        description: 'A sophisticated oriental-woody fragrance.',
        source: 'rapidapi'
      },
      {
        name: 'Y EDP',
        brand: 'Yves Saint Laurent',
        notes: ['Apple', 'Ginger', 'Bergamot', 'Sage', 'Geranium', 'Amberwood'],
        concentration: 'eau_de_parfum',
        year: 2018,
        description: 'A fresh and woody fragrance for the modern man.',
        source: 'rapidapi'
      },
      // Armani Collection
      {
        name: 'Acqua di Gio Profumo',
        brand: 'Giorgio Armani',
        notes: ['Bergamot', 'Geranium', 'Sage', 'Rosemary', 'Patchouli', 'Incense'],
        concentration: 'eau_de_parfum',
        year: 2015,
        description: 'An intense and sophisticated aquatic fragrance.',
        source: 'rapidapi'
      },
      {
        name: 'Code Absolu',
        brand: 'Giorgio Armani',
        notes: ['Apple', 'Mandarin', 'Nutmeg', 'Orange Blossom', 'Suede', 'Tonka Bean'],
        concentration: 'parfum',
        year: 2019,
        description: 'A luxurious and addictive masculine fragrance.',
        source: 'rapidapi'
      }
    ];

    const lowerQuery = query.toLowerCase();
    return enhanced_fallback
      .filter(fragrance =>
        fragrance.name.toLowerCase().includes(lowerQuery) ||
        fragrance.brand.toLowerCase().includes(lowerQuery)
      )
      .map(fragrance => ({
        ...fragrance,
        concentration: this.convertConcentration(fragrance.concentration)
      }));
  }
}

export const fragranceAPI = new FragranceAPIService();
