import OpenAI from 'openai';
import { logger } from '../utils/logger';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateFragranceRecommendation = async (
  userPreferences: any,
  category: string,
  existingFragrances: any[]
): Promise<string> => {
  try {
    const prompt = `
You are a fragrance expert AI. Based on the user's preferences and testing history, recommend fragrances for the ${category} category.

User Preferences:
${JSON.stringify(userPreferences, null, 2)}

Available Fragrances:
${JSON.stringify(existingFragrances, null, 2)}

Please provide:
1. Top 3 fragrance recommendations for this category
2. Detailed reasoning for each recommendation
3. How well each matches their preferences (1-10 scale)
4. Any notes about seasonal appropriateness or occasions

Format your response as a structured analysis that's helpful for someone building their fragrance collection.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert fragrance consultant with deep knowledge of perfumery, fragrance notes, and how different scents work for various occasions and preferences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'No recommendation generated';
  } catch (error) {
    logger.error('OpenAI API error:', error);
    throw new Error('Failed to generate recommendation');
  }
};

export default openai;
