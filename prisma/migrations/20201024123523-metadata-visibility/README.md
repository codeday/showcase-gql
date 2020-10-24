# Migration `20201024123523-metadata-visibility`

This migration has been generated by Tyler Menezes at 10/24/2020, 8:35:23 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE `Media` MODIFY `download` varchar(191)

ALTER TABLE `Metadata` ADD COLUMN `visibility` ENUM('PUBLIC', 'PRIVATE', 'ADMIN')  NOT NULL DEFAULT 'PUBLIC'
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20201023152017-composite-primary-keys..20201024123523-metadata-visibility
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
@@ -28,8 +28,14 @@
   DEMO
   PRESENTATION
 }
+enum MetadataVisibility {
+  PUBLIC
+  PRIVATE
+  ADMIN
+}
+
 model Project {
   id                String    @id @default(cuid())
   createdAt         DateTime  @default(now())
   updatedAt         DateTime  @updatedAt
@@ -99,8 +105,9 @@
   createdAt         DateTime  @default(now())
   updatedAt         DateTime  @updatedAt
   key         String
+  visibility  MetadataVisibility @default(PUBLIC)
   value       String?
   project     Project     @relation(fields: [projectId], references: [id])
   projectId   String
```

