FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install --legacy-peer-deps && \
    npm install ajv@^8.12.0 --legacy-peer-deps

COPY . .

EXPOSE 3000

ENV REACT_APP_API_URL=http://localhost:8000
ENV WDS_SOCKET_PORT=0

CMD ["npm", "start"]
