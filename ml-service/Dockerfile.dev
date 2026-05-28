FROM python:3.11-slim

WORKDIR /app

# Copy file requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh source code
COPY . .

EXPOSE 5000

# Command untuk menjalankan server FastAPI python
CMD ["python", "main.py"]
