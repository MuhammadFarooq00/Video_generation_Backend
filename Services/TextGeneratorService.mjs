import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBeNmz14kvVCdeEH_CWD3XEuAItt_odOj0');
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    maxOutputTokens: 500, // Increased for more detailed responses
  }, 
});

const TextGenerator = async (promptText) => {
    try {
        // Modify the prompt to request a specific format
        const formattedPrompt = `You are a professional video script writer. Create a detailed video script for: "${promptText}"

Write exactly 4 descriptive sentences that can be used as video subtitles. Each sentence should describe a different scene or moment in the video. Make the descriptions vivid, cinematic, and specific. Each sentence should be a complete thought ending with a period. Do not use bullet points, numbers, or special formatting. Just write 4 sentences separated by periods.

Example format:
The video opens with a wide shot of [scene description]. The camera then focuses on [character/object] as [action happens]. In the next scene, [another action] unfolds with [visual details]. Finally, the video concludes with [ending scene description].`;
        
        console.log({ content: formattedPrompt });
        const result = await model.generateContent(formattedPrompt);
        const response = result.response;

        let text = await response.text();
        console.log('🔍 Raw text response:', text);
        
        // Post-processing to ensure the output is correctly formatted
        text = text
            // Remove any markdown or special formatting
            .replace(/[#*_~`]/g, '')
            // Replace multiple spaces with a single space
            .replace(/\s+/g, ' ')
            // Remove bullet points and numbering
            .replace(/[-•*]\s+/g, '')
            .replace(/\d+\.\s+/g, '')
            // Remove line breaks to make it a single paragraph
            .replace(/\n+/g, ' ')
            // Clean up multiple periods
            .replace(/\.{2,}/g, '.')
            // Remove any trailing/leading whitespace
            .trim();
        
        // Make sure sentences end with periods
        if (!text.endsWith('.')) {
            text += '.';
        }
        
        console.log({ generated: text });
        return text;
    } catch (error) {
        console.error('Error generating content:', error);
        throw error;
    }
};

export default TextGenerator;