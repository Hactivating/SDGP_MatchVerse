/*
  Warnings:

  - The primary key for the `Court` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Court` table. All the data in the column will be lost.
  - The primary key for the `Venue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Venue` table. All the data in the column will be lost.
  - Added the required column `closingTime` to the `Venue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openingTime` to the `Venue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Court" DROP CONSTRAINT "Court_venueId_fkey";

-- AlterTable
ALTER TABLE "Court" DROP CONSTRAINT "Court_pkey",
DROP COLUMN "id",
ADD COLUMN     "courtId" SERIAL NOT NULL,
ADD CONSTRAINT "Court_pkey" PRIMARY KEY ("courtId");

-- AlterTable
ALTER TABLE "Venue" DROP CONSTRAINT "Venue_pkey",
DROP COLUMN "id",
ADD COLUMN     "Venueid" SERIAL NOT NULL,
ADD COLUMN     "closingTime" INTEGER NOT NULL,
ADD COLUMN     "openingTime" INTEGER NOT NULL,
ADD CONSTRAINT "Venue_pkey" PRIMARY KEY ("Venueid");

-- CreateTable
CREATE TABLE "Booking" (
    "bookingId" SERIAL NOT NULL,
    "courtId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "startingTime" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("bookingId")
);

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("Venueid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("courtId") ON DELETE RESTRICT ON UPDATE CASCADE;
