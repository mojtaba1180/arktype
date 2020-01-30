# Migration `20191117132902-init`

This migration has been generated by David Blass at 11/17/2019, 1:29:02 PM.
You can check out the [state of the datamodel](./datamodel.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "lift"."Tag"("id" TEXT NOT NULL  ,"name" TEXT NOT NULL DEFAULT '' ,"user" TEXT   REFERENCES "User"(id) ON DELETE SET NULL,"test" TEXT   REFERENCES "Test"(id) ON DELETE SET NULL,PRIMARY KEY ("id"))
;

CREATE TABLE "lift"."Step"("id" TEXT NOT NULL  ,"action" TEXT NOT NULL DEFAULT '' ,"selector" TEXT NOT NULL DEFAULT '' ,"value" TEXT NOT NULL DEFAULT '' ,"user" TEXT   REFERENCES "User"(id) ON DELETE SET NULL,"test" TEXT   REFERENCES "Test"(id) ON DELETE SET NULL,PRIMARY KEY ("id"))
;

CREATE TABLE "lift"."Test"("id" TEXT NOT NULL  ,"name" TEXT NOT NULL DEFAULT '' ,"user" TEXT   REFERENCES "User"(id) ON DELETE SET NULL,PRIMARY KEY ("id"))
;

CREATE TABLE "lift"."User"("id" TEXT NOT NULL  ,"email" TEXT NOT NULL DEFAULT '' ,"password" TEXT NOT NULL DEFAULT '' ,"firstName" TEXT NOT NULL DEFAULT '' ,"lastName" TEXT NOT NULL DEFAULT '' ,PRIMARY KEY ("id"))
;

CREATE TABLE "lift"."Session"("id" TEXT NOT NULL  ,"token" TEXT NOT NULL DEFAULT '' ,"user" TEXT   REFERENCES "User"(id) ON DELETE SET NULL,PRIMARY KEY ("id"))
;

CREATE UNIQUE INDEX "lift"."Tag.id._UNIQUE" ON "Tag"("id")

CREATE UNIQUE INDEX "lift"."Tag.name._UNIQUE" ON "Tag"("name")

CREATE UNIQUE INDEX "lift"."Step.id._UNIQUE" ON "Step"("id")

CREATE UNIQUE INDEX "lift"."Test.id._UNIQUE" ON "Test"("id")

CREATE UNIQUE INDEX "lift"."Test.name._UNIQUE" ON "Test"("name")

CREATE UNIQUE INDEX "lift"."User.id._UNIQUE" ON "User"("id")

CREATE UNIQUE INDEX "lift"."User.email._UNIQUE" ON "User"("email")

CREATE UNIQUE INDEX "lift"."Session.id._UNIQUE" ON "Session"("id")
```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration ..20191117132902-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,49 @@
+datasource db {
+  provider = "sqlite"
+  url      = "file:dev.db"
+  default  = true
+}
+
+generator photon {
+  provider = "photonjs"
+}
+
+model Tag {
+  id String @default(cuid()) @id @unique
+  name String @unique
+  user User
+}
+
+model Step {
+  id String @default(cuid()) @id @unique
+  action String
+  selector String
+  value String
+  user User
+}
+
+model Test {
+  id String @default(cuid()) @id @unique
+  user User
+  name String @unique
+  tags Tag[]
+  steps Step[]
+}
+
+model User {
+  id String @default(cuid()) @id @unique
+  email String @unique
+  password String
+  firstName String
+  lastName String
+  tags Tag[]
+  tests Test[]
+  steps Step[]
+}
+
+model Session {
+  id String @default(cuid()) @id @unique
+  token String
+  user User
+}
+
```

## Photon Usage

You can use a specific Photon built for this migration (20191117132902-init)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/20191117132902-init'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```