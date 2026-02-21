-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "arrangementIndex" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Category_arrangementIndex_idx" ON "Category"("arrangementIndex");
