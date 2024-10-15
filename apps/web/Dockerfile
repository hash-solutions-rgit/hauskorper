FROM node:20-alpine AS deps

COPY package.json ./

RUN yarn

FROM node:20-alpine AS builder

COPY . .
COPY --from=deps /node_modules ./node_modules
RUN yarn build

FROM node:20-alpine AS runner

COPY --from=builder /.next/standalone ./


EXPOSE 3000

ENV PORT 3000

CMD HOSTNAME="0.0.0.0" node server.js
