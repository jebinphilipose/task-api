#!/bin/bash
npx prisma migrate reset --skip-seed -f
npx prisma migrate deploy
npx jest -i --verbose --coverage
