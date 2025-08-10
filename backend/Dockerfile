FROM node:22

# Install Tesseract and ImageMagick
RUN apt-get update && apt-get install -y tesseract-ocr imagemagick

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]