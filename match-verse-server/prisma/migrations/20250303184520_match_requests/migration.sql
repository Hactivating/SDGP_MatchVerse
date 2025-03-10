-- CreateTable
CREATE TABLE "MatchRequest" (
    "requestId" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "matchType" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "partnerId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "MatchRequest_pkey" PRIMARY KEY ("requestId")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchRequest_bookingId_key" ON "MatchRequest"("bookingId");

-- AddForeignKey
ALTER TABLE "MatchRequest" ADD CONSTRAINT "MatchRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRequest" ADD CONSTRAINT "MatchRequest_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRequest" ADD CONSTRAINT "MatchRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE RESTRICT ON UPDATE CASCADE;
