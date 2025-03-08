-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CourtImage" (
    "courtImageId" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "courtId" INTEGER NOT NULL,

    CONSTRAINT "CourtImage_pkey" PRIMARY KEY ("courtImageId")
);

-- AddForeignKey
ALTER TABLE "CourtImage" ADD CONSTRAINT "CourtImage_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("courtId") ON DELETE RESTRICT ON UPDATE CASCADE;
