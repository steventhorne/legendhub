FROM node:latest
WORKDIR /app
COPY package* ./
RUN npm install --only=prod
EXPOSE $PORT
ENTRYPOINT ["npm", "start"]
