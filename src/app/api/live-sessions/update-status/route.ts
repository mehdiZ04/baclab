import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const now = new Date();

    // Update sessions to "live" if they're within the current time window (15 min before to 30 min after)
    const sessionsToMakeLive = await prisma.liveSession.findMany({
      where: {
        status: 'upcoming',
      },
    });

    for (const session of sessionsToMakeLive) {
      const sessionDate = new Date(session.date);
      const fifteenMinutesBefore = new Date(sessionDate.getTime() - 15 * 60000);
      const thirtyMinutesAfter = new Date(sessionDate.getTime() + 30 * 60000);

      // Make session live if current time is within the window
      if (now >= fifteenMinutesBefore && now <= thirtyMinutesAfter) {
        await prisma.liveSession.update({
          where: { id: session.id },
          data: { status: 'live' },
        });
      }
    }

    // Update sessions to "completed" if they're past the session end time
    const liveSessions = await prisma.liveSession.findMany({
      where: {
        status: 'live',
      },
    });

    for (const session of liveSessions) {
      const sessionDate = new Date(session.date);
      
      // Parse duration (e.g., "1 hour", "30 minutes", "2 hours")
      let durationMinutes = 60; // default 1 hour
      if (session.duration) {
        const match = session.duration.match(/(\d+)\s*(hour|minute)/i);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          durationMinutes = unit.startsWith('hour') ? value * 60 : value;
        }
      }

      const sessionEndTime = new Date(sessionDate.getTime() + durationMinutes * 60000);

      // Mark as completed if session has ended
      if (now > sessionEndTime) {
        await prisma.liveSession.update({
          where: { id: session.id },
          data: { status: 'completed' },
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Session statuses updated successfully' 
    });
  } catch (error) {
    console.error('Error updating session statuses:', error);
    return NextResponse.json(
      { error: 'Failed to update session statuses' },
      { status: 500 }
    );
  }
}
