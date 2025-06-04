export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  versatility: number; // 1-5 scale
  categories: FragranceCategory[];
  description?: string;
  imageUrl?: string;
  price?: number;
  concentration?: 'EDT' | 'EDP' | 'Parfum' | 'Cologne';
}

export type FragranceCategory =
  | 'daily_driver'
  | 'college'
  | 'summer'
  | 'office'
  | 'club'
  | 'date'
  | 'signature'
  | 'winter'
  | 'special';

export interface CategoryBattle {
  category: FragranceCategory;
  title: string;
  purpose: string;
  examples: string;
  instruction: string;
  maxSelections: number;
  fragrances: Fragrance[];
}

export interface TestResult {
  id: string;
  userId: string;
  category: FragranceCategory;
  selectedFragrances: string[]; // fragrance IDs
  timestamp: Date;
  isBlindTest: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  preferences?: {
    favoriteNotes: string[];
    dislikedNotes: string[];
    preferredBrands: string[];
    budgetRange?: [number, number];
  };
  testResults: TestResult[];
  createdAt: Date;
}

export interface AIRecommendation {
  fragrances: Fragrance[];
  reasoning: string;
  confidence: number;
  category?: FragranceCategory;
}
