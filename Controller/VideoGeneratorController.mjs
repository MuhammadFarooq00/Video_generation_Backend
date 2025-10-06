import video_generator from "../Services/VideoGeneratorService.mjs";

export const generateVideo = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const generatedVideoUrl = await video_generator(prompt);

        res.status(200).json({ 
            message: "Video generation started", 
            videoUrl: generatedVideoUrl 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
