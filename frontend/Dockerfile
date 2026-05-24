FROM node:20-alpine

WORKDIR /app

# Copy file requirements
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh source code
COPY . .

EXPOSE 3000

# Command untuk menjalankan Next.js di mode development
CMD ["npm", "run", "dev"]
