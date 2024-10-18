/*
  Warnings:

  - You are about to drop the column `EndSem` on the `Sheet` table. All the data in the column will be lost.
  - You are about to drop the column `MST1` on the `Sheet` table. All the data in the column will be lost.
  - You are about to drop the column `MST2` on the `Sheet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sheet" DROP COLUMN "EndSem",
DROP COLUMN "MST1",
DROP COLUMN "MST2",
ADD COLUMN     "EndSem_Q1" INTEGER,
ADD COLUMN     "EndSem_Q2" INTEGER,
ADD COLUMN     "EndSem_Q3" INTEGER,
ADD COLUMN     "EndSem_Q4" INTEGER,
ADD COLUMN     "EndSem_Q5" INTEGER,
ADD COLUMN     "MST1_Q1" INTEGER,
ADD COLUMN     "MST1_Q2" INTEGER,
ADD COLUMN     "MST1_Q3" INTEGER,
ADD COLUMN     "MST2_Q1" INTEGER,
ADD COLUMN     "MST2_Q2" INTEGER,
ADD COLUMN     "MST2_Q3" INTEGER;
