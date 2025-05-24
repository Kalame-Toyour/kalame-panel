import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';

dotenv.config();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface Lesson {
  id: number;
  name: string;
  lesson_plan: string | null;
}

interface AssignmentStep {
  step_number: number;
  content: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface Assignment {
  description: string;
  tutorial: string;
  steps: AssignmentStep[];
}

const assignmentSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    description: { type: SchemaType.STRING, description: 'شرح کلی و هدف کلی آموزش' },
    tutorial: { type: SchemaType.STRING, description: 'آموزش کامل و تدریجی درس' },
    steps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          step_number: { type: SchemaType.INTEGER, description: 'شماره گام' },
          content: { type: SchemaType.STRING, description: 'محتوای آموزشی این گام' },
          question: { type: SchemaType.STRING, description: 'سوال چهارگزینه‌ای برای این گام' },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            minItems: 4,
            maxItems: 4,
            description: 'آرایه‌ای از ۴ گزینه برای سوال'
          },
          correct_answer: { type: SchemaType.INTEGER, description: 'شماره گزینه صحیح (۰ تا ۳)' },
          explanation: { type: SchemaType.STRING, description: 'توضیح کامل پاسخ صحیح' }
        },
        required: ['step_number', 'content', 'question', 'options', 'correct_answer', 'explanation']
      },
      minItems: 1,
      description: 'مراحل آموزش به صورت گام به گام'
    }
  },
  required: ['description', 'tutorial', 'steps']
};

function isValidAssignmentStep(q: any) {
  return q && typeof q.step_number === 'number' && typeof q.content === 'string' && typeof q.question === 'string' && Array.isArray(q.options) && q.options.length === 4 && typeof q.correct_answer === 'number' && typeof q.explanation === 'string';
}

function isValidAssignmentResponse(data: any) {
  return data && typeof data.description === 'string' && typeof data.tutorial === 'string' && Array.isArray(data.steps) && data.steps.length > 0 && data.steps.every(isValidAssignmentStep);
}

