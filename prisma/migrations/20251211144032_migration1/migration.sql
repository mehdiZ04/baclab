-- CreateTable
CREATE TABLE "ActiveUserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiveUserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveUserSession_userId_key" ON "ActiveUserSession"("userId");

-- CreateIndex
CREATE INDEX "ActiveUserSession_sessionId_idx" ON "ActiveUserSession"("sessionId");

-- CreateIndex
CREATE INDEX "ActiveUserSession_lastHeartbeat_idx" ON "ActiveUserSession"("lastHeartbeat");

-- AddForeignKey
ALTER TABLE "ActiveUserSession" ADD CONSTRAINT "ActiveUserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
