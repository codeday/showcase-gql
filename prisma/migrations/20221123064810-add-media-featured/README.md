# Migration `20221123064810-add-media-featured`

This migration has been generated by Tyler Menezes at 11/23/2022, 6:48:10 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "Media" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false
```
