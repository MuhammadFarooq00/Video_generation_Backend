import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBeNmz14kvVCdeEH_CWD3XEuAItt_odOj0');
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    maxOutputTokens: 200,
  }, 
});

class KeywordExtractionService {
  constructor() {
    this.stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
      'those', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'shall', 'very', 'really',
      'quite', 'just', 'only', 'also', 'even', 'still', 'yet', 'already',
      'never', 'always', 'often', 'sometimes', 'usually', 'rarely', 'hardly',
      'almost', 'nearly', 'quite', 'rather', 'pretty', 'fairly', 'somewhat',
      'too', 'so', 'such', 'much', 'many', 'more', 'most', 'less', 'least',
      'all', 'every', 'each', 'some', 'any', 'no', 'none', 'both', 'either',
      'neither', 'one', 'two', 'three', 'first', 'second', 'third', 'last',
      'next', 'previous', 'other', 'another', 'same', 'different', 'similar',
      'like', 'unlike', 'as', 'than', 'if', 'unless', 'because', 'since',
      'although', 'though', 'while', 'whereas', 'however', 'therefore',
      'moreover', 'furthermore', 'additionally', 'besides', 'instead',
      'rather', 'preferably', 'especially', 'particularly', 'specifically',
      'generally', 'usually', 'typically', 'normally', 'commonly', 'frequently',
      'occasionally', 'rarely', 'seldom', 'hardly', 'scarcely', 'barely',
      'almost', 'nearly', 'quite', 'rather', 'pretty', 'fairly', 'somewhat',
      'too', 'so', 'such', 'much', 'many', 'more', 'most', 'less', 'least'
    ]);
  }

  // Extract keywords using Gemini AI
  async extractKeywordsWithAI(prompt) {
    try {
      console.log(`🤖 Using AI to extract keywords from: "${prompt}"`);
      
      const extractionPrompt = `Extract the most important keywords from this video prompt for image search: "${prompt}"

Return only the most relevant keywords that would help find appropriate images. Focus on:
- Main subjects/objects
- Actions/verbs
- Visual elements
- Settings/locations
- Mood/atmosphere
- Colors
- Style descriptors

Return keywords separated by commas, maximum 8 keywords. Example: "robot, cyberpunk, cityscape, neon lights, futuristic, walking, urban, technology"`;

      const result = await model.generateContent(extractionPrompt);
      const response = await result.response.text();
      
      console.log(`🔍 AI extracted keywords: ${response}`);
      
      // Parse and clean keywords
      const keywords = response
        .split(',')
        .map(keyword => keyword.trim().toLowerCase())
        .filter(keyword => keyword.length > 2)
        .filter(keyword => !this.stopWords.has(keyword))
        .slice(0, 8); // Limit to 8 keywords
      
      console.log(`✅ Cleaned keywords: ${keywords}`);
      return keywords;
      
    } catch (error) {
      console.error('❌ AI keyword extraction failed:', error);
      return this.extractKeywordsFallback(prompt);
    }
  }

  // Fallback keyword extraction using simple text processing
  extractKeywordsFallback(prompt) {
    console.log(`🔄 Using fallback keyword extraction for: "${prompt}"`);
    
    const words = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.stopWords.has(word))
      .filter(word => !/^\d+$/.test(word)); // Remove pure numbers
    
    // Get unique words and limit to 6
    const uniqueWords = [...new Set(words)];
    const keywords = uniqueWords.slice(0, 6);
    
    console.log(`✅ Fallback keywords: ${keywords}`);
    return keywords;
  }

  // Main keyword extraction method
  async extractKeywords(prompt) {
    try {
      // Try AI extraction first
      const aiKeywords = await this.extractKeywordsWithAI(prompt);
      
      if (aiKeywords && aiKeywords.length > 0) {
        return aiKeywords;
      }
      
      // Fallback to simple extraction
      return this.extractKeywordsFallback(prompt);
      
    } catch (error) {
      console.error('❌ Keyword extraction failed:', error);
      return this.extractKeywordsFallback(prompt);
    }
  }

  // Generate search queries from keywords
  generateSearchQueries(keywords) {
    if (!keywords || keywords.length === 0) {
      return ['technology', 'futuristic', 'city', 'robot']; // Default fallback
    }

    const queries = [];
    
    // Single keyword queries
    keywords.slice(0, 4).forEach(keyword => {
      queries.push(keyword);
    });
    
    // Two-word combinations
    if (keywords.length >= 2) {
      for (let i = 0; i < Math.min(3, keywords.length - 1); i++) {
        queries.push(`${keywords[i]} ${keywords[i + 1]}`);
      }
    }
    
    // Three-word combination if we have enough keywords
    if (keywords.length >= 3) {
      queries.push(`${keywords[0]} ${keywords[1]} ${keywords[2]}`);
    }
    
    // Remove duplicates and limit
    const uniqueQueries = [...new Set(queries)].slice(0, 6);
    
    console.log(`🔍 Generated search queries: ${uniqueQueries}`);
    return uniqueQueries;
  }
}

export default new KeywordExtractionService();
