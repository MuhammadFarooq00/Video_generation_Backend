import axios from 'axios';
import KeywordExtractionService from './KeywordExtractionService.mjs';

const PEXELS_API_KEY = 'aKISVXmn0C6l3QtJ2vwhKM8PcBOE9Oy4BQenFhBOwCHYJ8VUDNXWscvP';
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

class PexelsService {
  constructor() {
    this.apiKey = PEXELS_API_KEY;
    this.baseURL = PEXELS_BASE_URL;
  }

  // Search for images based on query
  async searchImages(query, perPage = 20, page = 1) {
    try {
      // Validate query
      if (!query || query.trim() === '') {
        console.log('⚠️ Empty query provided to Pexels search');
        return {
          success: false,
          error: 'Empty query provided',
          images: []
        };
      }

      console.log(`🔍 Searching Pexels for: "${query}"`);
      
      const response = await axios.get(`${this.baseURL}/search`, {
        params: {
          query: query.trim(),
          per_page: perPage,
          page: page,
          orientation: 'landscape', // Better for video
          size: 'large'
        },
        headers: {
          'Authorization': this.apiKey
        }
      });

      const images = response.data.photos.map(photo => ({
        id: photo.id,
        url: photo.src.large2x || photo.src.large,
        thumbnail: photo.src.medium,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        alt: photo.alt || query,
        width: photo.width,
        height: photo.height,
        originalUrl: photo.src.original
      }));

      console.log(`✅ Found ${images.length} images from Pexels`);
      return {
        success: true,
        images: images,
        totalResults: response.data.total_results,
        page: response.data.page,
        perPage: response.data.per_page
      };

    } catch (error) {
      console.error('❌ Pexels API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        images: []
      };
    }
  }

  // Get curated images (popular/trending)
  async getCuratedImages(perPage = 20, page = 1) {
    try {
      console.log('🔍 Fetching curated images from Pexels');
      
      const response = await axios.get(`${this.baseURL}/curated`, {
        params: {
          per_page: perPage,
          page: page
        },
        headers: {
          'Authorization': this.apiKey
        }
      });

      const images = response.data.photos.map(photo => ({
        id: photo.id,
        url: photo.src.large2x || photo.src.large,
        thumbnail: photo.src.medium,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        alt: photo.alt || 'Curated image',
        width: photo.width,
        height: photo.height,
        originalUrl: photo.src.original
      }));

      console.log(`✅ Found ${images.length} curated images from Pexels`);
      return {
        success: true,
        images: images,
        totalResults: response.data.total_results,
        page: response.data.page,
        perPage: response.data.per_page
      };

    } catch (error) {
      console.error('❌ Pexels Curated API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        images: []
      };
    }
  }

  // Download and save image locally
  async downloadImage(imageUrl, filename) {
    try {
      console.log(`📥 Downloading image: ${imageUrl}`);
      
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });

      const fs = await import('fs');
      const path = await import('path');
      
      const downloadsDir = path.resolve('public/downloads');
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      const filePath = path.join(downloadsDir, filename);
      fs.writeFileSync(filePath, response.data);

      const relativePath = `/downloads/${filename}`;
      console.log(`✅ Image saved: ${relativePath}`);
      
      return {
        success: true,
        localPath: relativePath,
        filePath: filePath
      };

    } catch (error) {
      console.error('❌ Error downloading image:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Intelligent image selection based on video script
  async selectImagesForVideo(script, imageCount = 4) {
    try {
      console.log(`🎯 Intelligently selecting ${imageCount} images for video script`);
      console.log(`📝 Script: "${script}"`);
      
      // Use AI-powered keyword extraction
      const keywords = await KeywordExtractionService.extractKeywords(script);
      console.log('🔍 AI extracted keywords:', keywords);

      const selectedImages = [];
      const usedImageIds = new Set();

      // Generate multiple search queries from keywords
      const searchQueries = KeywordExtractionService.generateSearchQueries(keywords);
      console.log('🔍 Generated search queries:', searchQueries);

      // Try each search query
      for (const query of searchQueries) {
        if (selectedImages.length >= imageCount) break;
        
        if (!query || query.trim() === '') {
          console.log('⚠️ Skipping empty query');
          continue;
        }

        console.log(`🔍 Searching with query: "${query}"`);
        const searchResult = await this.searchImages(query, 10, 1);
        
        if (searchResult.success && searchResult.images.length > 0) {
          console.log(`✅ Found ${searchResult.images.length} images for query: "${query}"`);
          for (const image of searchResult.images) {
            if (selectedImages.length >= imageCount) break;
            if (!usedImageIds.has(image.id)) {
              selectedImages.push(image);
              usedImageIds.add(image.id);
            }
          }
        } else {
          console.log(`❌ No images found for query: "${query}"`);
        }
      }

      // If we still need more images, get curated ones
      if (selectedImages.length < imageCount) {
        console.log(`🔄 Need ${imageCount - selectedImages.length} more images, getting curated...`);
        const curatedResult = await this.getCuratedImages(20, 1);
        if (curatedResult.success && curatedResult.images.length > 0) {
          console.log(`✅ Found ${curatedResult.images.length} curated images`);
          for (const image of curatedResult.images) {
            if (selectedImages.length >= imageCount) break;
            if (!usedImageIds.has(image.id)) {
              selectedImages.push(image);
              usedImageIds.add(image.id);
            }
          }
        }
      }

      console.log(`✅ Selected ${selectedImages.length} images intelligently`);
      return {
        success: true,
        images: selectedImages.slice(0, imageCount),
        totalSelected: selectedImages.length
      };

    } catch (error) {
      console.error('❌ Error in intelligent image selection:', error.message);
      return {
        success: false,
        error: error.message,
        images: []
      };
    }
  }

}

export default new PexelsService();