function safeJSONParse(text: string) {
  try {
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch {
    return null;
  }
}

async function generateAssignmentForLesson(lesson: Lesson): Promise<Assignment | null> {
  // Compose prompt in Persian for Gemini or your LLM API
  const prompt = `
شما یک معلم حرفه‌ای هستید. با توجه به طرح درس زیر و استاندارد 5E، یک آموزش جامع و گام‌به‌گام برای این درس تولید کن که دانش‌آموز بتواند هر بخش را به طور کامل و عمیق یاد بگیرد.

ساختار خروجی باید دقیقا شامل سه بخش زیر باشد:
1. "description": یک خلاصه و هدف کلی از آموزش این درس (حداکثر ۳ جمله).
2. "tutorial": آموزش کامل و تدریجی درس، به صورت یک متن پیوسته و مفصل که همه مفاهیم اصلی را پوشش دهد (این بخش باید جدا از گام‌ها باشد).
3. "steps": آرایه‌ای از گام‌ها که هر گام شامل:
   - "step_number": شماره گام
   - "content": توضیح آموزشی همان گام
   - "question": یک سوال چهارگزینه‌ای مرتبط با همان گام
   - "options": آرایه‌ای از ۴ گزینه
   - "correct_answer": شماره گزینه صحیح (۰ تا ۳)
   - "explanation": توضیح کامل پاسخ صحیح

همه محتوا باید به زبان فارسی و با رویکرد آموزشی و تدریجی باشد.

نام درس: ${lesson.name}
${lesson.lesson_plan ? `طرح درس: ${lesson.lesson_plan}` : ''}

`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-04-17',
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 8192,
      topP: 0.9,
      topK: 35,
      responseMimeType: 'application/json',
      responseSchema: assignmentSchema,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const parsed = safeJSONParse(text);
  if (!parsed || !isValidAssignmentResponse(parsed)) {
    console.error('Invalid Gemini response:', text);
    // Fallback: if tutorial is missing but description exists, set tutorial = description
    if (parsed && parsed.description && !parsed.tutorial) {
      parsed.tutorial = parsed.description;
      if (isValidAssignmentResponse(parsed)) {
        return parsed;
      }
    }
    return null;
  }
  return parsed;
}

async function processLessons() {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { lesson_plan: { not: null } },
      select: { id: true, name: true, lesson_plan: true }
    });
    console.log(`Found ${lessons.length} lessons with lesson plans.`);
    let processed = 0;
    let failed = 0;
    for (const lesson of lessons) {
      processed++;
      console.log(`\n[${processed}/${lessons.length}] Processing lesson: ${lesson.name}`);
      // Check if assignment already exists
      const existing = await prisma.learning__lesson_assignment.findUnique({ where: { lesson_id: lesson.id } });
      if (existing) {
        console.log('Assignment already exists, skipping.');
        continue;
      }
      const generated = await generateAssignmentForLesson(lesson);
      if (!generated) {
        failed++;
        continue;
      }
      // Save assignment
      const assignment = await prisma.learning__lesson_assignment.create({
        data: {
          lesson_id: lesson.id,
          description: generated.description,
          tutorial: generated.tutorial
        }
      });
      // Save steps
      for (const step of generated.steps) {
        await prisma.learning__lesson_assignment_step.create({
          data: {
            assignment_id: assignment.id,
            step_number: step.step_number,
            content: step.content,
            question: step.question,
            options: JSON.stringify(step.options),
            correct_answer: step.correct_answer,
            explanation: step.explanation
          }
        });
      }
      console.log('Assignment and steps saved.');
      await new Promise(res => setTimeout(res, 2000)); // Delay to avoid rate limits
    }
    console.log(`\nDone. Processed: ${processed}, Failed: ${failed}`);
  } catch (error) {
    console.error('Error processing lessons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to generate assignments for all lessons in a specific book, field, and year
async function generateAssignmentForBookFieldYear(bookId: number, fieldId: number, yearId: number) {
  try {
    console.log(`Starting targeted assignment generation for book ID ${bookId}, field ID ${fieldId}, year ID ${yearId}`);

    // Fetch lessons for the book
    const lessons = await prisma.lesson.findMany({
      where: {
        book_id: bookId,
        lesson_plan: { not: null },
      },
      select: { id: true, name: true, lesson_plan: true }
    });
    if (!lessons.length) {
      console.log(`No lessons found for book id ${bookId}`);
      return;
    }
    console.log(`Found ${lessons.length} lessons for book id ${bookId}`);

    let processed = 0;
    let failed = 0;
    for (const lesson of lessons) {
      processed++;
      console.log(`\n[${processed}/${lessons.length}] Generating assignment for lesson: ${lesson.name}`);
      // Check if assignment already exists
      const existing = await prisma.learning__lesson_assignment.findUnique({ where: { lesson_id: lesson.id } });
      if (existing) {
        console.log('Assignment already exists, skipping.');
        continue;
      }
      const generated = await generateAssignmentForLesson(lesson);
      if (!generated) {
        failed++;
        continue;
      }
      // Save assignment
      const assignment = await prisma.learning__lesson_assignment.create({
        data: {
          lesson_id: lesson.id,
          description: generated.description,
          tutorial: generated.tutorial
        }
      });
      // Save steps
      for (const step of generated.steps) {
        await prisma.learning__lesson_assignment_step.create({
          data: {
            assignment_id: assignment.id,
            step_number: step.step_number,
            content: step.content,
            question: step.question,
            options: JSON.stringify(step.options),
            correct_answer: step.correct_answer,
            explanation: step.explanation
          }
        });
      }
      console.log('Assignment and steps saved.');
      await new Promise(res => setTimeout(res, 2000)); // Delay to avoid rate limits
    }
    console.log(`\nTargeted assignment generation completed! Processed: ${processed}, Failed: ${failed}`);
  } catch (error) {
    console.error('Error in targeted assignment generation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// CLI entry point
if (require.main === module) {
  if (process.argv.includes('--targeted')) {
    generateAssignmentForBookFieldYear(1, 1, 4).catch(console.error);
  } else {
    processLessons().catch(console.error);
  }
} 