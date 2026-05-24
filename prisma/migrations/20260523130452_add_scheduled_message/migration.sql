-- CreateTable
CREATE TABLE "ScheduledMessage" (
    "id" UUID NOT NULL,
    "channelId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "s3ObjectKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scheduler_scheduledAt_idx" ON "ScheduledMessage"("scheduledAt");