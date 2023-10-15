FROM node:18.18.0-alpine3.18 AS base
WORKDIR /api
RUN apk update \
    && apk add bash \
    && rm -rf /var/cache/apk/*
COPY . .
RUN npm install
RUN npx prisma generate
RUN chmod +x ./scripts/wait-for-it.sh
RUN chmod +x ./scripts/dev-cmd.sh
RUN chmod +x ./scripts/test-cmd.sh
