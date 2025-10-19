-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isVerfied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verifyTokenExp" TIMESTAMP(3);
