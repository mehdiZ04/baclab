# Live Session Platform - Setup Guide

## Overview
A Next.js-based platform for managing live sessions and recorded videos with PostgreSQL database integration and NextAuth authentication.

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database running locally or remotely
- npm or yarn package manager

## Database Setup

### 1. Configure Database Connection

Update the `.env` file with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Example for local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/zoom_dashboard?schema=public"
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Run Database Migrations

This will create all the necessary tables in your PostgreSQL database:

```bash
npm run prisma:migrate
```

When prompted for a migration name, you can use: `init`

### 4. Seed the Database

This will create sample users and data:

```bash
npm run prisma:seed
```

## Default User Credentials

After seeding, you can login with these credentials:

### Admin User
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** admin

### Instructor User
- **Email:** `instructor@example.com`
- **Password:** `instructor123`
- **Role:** instructor

## Running the Application

### Development Mode

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Application Routes

- `/` - Homepage with platform overview
- `/login` - Login page
- `/dashboard` - Protected dashboard (requires authentication)

## Database Schema

### User Model
- Stores user credentials (email, password, name, role)
- Passwords are hashed using bcrypt

### LiveSession Model
- Manages upcoming, live, and completed sessions
- Includes: title, description, date, time, duration, status, attendees, meeting link

### RecordedSession Model
- Stores recorded session metadata
- Includes: title, description, recorded date, duration, views, size, category, video URL, download URL

## Creating New Users Manually

You can create new users using Prisma Studio:

```bash
npx prisma studio
```

Or create them programmatically:

```typescript
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash('password123', 10);

await prisma.user.create({
  data: {
    email: 'newuser@example.com',
    password: hashedPassword,
    name: 'New User',
    role: 'user',
  },
});
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Live Sessions
- `GET /api/live-sessions` - Get all live sessions
- `GET /api/live-sessions?date=YYYY-MM-DD` - Get sessions by date
- `POST /api/live-sessions` - Create new session
- `GET /api/live-sessions/[id]` - Get specific session
- `PATCH /api/live-sessions/[id]` - Update session
- `DELETE /api/live-sessions/[id]` - Delete session

### Recorded Sessions
- `GET /api/recorded-sessions` - Get all recordings
- `GET /api/recorded-sessions?date=YYYY-MM-DD` - Get by date
- `GET /api/recorded-sessions?category=React` - Get by category
- `POST /api/recorded-sessions` - Create new recording
- `GET /api/recorded-sessions/[id]` - Get specific recording
- `PATCH /api/recorded-sessions/[id]` - Update recording
- `DELETE /api/recorded-sessions/[id]` - Delete recording

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists
- Verify user has proper permissions

### Prisma Client Not Found
```bash
npm run prisma:generate
```

### Migration Errors
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migrations again
npm run prisma:migrate
```

### Authentication Issues
- Verify NEXTAUTH_SECRET is set in `.env`
- Clear browser cookies
- Check user exists in database

## Technologies Used

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **UI Components:** shadcn/ui (Radix UI + Tailwind CSS)
- **Icons:** Lucide React
- **Password Hashing:** bcryptjs

## Project Structure

```
zoom-dashboard/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── login/          # Login page
│   │   └── page.tsx        # Homepage
│   ├── components/
│   │   ├── dashboard/      # Dashboard components
│   │   ├── ui/             # UI components
│   │   └── login-form.tsx  # Login form
│   └── lib/
│       ├── auth.ts         # NextAuth configuration
│       ├── prisma.ts       # Prisma client
│       └── utils.ts        # Utility functions
├── .env                    # Environment variables
└── package.json
```

## Next Steps

1. Update `.env` with production values
2. Add your own video storage solution
3. Integrate real Zoom/meeting platform APIs
4. Add email notifications for sessions
5. Implement file upload for video recordings
6. Add user management interface for admins

## Support

For issues or questions, please check the documentation or create an issue in the repository.
