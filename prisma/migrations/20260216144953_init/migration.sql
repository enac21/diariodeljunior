-- CreateTable
CREATE TABLE "Character" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "generatorVersion" INTEGER NOT NULL DEFAULT 1,
    "selectedParts" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_username_key" ON "Character"("username");

-- CreateIndex
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");
