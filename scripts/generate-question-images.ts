import { PrismaClient, Prisma } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Configuration
const IMAGE_STORAGE_PATH = path.join(process.cwd(), 'public', 'question-images');
const IMAGE_BASE_URL = '/question-images'; // URL path for accessing images

// Ensure the image storage directory exists
if (!fs.existsSync(IMAGE_STORAGE_PATH)) {
  fs.mkdirSync(IMAGE_STORAGE_PATH, { recursive: true });
}

// Helper function to generate a hash for the image filename
function generateImageHash(questionId: number, description: string): string {
  return createHash('md5')
    .update(`${questionId}-${description}`)
    .digest('hex')
    .substring(0, 10);
}

// Function to generate an image using Gemini
async function generateImageWithGemini(description: string): Promise<Buffer> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `Generate a detailed educational image based on the following description: ${description}
    
    The image should be:
    1. Clear and educational
    2. Suitable for academic use
    3. Accurate in representing the concept
    4. Visually appealing
    
    Please generate this image in high resolution.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const imageData = response.text();
    
    const base64Match = imageData.match(/data:image\/\w+;base64,([^"']+)/);
    if (base64Match && base64Match[1]) {
      return Buffer.from(base64Match[1], 'base64');
    }
    
    const urlMatch = imageData.match(/https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif)/i);
    if (urlMatch) {
      const response = await fetch(urlMatch[0]);
      return Buffer.from(await response.arrayBuffer());
    }
    
    throw new Error('Could not extract image data from Gemini response');
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    throw error;
  }
}

// Function to save an image
async function saveImage(imageBuffer: Buffer, filePath: string): Promise<void> {
  try {
    fs.writeFileSync(filePath, imageBuffer);
    console.log(`Image saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

// Main function to process questions that need images
async function processQuestionsWithImages() {
  try {
    type QuestionWithImage = {
      id: number;
      question_text: string;
      image_description: string | null;
      has_image: boolean;
      image_url: string | null;
    };

    const questions = await prisma.$queryRaw<QuestionWithImage[]>`
      SELECT id, question_text, image_description, has_image, image_url
      FROM learning__questions
      WHERE has_image = true 
      AND image_description IS NOT NULL 
      AND image_url IS NULL
    `;

    console.log(`Found ${questions.length} questions that need images`);

    for (const question of questions) {
      if (!question.image_description) continue;

      try {
        console.log(`Processing question ID: ${question.id}`);
        console.log(`Question text: ${question.question_text.substring(0, 50)}...`);
        console.log(`Image description: ${question.image_description}`);

        const imageHash = generateImageHash(question.id, question.image_description);
        const imageFileName = `${imageHash}.png`;
        const imageFilePath = path.join(IMAGE_STORAGE_PATH, imageFileName);
        const imageUrl = `${IMAGE_BASE_URL}/${imageFileName}`;

        const imageBuffer = await generateImageWithGemini(question.image_description);
        await saveImage(imageBuffer, imageFilePath);

        await prisma.$executeRaw`
          UPDATE learning__questions 
          SET image_url = ${imageUrl}
          WHERE id = ${question.id}
        `;

        console.log(`Successfully processed question ID: ${question.id}`);
        
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Error processing question ID ${question.id}:`, error);
      }
    }

    console.log('Finished processing questions with images');
  } catch (error) {
    console.error('Error in processQuestionsWithImages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
processQuestionsWithImages()
  .then(() => console.log('Script completed successfully'))
  .catch(error => console.error('Script failed:', error)); 