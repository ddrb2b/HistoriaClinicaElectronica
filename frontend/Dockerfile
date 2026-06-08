FROM node:20-alpine

WORKDIR /app

COPY package.json .
<<<<<<< HEAD
RUN npm install --legacy-peer-deps && \
    npm install ajv@^8.12.0 --legacy-peer-deps
=======
RUN npm install --legacy-peer-deps
>>>>>>> 960fdbd05eccac84e1b71e81ff9593831f8122fa

COPY . .

EXPOSE 3000

ENV REACT_APP_API_URL=http://localhost:8000
ENV WDS_SOCKET_PORT=0

CMD ["npm", "start"]
