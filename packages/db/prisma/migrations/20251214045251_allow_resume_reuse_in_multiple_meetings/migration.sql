/*
  Warnings:

  - You are about to drop the column `meetingId` on the `Resume` table. All the data in the column will be lost.
  - Added the required column `resumeId` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_meetingId_fkey";

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "resumeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "meetingId";

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
