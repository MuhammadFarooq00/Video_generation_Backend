import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const genAI = new GoogleGenerativeAI("AIzaSyBeNmz14kvVCdeEH_CWD3XEuAItt_odOj0");

export async function image_generator(prompt) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-preview-image-generation",
    generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
  });

  try {
    console.log("↪ Prompt:", prompt);
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const candidate = response.response?.candidates?.[0];
    if (!candidate) return null;

    const imagePart = candidate.content.parts.find(
      (part) =>
        part.inlineData?.mimeType?.startsWith("image/")
    );
    if (!imagePart) return null;

    const buffer = Buffer.from(imagePart.inlineData.data, "base64");
    const downloadsDir = path.join(__dirname, "..", "public", "downloads");
    fs.mkdirSync(downloadsDir, { recursive: true });

    const fileName = `img_${Date.now()}.png`;
    const filePath = path.join(downloadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return `/downloads/${fileName}`;
  } catch (err) {
    console.error("🚨 Error generating image:", err);
    return null;
  }
}

export default image_generator;
