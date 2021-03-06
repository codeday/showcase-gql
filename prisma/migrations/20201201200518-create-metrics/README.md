# Migration `20201201200518-create-metrics`

This migration has been generated by Tyler Menezes at 12/1/2020, 3:05:18 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE `Metric` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` DECIMAL(65,30) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci

ALTER TABLE `Metric` ADD FOREIGN KEY (`projectId`, `username`) REFERENCES `Member`(`projectId`,`username`) ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE `Metric` ADD FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201123163119-add-programid..20201201200518-create-metrics
--- datamodel.dml
+++ datamodel.dml
@@ -1,7 +1,7 @@
 datasource db {
   provider = "mysql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider = "prisma-client-js"
@@ -112,4 +112,19 @@
   project     Project     @relation(fields: [projectId], references: [id])
   projectId   String
 }
+
+model Metric {
+  id                String      @id @default(cuid())
+  createdAt         DateTime    @default(now())
+  updatedAt         DateTime    @updatedAt
+
+  name        String
+  value       Float
+
+  member      Member            @relation(fields: [projectId, username], references: [projectId, username])
+  username    String
+
+  project     Project           @relation(fields: [projectId], references: [id])
+  projectId   String
+}
```


