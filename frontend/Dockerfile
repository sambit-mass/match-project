FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
RUN npm install -g @angular/cli

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
