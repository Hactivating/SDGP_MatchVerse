-- CreateTable
CREATE TABLE "Temp" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Temp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "userImageUrl" TEXT,
    "venueName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Venue" (
    "venueId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "openingTime" INTEGER NOT NULL,
    "closingTime" INTEGER NOT NULL,
    "venueImageUrl" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "totalRating" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("venueId")
);

-- CreateTable
CREATE TABLE "Court" (
    "courtId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "venueId" INTEGER NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("courtId")
);

-- CreateTable
CREATE TABLE "Booking" (
    "bookingId" SERIAL NOT NULL,
    "courtId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "startingTime" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("bookingId")
);

-- CreateTable
CREATE TABLE "CourtImage" (
    "courtImageId" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "courtId" INTEGER NOT NULL,

    CONSTRAINT "CourtImage_pkey" PRIMARY KEY ("courtImageId")
);

-- CreateTable
CREATE TABLE "UserVenueRating" (
    "userRatingId" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "UserVenueRating_pkey" PRIMARY KEY ("userRatingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_email_key" ON "Venue"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_courtId_date_startingTime_key" ON "Booking"("courtId", "date", "startingTime");

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("venueId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("courtId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtImage" ADD CONSTRAINT "CourtImage_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("courtId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVenueRating" ADD CONSTRAINT "UserVenueRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVenueRating" ADD CONSTRAINT "UserVenueRating_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("venueId") ON DELETE RESTRICT ON UPDATE CASCADE;
