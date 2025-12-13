import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'zoom_dashboard',
  user: 'postgres',
  password: 'mehdi',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create instructor user
  const instructorPassword = await bcrypt.hash('instructor123', 10);
  
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      password: instructorPassword,
      name: 'Instructor User',
      role: 'instructor',
    },
  });

  console.log('Created instructor user:', instructor.email);

  // Create sample live sessions
  // Session starting in 10 minutes
  const now = new Date();
  const inTenMinutes = new Date(now.getTime() + 10 * 60000);
  const timeString = inTenMinutes.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 0, 0, 0);

  // Live session starting in 10 minutes
  const testSession = await prisma.liveSession.create({
    data: {
      title: 'Test Live Session - Starting in 10 Minutes',
      description: 'Test session to verify Google Meet integration',
      date: inTenMinutes,
      time: timeString,
      duration: '30 minutes',
      status: 'upcoming',
      attendees: 0,
      maxAttendees: 50,
      meetingLink: 'https://meet.google.com/drj-wqwe-ruc',
      createdBy: instructor.id,
    },
  });

  console.log('Created test session starting at:', timeString);

  const liveSession1 = await prisma.liveSession.create({
    data: {
      title: 'Introduction to React Hooks',
      description: 'Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks',
      date: tomorrow,
      time: '2:00 PM',
      duration: '1 hour',
      status: 'upcoming',
      attendees: 0,
      maxAttendees: 50,
      meetingLink: 'https://meet.google.com/drj-wqwe-ruc',
      createdBy: instructor.id,
    },
  });

  const liveSession2 = await prisma.liveSession.create({
    data: {
      title: 'Advanced TypeScript Patterns',
      description: 'Deep dive into advanced TypeScript features and design patterns',
      date: nextWeek,
      time: '10:00 AM',
      duration: '2 hours',
      status: 'upcoming',
      attendees: 0,
      maxAttendees: 30,
      meetingLink: 'https://meet.google.com/yyy-yyyy-yyy', // Replace with your Google Meet link
      createdBy: instructor.id,
    },
  });

  console.log('Created live sessions:', testSession.title, liveSession1.title, liveSession2.title);

  // Create sample recorded sessions
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const recorded1 = await prisma.recordedSession.create({
    data: {
      title: 'React State Management Deep Dive',
      description: 'Comprehensive guide to state management in React applications',
      recordedDate: lastWeek,
      duration: '1:45:30',
      views: 234,
      size: '850 MB',
      category: 'React',
      videoUrl: 'https://example.com/videos/react-state-management.mp4',
      thumbnailUrl: 'https://example.com/thumbnails/react.jpg',
      downloadUrl: 'https://example.com/downloads/react-state.zip',
      createdBy: instructor.id,
    },
  });

  const recorded2 = await prisma.recordedSession.create({
    data: {
      title: 'Node.js Best Practices 2025',
      description: 'Learn the latest best practices for building Node.js applications',
      recordedDate: twoWeeksAgo,
      duration: '2:15:20',
      views: 189,
      size: '1.2 GB',
      category: 'Node.js',
      videoUrl: 'https://example.com/videos/nodejs-best-practices.mp4',
      thumbnailUrl: 'https://example.com/thumbnails/nodejs.jpg',
      downloadUrl: 'https://example.com/downloads/nodejs-best.zip',
      createdBy: instructor.id,
    },
  });

  const recorded3 = await prisma.recordedSession.create({
    data: {
      title: 'CSS Grid & Flexbox Masterclass',
      description: 'Master modern CSS layout techniques with Grid and Flexbox',
      recordedDate: twoWeeksAgo,
      duration: '1:30:45',
      views: 456,
      size: '720 MB',
      category: 'CSS',
      videoUrl: 'https://example.com/videos/css-grid-flexbox.mp4',
      thumbnailUrl: 'https://example.com/thumbnails/css.jpg',
      createdBy: instructor.id,
    },
  });

  console.log('Created recorded sessions:', recorded1.title, recorded2.title, recorded3.title);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
