#!/bin/bash
npx prisma migrate dev
npx nodemon ./src/server.js
