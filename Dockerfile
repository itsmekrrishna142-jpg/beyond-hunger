FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Create non-root user
RUN adduser -D myuser
USER myuser

EXPOSE 5000

CMD ["node", "app.js"]