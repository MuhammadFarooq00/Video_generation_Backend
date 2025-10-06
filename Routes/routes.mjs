import express from 'express'
import multer from 'multer';
import * as generateContoller from '../Controller/ImageGeneratorControl.mjs'
import detectLandmarkController from '../Controller/ImageAnalyzerController.mjs'
import * as imageRegenController from '../Controller/ImageRegenerationController.mjs'
import * as pexelsController from '../Controller/PexelsController.mjs'
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

//handle route for text generator
router.post('/generate', generateContoller.textGenerator);

//handle route for image generator
router.post('/image', generateContoller.imageGenerator);

//handle route for image analyzer
router.post('/detect-landmark', upload.single('file'), detectLandmarkController);

//handle route for image regeneration
router.post('/regenerate-image', imageRegenController.regenerateImage);
router.post('/regenerate-video', imageRegenController.regenerateVideoWithNewImages);
router.get('/image-info', imageRegenController.getImageInfo);

//handle routes for Pexels integration
router.get('/pexels/search', pexelsController.searchPexelsImages);
router.get('/pexels/curated', pexelsController.getCuratedImages);
router.post('/pexels/download', pexelsController.downloadPexelsImage);
router.post('/pexels/select-for-video', pexelsController.selectImagesForVideo);

// Note: Video generation is handled in App.mjs with SSE support

export default router;