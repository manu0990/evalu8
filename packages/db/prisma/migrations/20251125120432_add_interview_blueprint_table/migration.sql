-- CreateTable
CREATE TABLE "InterviewBlueprint" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "categories" JSONB NOT NULL,
    "rationale" TEXT NOT NULL,
    "initialNotes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewBlueprint_meetingId_key" ON "InterviewBlueprint"("meetingId");

-- AddForeignKey
ALTER TABLE "InterviewBlueprint" ADD CONSTRAINT "InterviewBlueprint_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
