import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  Subject,
  TopicDifficulty,
  TopicImportance,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type SeedTopic = {
  name: string;
  difficulty: TopicDifficulty;
  importance: TopicImportance;
  estimatedMinutes: number;
};

type SeedChapter = {
  subject: Subject;
  name: string;
  topics: SeedTopic[];
};

const chapters: SeedChapter[] = [
  {
    subject: Subject.physics,
    name: "Kinematics",
    topics: [
      {
        name: "Units, dimensions, and errors",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 40,
      },
      {
        name: "Motion in a straight line",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 45,
      },
      {
        name: "Projectile motion",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Relative velocity",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 50,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Laws of Motion",
    topics: [
      {
        name: "Newton's laws",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 45,
      },
      {
        name: "Free body diagrams",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Friction",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Circular motion basics",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Electrostatics",
    topics: [
      {
        name: "Coulomb's law and electric field",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Electric potential",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Gauss law",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Capacitance",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Mole Concept",
    topics: [
      {
        name: "Mole and molar mass",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 35,
      },
      {
        name: "Stoichiometry",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Limiting reagent",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 50,
      },
      {
        name: "Concentration terms",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 50,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Chemical Bonding",
    topics: [
      {
        name: "Ionic and covalent bonding",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 45,
      },
      {
        name: "VSEPR theory",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Hybridisation",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Molecular orbital theory",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Periodic Table",
    topics: [
      {
        name: "Periodic trends",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 45,
      },
      {
        name: "Atomic and ionic radii",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.secondary,
        estimatedMinutes: 35,
      },
      {
        name: "Ionisation energy",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 45,
      },
      {
        name: "Electron affinity and electronegativity",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 45,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Quadratic Equations",
    topics: [
      {
        name: "Nature of roots",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 45,
      },
      {
        name: "Relation between roots and coefficients",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 40,
      },
      {
        name: "Formation of quadratic equations",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 45,
      },
      {
        name: "Location of roots",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Limits and Continuity",
    topics: [
      {
        name: "Basic idea of limits",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 40,
      },
      {
        name: "Standard limits",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Algebraic limits",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Continuity",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Left hand and right hand limits",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 60,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Straight Lines",
    topics: [
      {
        name: "Slope and intercept form",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 40,
      },
      {
        name: "Distance of a point from a line",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 50,
      },
      {
        name: "Angle between two lines",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 45,
      },
      {
        name: "Pair of straight lines",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 70,
      },
    ],
  },
];

async function main() {
  for (const [chapterIndex, chapter] of chapters.entries()) {
    const savedChapter = await prisma.studyChapter.upsert({
      where: {
        subject_name: {
          subject: chapter.subject,
          name: chapter.name,
        },
      },
      update: {
        order: chapterIndex + 1,
      },
      create: {
        subject: chapter.subject,
        name: chapter.name,
        order: chapterIndex + 1,
      },
    });

    for (const [topicIndex, topic] of chapter.topics.entries()) {
      await prisma.studyTopic.upsert({
        where: {
          chapterId_name: {
            chapterId: savedChapter.id,
            name: topic.name,
          },
        },
        update: {
          difficulty: topic.difficulty,
          importance: topic.importance,
          estimatedMinutes: topic.estimatedMinutes,
          order: topicIndex + 1,
        },
        create: {
          chapterId: savedChapter.id,
          name: topic.name,
          difficulty: topic.difficulty,
          importance: topic.importance,
          estimatedMinutes: topic.estimatedMinutes,
          order: topicIndex + 1,
        },
      });
    }
  }

  const topicCount = await prisma.studyTopic.count();
  console.log(`Seeded ${chapters.length} chapters and ${topicCount} topics.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
