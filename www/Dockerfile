FROM node:latest
WORKDIR /app
COPY . .
RUN npm install --only=prod
EXPOSE $PORT
ENTRYPOINT ["npm", "start"]
