import { PrismaClient } from '@prisma/client';

interface LessonCount {
  count: number;
}

interface LessonPreview {
  id: number;
  name: string;
  book_id: number;
  preview: string;
}

async function checkLessonPlans() {
  const prisma = new PrismaClient();
  
  try {
    const lessonsWithPlans = await prisma.$queryRaw<LessonCount[]>`
      SELECT COUNT(*) as count 
      FROM learning__lessons 
      WHERE lesson_plan IS NOT NULL 
      AND lesson_plan != ''
    `;
    
    console.log('Number of lessons with plans:', lessonsWithPlans[0]?.count);
    
    // Get some example lessons with plans
    const examples = await prisma.$queryRaw<LessonPreview[]>`
      SELECT id, name, book_id, LEFT(lesson_plan, 100) as preview
      FROM learning__lessons
      WHERE lesson_plan IS NOT NULL
      AND lesson_plan != ''
      LIMIT 3
    `;
    
    if (examples.length > 0) {
      console.log('\nExample lessons with plans:');
      examples.forEach((lesson: LessonPreview) => {
        console.log(`\nLesson ID: ${lesson.id}`);
        console.log(`Name: ${lesson.name}`);
        console.log(`Book ID: ${lesson.book_id}`);
        console.log(`Plan preview: ${lesson.preview}...`);
      });
    }
    
  } catch (error) {
    console.error('Error checking lesson plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLessonPlans().catch(console.error); 