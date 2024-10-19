-- CreateTable
CREATE TABLE "CO" (
    "subjectCode" TEXT NOT NULL,
    "MST1_Q1" TEXT NOT NULL,
    "MST1_Q2" TEXT NOT NULL,
    "MST1_Q3" TEXT NOT NULL,
    "MST2_Q1" TEXT NOT NULL,
    "MST2_Q2" TEXT NOT NULL,
    "MST2_Q3" TEXT NOT NULL,
    "Quiz_Assignment" TEXT[],

    CONSTRAINT "CO_pkey" PRIMARY KEY ("subjectCode")
);
