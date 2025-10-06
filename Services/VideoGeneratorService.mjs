import image_generator from "./ImageGeneratorService.mjs";
import TextGenerator from "./TextGeneratorService.mjs";
import PexelsService from "./PexelsService.mjs";
import natural from 'natural';
import video from './VideoService.mjs';
import fs from 'fs';
import path from 'path';

const video_generator = async (prompt, progressCallback = null) => {
    try {
        const text = await TextGenerator(prompt);
        console.log('🔍 Generated text:', text);
        
        var tokenizer = new natural.RegexpTokenizer({ pattern: /\./ });
        var subtitles = tokenizer.tokenize(text).map(sub => sub.trim()).filter(Boolean);
        
        console.log('🔍 Tokenized subtitles:', subtitles);
        console.log('🔍 Number of subtitles:', subtitles.length);
        
        // Fallback if no subtitles are generated
        if (subtitles.length === 0) {
            console.log('⚠️ No subtitles generated, using fallback');
            subtitles = [
                `A ${prompt.toLowerCase()} scene`,
                `The main character in the ${prompt.toLowerCase()}`,
                `An action sequence in the ${prompt.toLowerCase()}`,
                `The conclusion of the ${prompt.toLowerCase()}`
            ];
            console.log('🔍 Using fallback subtitles:', subtitles);
        }
        
        let imagePaths = [];

        // Send progress update for text generation
        if (progressCallback) {
            progressCallback({
                type: "text_generated",
                data: {
                    message: "Text generated successfully",
                    subtitles: subtitles,
                    totalSubtitles: subtitles.length
                }
            });
        }

        for (let i = 0; i < subtitles.length; i++) {
            try {
                console.log(`🎬 Generating image for subtitle: "${subtitles[i]}"`);

                // Send progress update for image generation start
                if (progressCallback) {
                    progressCallback({
                        type: "image_generation_start",
                        data: {
                            index: i,
                            total: subtitles.length,
                            subtitle: subtitles[i],
                            message: `Generating image ${i + 1} of ${subtitles.length}`
                        }
                    });
                }

                const imagePath = await image_generator(subtitles[i]); // Directly get the image path

                console.log("🔍 Raw Response:", imagePath); // Debugging

                if (imagePath && typeof imagePath === "string") {  // Fix: Directly check the string
                    console.log(`✅ Image saved: ${imagePath}`);
                    imagePaths.push(imagePath);
                    
                    // Send progress update for image generation completion
                    if (progressCallback) {
                        progressCallback({
                            type: "image_generated",
                            data: {
                                imageUrl: imagePath,
                                index: i,
                                total: subtitles.length,
                                message: `Image ${i + 1} of ${subtitles.length} generated successfully`
                            }
                        });
                    }
                } else {
                    console.warn(`⚠️ No valid image found for "${subtitles[i]}"`);
                }
            } catch (err) {
                console.error(`❌ Error generating image for "${subtitles[i]}":`, err);
                
                // Send error progress update
                if (progressCallback) {
                    progressCallback({
                        type: "error",
                        data: {
                            message: `Error generating image for subtitle ${i + 1}: ${err.message}`,
                            step: "image_generation",
                            index: i
                        }
                    });
                }
            }
        }

        console.log("🖼️ Final image paths:", imagePaths);

        if (imagePaths.length !== subtitles.length) {
            console.warn("Mismatch between generated images and subtitles. Adjusting...");
            subtitles = subtitles.slice(0, imagePaths.length); // Ensure equal count
        }

        console.log("Final Subtitles:", subtitles);
        console.log("Final Images:", imagePaths);
        
        // Debug: Check if images exist
        for (let i = 0; i < imagePaths.length; i++) {
            const fullPath = path.resolve("public", imagePaths[i]);
            console.log(`🔍 Checking image ${i}: ${imagePaths[i]} -> ${fullPath} (exists: ${fs.existsSync(fullPath)})`);
        }

        if (imagePaths.length > 0) {
            // Send progress update for video creation start
            if (progressCallback) {
                progressCallback({
                    type: "video_creation_start",
                    data: {
                        message: "Starting video creation from generated images",
                        totalImages: imagePaths.length,
                        totalSubtitles: subtitles.length
                    }
                });
            }

            const generatedVideoUrl = await video(imagePaths, subtitles, prompt, null, progressCallback); // Call video function with aligned data
            console.log(`🎬 Video generation completed, URL: ${generatedVideoUrl}`);
            return generatedVideoUrl; 
        } else {
            console.error("No images were successfully generated.");
            if (progressCallback) {
                progressCallback({
                    type: "error",
                    data: {
                        message: "No images were successfully generated",
                        step: "image_validation"
                    }
                });
            }
            return null; // Return null when no images are generated
        }

    } catch (error) {
        console.error("Error in video generation:", error);
        if (progressCallback) {
            progressCallback({
                type: "error",
                data: {
                    message: `Video generation failed: ${error.message}`,
                    step: "general_processing"
                }
            });
        }
        throw error; // Re-throw the error so it can be caught by the caller
    }
};

