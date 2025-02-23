/*
  Warnings:

  - You are about to drop the column `filePath` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "filePath",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
