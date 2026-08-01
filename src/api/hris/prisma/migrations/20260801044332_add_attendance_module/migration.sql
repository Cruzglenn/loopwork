-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('CLOCKED_IN', 'CLOCKED_OUT', 'ON_BREAK');

-- CreateEnum
CREATE TYPE "BreakType" AS ENUM ('LUNCH', 'SHORT_BREAK', 'PERSONAL', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ResourceType" ADD VALUE 'COMPANY_ATTENDANCE';
ALTER TYPE "ResourceType" ADD VALUE 'EMPLOYEE_ATTENDANCE';

-- CreateTable
CREATE TABLE "AttendanceLog" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clockIn" TIMESTAMP(3) NOT NULL,
    "clockOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'CLOCKED_IN',
    "totalWorkMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalBreakMinutes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceBreak" (
    "id" TEXT NOT NULL,
    "attendanceLogId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "type" "BreakType" NOT NULL DEFAULT 'LUNCH',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceBreak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttendanceLog_employeeId_date_idx" ON "AttendanceLog"("employeeId", "date");

-- CreateIndex
CREATE INDEX "AttendanceLog_date_idx" ON "AttendanceLog"("date");

-- CreateIndex
CREATE INDEX "AttendanceBreak_attendanceLogId_idx" ON "AttendanceBreak"("attendanceLogId");

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceBreak" ADD CONSTRAINT "AttendanceBreak_attendanceLogId_fkey" FOREIGN KEY ("attendanceLogId") REFERENCES "AttendanceLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