// Enhanced video generator with image source selection
const video_generator_with_source = async (prompt, imageSource = 'gemini', selectedImages = null, progressCallback = null) => {
    try {
        console.log(`🎬 Starting video generation with ${imageSource} images`);
        
        const text = await TextGenerator(prompt);
        console.log('🔍 Generated text:', text);
        
        var tokenizer = new natural.RegexpTokenizer({ pattern: /\./ });
        var subtitles = tokenizer.tokenize(text).map(sub => sub.trim()).filter(Boolean);
        
        console.log('🔍 Tokenized subtitles:', subtitles);
        console.log('🔍 Number of subtitles:', subtitles.length);
        
        // Fallback if no subtitles are generated
        if (subtitles.length === 0) {
            console.log('⚠️ No subtitles generated, using fallback');
            subtitles = [
                `A ${prompt.toLowerCase()} scene`,
                `The main character in the ${prompt.toLowerCase()}`,
                `An action sequence in the ${prompt.toLowerCase()}`,
                `The conclusion of the ${prompt.toLowerCase()}`
            ];
            console.log('🔍 Using fallback subtitles:', subtitles);
        }
        
        let imagePaths = [];

        // Send progress update for text generation
        if (progressCallback) {
            progressCallback({
                type: "text_generated",
                data: {
                    message: "Text generated successfully",
                    subtitles: subtitles,
                    totalSubtitles: subtitles.length
                }
            });
        }

        if (imageSource === 'pexels') {
            // Use Pexels images
            if (selectedImages && selectedImages.length > 0) {
                // Use user-selected images
                console.log('🎯 Using user-selected Pexels images');
                imagePaths = await processSelectedPexelsImages(selectedImages, subtitles, progressCallback);
            } else {
                // Auto-select images based on original prompt (better for keyword extraction)
                console.log('🤖 Auto-selecting Pexels images based on original prompt');
                imagePaths = await processAutoSelectedPexelsImages(prompt, subtitles, progressCallback);
            }
        } else {
            // Use Gemini-generated images (original flow)
            console.log('🎨 Using Gemini-generated images');
            imagePaths = await processGeminiImages(subtitles, progressCallback);
        }

        console.log(`🖼️ Final image paths: ${imagePaths}`);
        console.log(`Final Subtitles: ${subtitles}`);
        console.log(`Final Images: ${imagePaths.length}`);

        if (imagePaths.length > 0) {
            // Send progress update for video creation start
            if (progressCallback) {
                progressCallback({
                    type: "video_creation_start",
                    data: {
                        message: "Starting video creation from generated images",
                        totalImages: imagePaths.length,
                        totalSubtitles: subtitles.length
                    }
                });
            }

            const generatedVideoUrl = await video(imagePaths, subtitles, prompt, null, progressCallback);
            console.log(`🎬 Video generation completed, URL: ${generatedVideoUrl}`);
            return generatedVideoUrl; 
        } else {
            console.error("No images were successfully generated.");
            if (progressCallback) {
                progressCallback({
                    type: "error",
                    data: {
                        message: "No images were successfully generated",
                        step: "image_validation"
                    }
                });
            }
            return null;
        }

    } catch (error) {
        console.error("Error in video generation:", error);
        if (progressCallback) {
            progressCallback({
                type: "error",
                data: {
                    message: `Video generation failed: ${error.message}`,
                    step: "general_processing"
                }
            });
        }
        throw error;
    }
};

