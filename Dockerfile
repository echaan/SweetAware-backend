# Gunakan Node.js versi LTS resmi
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json dulu (untuk caching dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy seluruh source code ke container
COPY . .

# Expose port (sama dengan yang di .env atau default 3000)
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "src/index.js"]
