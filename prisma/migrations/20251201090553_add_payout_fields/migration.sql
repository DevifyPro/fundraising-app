-- CreateEnum
CREATE TYPE "PayoutProvider" AS ENUM ('STRIPE', 'PAYPAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paypalMerchantId" TEXT,
ADD COLUMN     "paypalOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredPayoutProvider" "PayoutProvider",
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false;