// Process user-selected Pexels images
const processSelectedPexelsImages = async (selectedImages, subtitles, progressCallback) => {
    const imagePaths = [];
    
    for (let i = 0; i < Math.min(selectedImages.length, subtitles.length); i++) {
        try {
            const pexelsImage = selectedImages[i];
            console.log(`🎬 Processing selected Pexels image ${i + 1}: ${pexelsImage.alt}`);
            
            // Send progress update for image processing start
            if (progressCallback) {
                progressCallback({
                    type: "image_generation_start",
                    data: {
                        index: i,
                        total: subtitles.length,
                        subtitle: subtitles[i],
                        message: `Processing selected image ${i + 1} of ${subtitles.length}`
                    }
                });
            }

            // Download the image
            const filename = `pexels_${Date.now()}_${i}.jpg`;
            const downloadResult = await PexelsService.downloadImage(pexelsImage.url, filename);
            
            if (downloadResult.success) {
                imagePaths.push(downloadResult.localPath);
                console.log(`✅ Pexels image saved: ${downloadResult.localPath}`);
                
                // Send progress update for image processing completion
                if (progressCallback) {
                    progressCallback({
                        type: "image_generated",
                        data: {
                            imageUrl: downloadResult.localPath,
                            index: i,
                            total: subtitles.length,
                            message: `Selected image ${i + 1} of ${subtitles.length} processed successfully`
                        }
                    });
                }
            } else {
                console.warn(`⚠️ Failed to download Pexels image: ${downloadResult.error}`);
            }
        } catch (err) {
            console.error(`❌ Error processing Pexels image ${i}:`, err);
        }
    }
    
    return imagePaths;
};

// Process auto-selected Pexels images
const processAutoSelectedPexelsImages = async (prompt, subtitles, progressCallback) => {
    const imagePaths = [];
    
    // Get intelligent image selection using original prompt
    const selectionResult = await PexelsService.selectImagesForVideo(prompt, subtitles.length);
    
    if (selectionResult.success && selectionResult.images.length > 0) {
        for (let i = 0; i < Math.min(selectionResult.images.length, subtitles.length); i++) {
            try {
                const pexelsImage = selectionResult.images[i];
                console.log(`🎬 Processing auto-selected Pexels image ${i + 1}: ${pexelsImage.alt}`);
                
                // Send progress update for image processing start
                if (progressCallback) {
                    progressCallback({
                        type: "image_generation_start",
                        data: {
                            index: i,
                            total: subtitles.length,
                            subtitle: subtitles[i],
                            message: `Processing auto-selected image ${i + 1} of ${subtitles.length}`
                        }
                    });
                }

                // Download the image
                const filename = `pexels_auto_${Date.now()}_${i}.jpg`;
                const downloadResult = await PexelsService.downloadImage(pexelsImage.url, filename);
                
                if (downloadResult.success) {
                    imagePaths.push(downloadResult.localPath);
                    console.log(`✅ Auto-selected Pexels image saved: ${downloadResult.localPath}`);
                    
                    // Send progress update for image processing completion
                    if (progressCallback) {
                        progressCallback({
                            type: "image_generated",
                            data: {
                                imageUrl: downloadResult.localPath,
                                index: i,
                                total: subtitles.length,
                                message: `Auto-selected image ${i + 1} of ${subtitles.length} processed successfully`
                            }
                        });
                    }
                } else {
                    console.warn(`⚠️ Failed to download auto-selected Pexels image: ${downloadResult.error}`);
                }
            } catch (err) {
                console.error(`❌ Error processing auto-selected Pexels image ${i}:`, err);
            }
        }
    }
    
    return imagePaths;
};

// Process Gemini-generated images (original flow)
const processGeminiImages = async (subtitles, progressCallback) => {
    const imagePaths = [];
    
    for (let i = 0; i < subtitles.length; i++) {
        try {
            console.log(`🎬 Generating Gemini image for subtitle: "${subtitles[i]}"`);

            // Send progress update for image generation start
            if (progressCallback) {
                progressCallback({
                    type: "image_generation_start",
                    data: {
                        index: i,
                        total: subtitles.length,
                        subtitle: subtitles[i],
                        message: `Generating image ${i + 1} of ${subtitles.length}`
                    }
                });
            }

            const imagePath = await image_generator(subtitles[i]);

            console.log("🔍 Raw Response:", imagePath);

            if (imagePath && typeof imagePath === "string") {
                console.log(`✅ Image saved: ${imagePath}`);
                imagePaths.push(imagePath);
                
                // Send progress update for image generation completion
                if (progressCallback) {
                    progressCallback({
                        type: "image_generated",
                        data: {
                            imageUrl: imagePath,
                            index: i,
                            total: subtitles.length,
                            message: `Image ${i + 1} of ${subtitles.length} generated successfully`
                        }
                    });
                }
            } else {
                console.warn(`⚠️ No valid image found for "${subtitles[i]}"`);
            }
        } catch (err) {
            console.error(`❌ Error generating image for "${subtitles[i]}":`, err);
        }
    }
    
    return imagePaths;
};

export default video_generator;
export { video_generator_with_source };
