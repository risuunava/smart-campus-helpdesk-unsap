FROM php:8.2-cli

# Install system dependencies dan PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd sockets

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy seluruh source code
COPY . .

# Install dependencies laravel
RUN composer install --no-interaction --optimize-autoloader

EXPOSE 8000

# Command untuk menjalankan server lokal laravel
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
