FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./api ./api
COPY ./prisma ./prisma

RUN npx prisma generate --schema=./prisma/schema.prisma

WORKDIR /app/api/configuration-rules

CMD ["node", "index.js"]
