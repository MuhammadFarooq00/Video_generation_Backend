import PexelsService from '../Services/PexelsService.mjs';

export const searchPexelsImages = async (req, res) => {
    try {
        const { query, perPage = 20, page = 1 } = req.query;
        
        if (!query) {
            return res.status(400).json({ 
                error: "Query parameter is required" 
            });
        }

        console.log(`🔍 Pexels search request: "${query}"`);
        const result = await PexelsService.searchImages(query, parseInt(perPage), parseInt(page));
        
        if (result.success) {
            res.status(200).json({
                success: true,
                images: result.images,
                totalResults: result.totalResults,
                page: result.page,
                perPage: result.perPage
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('❌ Pexels search error:', error);
        res.status(500).json({ 
            error: "Failed to search Pexels images",
            details: error.message 
        });
    }
};

export const getCuratedImages = async (req, res) => {
    try {
        const { perPage = 20, page = 1 } = req.query;
        
        console.log('🔍 Pexels curated request');
        const result = await PexelsService.getCuratedImages(parseInt(perPage), parseInt(page));
        
        if (result.success) {
            res.status(200).json({
                success: true,
                images: result.images,
                totalResults: result.totalResults,
                page: result.page,
                perPage: result.perPage
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('❌ Pexels curated error:', error);
        res.status(500).json({ 
            error: "Failed to get curated images",
            details: error.message 
        });
    }
};

export const downloadPexelsImage = async (req, res) => {
    try {
        const { imageUrl, filename } = req.body;
        
        if (!imageUrl || !filename) {
            return res.status(400).json({ 
                error: "imageUrl and filename are required" 
            });
        }

        console.log(`📥 Downloading Pexels image: ${imageUrl}`);
        const result = await PexelsService.downloadImage(imageUrl, filename);
        
        if (result.success) {
            res.status(200).json({
                success: true,
                localPath: result.localPath,
                filePath: result.filePath
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('❌ Pexels download error:', error);
        res.status(500).json({ 
            error: "Failed to download image",
            details: error.message 
        });
    }
};

export const selectImagesForVideo = async (req, res) => {
    try {
        const { script, imageCount = 4 } = req.body;
        
        if (!script) {
            return res.status(400).json({ 
                error: "Script is required for intelligent image selection" 
            });
        }

        console.log(`🎯 Intelligent image selection for script: "${script.substring(0, 100)}..."`);
        const result = await PexelsService.selectImagesForVideo(script, parseInt(imageCount));
        
        if (result.success) {
            res.status(200).json({
                success: true,
                images: result.images,
                totalSelected: result.totalSelected
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }

    } catch (error) {
        console.error('❌ Intelligent image selection error:', error);
        res.status(500).json({ 
            error: "Failed to select images intelligently",
            details: error.message 
        });
    }
};
