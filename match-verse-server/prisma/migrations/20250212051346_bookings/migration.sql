/*
  Warnings:

  - The primary key for the `Venue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Venueid` on the `Venue` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Court" DROP CONSTRAINT "Court_venueId_fkey";

-- AlterTable
ALTER TABLE "Venue" DROP CONSTRAINT "Venue_pkey",
DROP COLUMN "Venueid",
ADD COLUMN     "venueId" SERIAL NOT NULL,
ADD CONSTRAINT "Venue_pkey" PRIMARY KEY ("venueId");

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("venueId") ON DELETE RESTRICT ON UPDATE CASCADE;
