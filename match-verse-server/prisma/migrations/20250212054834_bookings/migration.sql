/*
  Warnings:

  - A unique constraint covering the columns `[courtId,date,startingTime]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Booking_courtId_date_startingTime_key" ON "Booking"("courtId", "date", "startingTime");
