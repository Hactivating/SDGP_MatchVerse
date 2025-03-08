-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRating" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserVenueRating" (
    "userRatingId" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "UserVenueRating_pkey" PRIMARY KEY ("userRatingId")
);

-- AddForeignKey
ALTER TABLE "UserVenueRating" ADD CONSTRAINT "UserVenueRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVenueRating" ADD CONSTRAINT "UserVenueRating_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("venueId") ON DELETE RESTRICT ON UPDATE CASCADE;
