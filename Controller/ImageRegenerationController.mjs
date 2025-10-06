import image_generator from "../Services/ImageGeneratorService.mjs";
import video from "../Services/VideoService.mjs";
import fs from 'fs';
import path from 'path';

export const regenerateImage = async (req, res) => {
    try {
        const { prompt, imageIndex, totalImages, currentImages } = req.body;
        
        if (!prompt || imageIndex === undefined) {
            return res.status(400).json({ 
                error: "Prompt and imageIndex are required" 
            });
        }

        console.log(`🔄 Regenerating image ${imageIndex + 1} for prompt: "${prompt}"`);

        // Generate new image
        const newImagePath = await image_generator(prompt);
        
        if (!newImagePath) {
            return res.status(500).json({ 
                error: "Failed to generate new image" 
            });
        }

        console.log(`✅ New image generated: ${newImagePath}`);

        // Normalize the image path to ensure consistent forward slashes
        const normalizedImagePath = newImagePath.replace(/\\/g, '/').replace(/\/+/g, '/');

        res.status(200).json({ 
            success: true,
            imageUrl: normalizedImagePath,
            imageIndex: imageIndex,
            message: `Image ${imageIndex + 1} regenerated successfully`
        });

    } catch (error) {
        console.error("❌ Error regenerating image:", error);
        res.status(500).json({ 
            error: "Failed to regenerate image",
            details: error.message 
        });
    }
};

export const regenerateVideoWithNewImages = async (req, res) => {
    try {
        const { imagePaths, subtitles, prompt, progressCallback } = req.body;
        
        if (!imagePaths || !subtitles || !prompt) {
            return res.status(400).json({ 
                error: "imagePaths, subtitles, and prompt are required" 
            });
        }

        console.log(`🎬 Regenerating video with ${imagePaths.length} images`);

        // Normalize all image paths to ensure consistent forward slashes
        const normalizedImagePaths = imagePaths.map(imgPath => 
            imgPath.replace(/\\/g, '/').replace(/\/+/g, '/')
        );
        console.log(`🎬 Normalized image paths:`, normalizedImagePaths);

        // Create a mock progress callback for server-side logging
        const mockProgressCallback = (progressData) => {
            console.log(`📡 Progress: ${progressData.type} - ${progressData.data?.message || ''}`);
        };

        // Generate new video with updated images
        const videoUrl = await video(normalizedImagePaths, subtitles, prompt, null, mockProgressCallback);
        
        if (!videoUrl) {
            return res.status(500).json({ 
                error: "Failed to regenerate video" 
            });
        }

        console.log(`✅ Video regenerated successfully: ${videoUrl}`);

        res.status(200).json({ 
            success: true,
            videoUrl: videoUrl,
            message: "Video regenerated successfully with new images"
        });

    } catch (error) {
        console.error("❌ Error regenerating video:", error);
        res.status(500).json({ 
            error: "Failed to regenerate video",
            details: error.message 
        });
    }
};

export const getImageInfo = async (req, res) => {
    try {
        const { imagePath } = req.query;
        
        if (!imagePath) {
            return res.status(400).json({ 
                error: "imagePath is required" 
            });
        }

        const fullPath = path.resolve("public", imagePath);
        
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ 
                error: "Image file not found" 
            });
        }

        const stats = fs.statSync(fullPath);
        
        res.status(200).json({ 
            success: true,
            imageInfo: {
                path: imagePath,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                exists: true
            }
        });

    } catch (error) {
        console.error("❌ Error getting image info:", error);
        res.status(500).json({ 
            error: "Failed to get image info",
            details: error.message 
        });
    }
};
