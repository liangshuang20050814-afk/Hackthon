PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'Other',
    "startsAt" DATETIME NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "imageUrl" TEXT,
    "creatorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Event" ("id", "title", "description", "location", "startsAt", "imageUrl")
SELECT "id", "title", "description", "location", "startsAt", "imageUrl" FROM "Event";

DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_startsAt_idx" ON "Event"("startsAt");
CREATE INDEX "Event_creatorId_idx" ON "Event"("creatorId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
