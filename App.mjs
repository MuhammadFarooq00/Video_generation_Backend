import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import routes from './Routes/routes.mjs'
import videoRoutes from './Routes/videoRoutes.mjs'
import video from './Services/VideoService.mjs' // Import your video creator
import video_generator, { video_generator_with_source } from './Services/VideoGeneratorService.mjs' // Import video generator service
import { connectDB } from './config/db.mjs';
import authRoutes from './Routes/authRoutes.mjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();
const app = express()
await connectDB();
// CORS configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-frontend-domain.com' // Replace with your actual frontend domain
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions))
app.use(bodyParser.json())

// Ensure the downloads directory exists inside public
const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Serve /downloads/* statically from public/downloads
app.use('/downloads', express.static(path.join('public', 'downloads')));

// Optionally, keep /public for other static assets
app.use("/public", express.static("public"));

app.use('/api', routes);
app.use('/api/video', videoRoutes);
app.use('/api/auth', authRoutes)
// Global clients array to store SSE connections
const clients = [];

// SSE endpoint for progress updates
app.get("/api/video/progress", (req, res) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control"
    });
    
    res.flushHeaders();
    
    // Add client to the list
    clients.push(res);
    console.log(`🟢 SSE client connected (${clients.length} total)`);
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ 
      type: "connection_established", 
      data: { message: "SSE connection established" } 
    })}\n\n`);
    
    // Handle client disconnect
    req.on("close", () => {
      const index = clients.indexOf(res);
      if (index !== -1) {
        clients.splice(index, 1);
        console.log(`🔴 SSE client disconnected (${clients.length} remaining)`);
      }
    });
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
      if (res.finished) {
        clearInterval(keepAlive);
        return;
      }
      res.write(`: keep-alive\n\n`);
    }, 30000); // Send keep-alive every 30 seconds
});

// Function to send progress updates to all connected clients
const sendProgressToClients = (progressData) => {
  const { type, data } = progressData;
  const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
  
  console.log(`📡 Broadcasting to ${clients.length} clients:`, { type, data });
  
  // Send to all connected clients
  clients.forEach((client, index) => {
    try {
      if (!client.finished) {
        client.write(payload);
      } else {
        console.log(`⚠️ Client ${index} connection is finished, removing...`);
        clients.splice(index, 1);
      }
    } catch (error) {
      console.error(`❌ Error sending to client ${index}:`, error);
      clients.splice(index, 1);
    }
  });
};

// Enhanced video generation endpoint with image source selection
app.post("/api/video/generate-video", async (req, res) => {
  const { prompt, imageSource = 'gemini', selectedImages = null } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  
  console.log(`🎬 Starting video generation for prompt: "${prompt}" with ${imageSource} images`);
  
  try {
    // Send initial status
    sendProgressToClients({
      type: "video_generation_start",
      data: { 
        message: "Starting video generation...", 
        prompt: prompt,
        imageSource: imageSource
      }
    });
    
    // Use the enhanced video generator service with image source selection
    const generatedVideoUrl = await video_generator_with_source(
      prompt, 
      imageSource, 
      selectedImages, 
      sendProgressToClients
    );
    
    if (generatedVideoUrl) {
      console.log(`🎉 Video generated successfully: ${generatedVideoUrl}`);
      
      // Send final response
      res.json({ 
        success: true,
        videoUrl: generatedVideoUrl,
        message: "Video generated successfully",
        imageSource: imageSource
      });
    } else {
      throw new Error("Video generation failed - no video URL returned");
    }
    
  } catch (error) {
    console.error("❌ Video generation failed:", error);
    
    // Send error to SSE clients
    sendProgressToClients({
      type: "error",
      data: { 
        message: "Video generation failed", 
        error: error.message 
      }
    });
    
    res.status(500).json({ 
      success: false,
      error: "Video generation failed", 
      details: error.message 
    });
  }
});

// Test endpoint to manually send image data (for debugging)
app.post("/api/video/test-images", (req, res) => {
  console.log("🧪 Testing image broadcast...");
  
  // Send test images
  const testImages = [
    {
      imageUrl: "/downloads/1.jpg",
      index: 0,
      total: 3,
      message: "Test image 1 of 3"
    },
    {
      imageUrl: "/downloads/2.jpg", 
      index: 1,
      total: 3,
      message: "Test image 2 of 3"
    },
    {
      imageUrl: "/downloads/3.jpg",
      index: 2, 
      total: 3,
      message: "Test image 3 of 3"
    }
  ];
  
  testImages.forEach((imgData, index) => {
    setTimeout(() => {
      sendProgressToClients({
        type: "image_generated",
        data: imgData
      });
    }, index * 1000); // Send each image with 1 second delay
  });
  
  res.json({ message: "Test images sent via SSE" });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    sseClients: clients.length,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📡 SSE endpoint: http://localhost:${PORT}/api/video/progress`)
    console.log(`🎬 Video generation: POST http://localhost:${PORT}/api/video/generate-video`)
    console.log(`🧪 Test images: POST http://localhost:${PORT}/api/video/test-images`)
    console.log(`🖼️ Downloads static: http://localhost:${PORT}/downloads/<image>`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})