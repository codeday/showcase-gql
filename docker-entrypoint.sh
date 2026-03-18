#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  yarn prisma migrate deploy
fi

exec yarn start
