FROM node:20-alpine

WORKDIR /app

COPY /backend/package.json .

RUN npm install

COPY . .

EXPOSE 9999

CMD [ "npm", "start" ]