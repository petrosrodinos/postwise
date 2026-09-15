-- CreateEnum
CREATE TYPE "OrganisationMemberStatus" AS ENUM ('PENDING', 'ACTIVE');

-- AlterTable
ALTER TABLE "organisation_members" ADD COLUMN     "status" "OrganisationMemberStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "organisation_invite_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "organisation_member_id" TEXT NOT NULL,
    "invited_by_user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organisation_invite_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organisation_invite_tokens_token_hash_key" ON "organisation_invite_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "organisation_invite_tokens_organisation_member_id_idx" ON "organisation_invite_tokens"("organisation_member_id");

-- CreateIndex
CREATE INDEX "organisation_invite_tokens_expires_at_idx" ON "organisation_invite_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "organisation_invite_tokens" ADD CONSTRAINT "organisation_invite_tokens_organisation_member_id_fkey" FOREIGN KEY ("organisation_member_id") REFERENCES "organisation_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
