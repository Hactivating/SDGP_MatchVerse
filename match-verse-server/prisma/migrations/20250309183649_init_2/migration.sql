/*
  Warnings:

  - You are about to drop the column `venueName` on the `User` table. All the data in the column will be lost.
  - Added the required column `venueName` to the `Venue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "venueName";

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "venueName" TEXT NOT NULL;
